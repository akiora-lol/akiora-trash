use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        State, Query,
    },
    response::IntoResponse,
    routing::get,
    Router,
};
use futures::{sink::SinkExt, stream::StreamExt};
use redis::AsyncCommands;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{broadcast, mpsc, Mutex, RwLock};


// Типы сообщений
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "payload")]
enum WebSocketMessage {
    Subscribe { channels: Vec<String> },
    Publish { channel: String, data: String },
    Ping,
    Pong,
}

// Тип идентификатора клиента
#[derive(Debug, Clone, Hash, Eq, PartialEq)]
enum ClientId {
    Named(String),
    Anonymous(usize),
}

impl ClientId {
    fn to_string(&self) -> String {
        match self {
            ClientId::Named(name) => format!("named:{}", name),
            ClientId::Anonymous(id) => format!("anon:{}", id),
        }
    }
}


#[derive(Debug, Clone)]
struct ClientInfo {
    id: ClientId,
    subscribed_channels: Vec<String>,
    connected_at: chrono::DateTime<chrono::Utc>,
}


struct AppState {
    redis_tx: broadcast::Sender<(String, String)>,
    redis_queue: mpsc::Sender<(String, String, Option<String>)>, // (channel, message, client_id)
    clients: Arc<RwLock<HashMap<ClientId, ClientInfo>>>,
    next_anon_id: Mutex<usize>,
}

// Параметры запроса для WebSocket
#[derive(Debug, Deserialize)]
struct WebSocketParams {
    client_id: Option<String>,
}

#[tokio::main]
async fn main() {


    // Подключение к Redis
    let redis_client = redis::Client::open("redis://redis:6379/").unwrap();
    
    // Создаем каналы
    let (redis_tx, _) = broadcast::channel(100);
    let (redis_queue_tx, redis_queue_rx) = mpsc::channel(100);

    // Состояние приложения
    let state = Arc::new(AppState {
        redis_tx: redis_tx.clone(),
        redis_queue: redis_queue_tx,
        clients: Arc::new(RwLock::new(HashMap::new())),
        next_anon_id: Mutex::new(1),
    });

    // Запускаем фоновые задачи
    tokio::spawn(redis_subscriber(redis_client.clone(), redis_tx));
    tokio::spawn(redis_publisher(redis_client.clone(), redis_queue_rx, state.clone()));

    // Строим роутер с query параметрами
    let app = Router::new()
        .route("/ws", get(websocket_handler))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await
        .unwrap();
    
    println!("Сервер запущен на http://127.0.0.1:3000");
    axum::serve(listener, app).await.unwrap();
}

// Обработчик вебсокет подключений с query параметрами
async fn websocket_handler(
    ws: WebSocketUpgrade,
    Query(params): Query<WebSocketParams>,
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    ws.on_upgrade(|socket| handle_socket(socket, state, params.client_id))
}

// Обработка конкретного сокета
async fn handle_socket(socket: WebSocket, state: Arc<AppState>, provided_id: Option<String>) {
    // Определяем ID клиента
    let client_id = match provided_id {
        Some(id) if !id.is_empty() => ClientId::Named(id),
        _ => {
            let mut next_id = state.next_anon_id.lock().await;
            let id = *next_id;
            *next_id += 1;
            ClientId::Anonymous(id)
        }
    };

    let client_id_string = client_id.to_string();
    println!("Клиент {} подключился", client_id_string);

    // Создаем информацию о клиенте
    let client_info = ClientInfo {
        id: client_id.clone(),
        subscribed_channels: Vec::new(),
        connected_at: chrono::Utc::now(),
    };

    // Регистрируем клиента
    {
        let mut clients = state.clients.write().await;
        clients.insert(client_id.clone(), client_info);
    }

    // Подписываемся на broadcast канал
    let mut redis_rx = state.redis_tx.subscribe();

    // Разделяем сокет
    let (mut ws_tx, mut ws_rx) = socket.split();

    // Канал для отправки сообщений конкретному клиенту
    let (client_tx, mut client_rx) = mpsc::channel::<String>(32);

    // Задача для отправки сообщений клиенту
    let mut send_task = tokio::spawn(async move {
        while let Some(msg) = client_rx.recv().await {
            if ws_tx.send(Message::from(msg)).await.is_err() {
                break;
            }
        }
    });

    // Задача для получения сообщений от клиента
    let client_tx_clone = client_tx.clone();
    let state_clone = state.clone();
    let client_id_clone = client_id.clone();
    
    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(msg)) = ws_rx.next().await {
            match msg {
                Message::Text(text) => {
                    if let Ok(ws_msg) = serde_json::from_str::<WebSocketMessage>(&text) {
                        match ws_msg {
                            WebSocketMessage::Publish { channel, data } => {
                                // Отправляем в Redis стрим с указанием отправителя
                                let client_id_str = match &client_id_clone {
                                    ClientId::Named(name) => Some(name.clone()),
                                    ClientId::Anonymous(_) => None,
                                };
                                
                                if let Err(e) = state_clone.redis_queue.send((channel, data, client_id_str)).await {
                                    println!("Ошибка отправки в Redis очередь: {}", e);
                                }
                            }
                            WebSocketMessage::Subscribe { channels } => {
                                // Обновляем подписки клиента
                                let mut clients = state_clone.clients.write().await;
                                if let Some(info) = clients.get_mut(&client_id_clone) {
                                    info.subscribed_channels = channels.clone();
                                    println!("Клиент {} подписался на каналы: {:?}", 
                                          client_id_clone.to_string(), channels);
                                }
                                
                                // Отправляем подтверждение
                                let response = serde_json::json!({
                                    "type": "subscribed",
                                    "channels": channels
                                });
                                if client_tx_clone.send(response.to_string()).await.is_err() {
                                    break;
                                }
                            }
                            WebSocketMessage::Ping => {
                                let pong = serde_json::to_string(&WebSocketMessage::Pong).unwrap();
                                if client_tx_clone.send(pong).await.is_err() {
                                    break;
                                }
                            }
                            _ => {
                                println!("{:?}",ws_msg)
                            }
                        }
                    }
                }
                Message::Close(_) => break,
                _ => {}
            }
        }
    });

    // Задача для получения сообщений из Redis
    let client_tx_clone = client_tx.clone();
    let state_clone = state.clone();
    let client_id_clone = client_id.clone();
    
    let mut redis_task = tokio::spawn(async move {
        while let Ok((channel, message)) = redis_rx.recv().await {
            // Проверяем, подписан ли клиент на этот канал
            let is_subscribed = {
                let clients = state_clone.clients.read().await;
                if let Some(info) = clients.get(&client_id_clone) {
                    info.subscribed_channels.is_empty() || // Пустой список = подписка на все
                    info.subscribed_channels.contains(&channel) ||
                    info.subscribed_channels.contains(&"*".to_string()) // * = все каналы
                } else {
                    false
                }
            };

            if is_subscribed {
                let ws_msg = serde_json::json!({
                    "type": "notification",
                    "channel": channel,
                    "data": message
                });
                
                if client_tx_clone.send(ws_msg.to_string()).await.is_err() {
                    break;
                }
            }
        }
    });

    // Ждем завершения
    tokio::select! {
        _ = (&mut send_task) => {}
        _ = (&mut recv_task) => {}
        _ = (&mut redis_task) => {}
    }

    // Отменяем задачи
    send_task.abort();
    recv_task.abort();
    redis_task.abort();

    // Удаляем клиента
    let mut clients = state.clients.write().await;
    clients.remove(&client_id);
    println!("Клиент {} отключился", client_id_string);
}

// Фоновая задача: подписка на Redis канал "notifications_channel"
async fn redis_subscriber(
    client: redis::Client,
    tx: broadcast::Sender<(String, String)>,
) {
    let mut conn = client.get_async_pubsub().await.expect("failed to connect");
    
    if let Err(e) = conn.subscribe("notifications_channel").await {
        println!("Ошибка подписки на Redis канал: {}", e);
        return;
    }
    
    println!("Подписались на Redis канал 'notifications_channel'");

    let mut stream = conn.on_message();
    
    while let Some(msg) = stream.next().await {
        let channel = msg.get_channel_name().to_string();
        let payload: String = match msg.get_payload() {
            Ok(p) => p,
            Err(e) => {
                println!("Ошибка получения payload: {}", e);
                continue;
            }
        };
        
        if let Err(e) = tx.send((channel, payload)) {
            println!("Ошибка отправки в broadcast канал: {}", e);
        }
    }
}

// Фоновая задача: публикация в Redis стрим "stream_socket_result"
async fn redis_publisher(
    client: redis::Client,
    mut rx: mpsc::Receiver<(String, String, Option<String>)>,
    state: Arc<AppState>,
) {
    let mut conn = match client.get_multiplexed_async_connection().await {
        Ok(conn) => conn,
        Err(e) => {
            println!("Ошибка подключения к Redis: {}", e);
            return;
        }
    };
    
    while let Some((channel, message, client_id_opt)) = rx.recv().await {
        // Формируем данные для стрима
        let mut fields = vec![
            ("value", message.as_str()),
            ("source_channel", channel.as_str()),
        ];
        
        // Добавляем client_id если он есть (для именованных клиентов)
        if let Some(ref client_id) = client_id_opt {
            fields.push(("client_id", client_id.as_str()));
        }
        
        // Публикуем в стрим
        let id: Result<(), _> = conn.xadd(
            "stream_socket_result",
            "*",
            &fields
        ).await;
        
        match id {
            Ok(stream_id) => {
                println!(
                    "Отправлено в стрим 'stream_socket_result' с ID {:?}: {} (от клиента: {})", 
                    stream_id, 
                    message, 
                    client_id_opt.unwrap_or_else(|| "анонимный".to_string())
                );
                
                // Публикуем уведомление в канал
                match conn.publish::<_, _, i32>("notifications_channel", &message).await {
                    Ok(_) => {
                        println!("Опубликовано в канал 'notifications_channel': {}", message);
                    }
                    Err(e) => {
                        println!("Ошибка публикации в Redis канал: {}", e);
                    }
                }
            }
            Err(e) => {
                println!("Ошибка отправки в Redis стрим: {}", e);
            }
        }
    }
}
