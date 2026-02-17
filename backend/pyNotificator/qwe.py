from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from contextlib import asynccontextmanager

from backend.pyNotificator.qw import EnterpriseWebSocketPubSub

app = FastAPI()
ws_manager = EnterpriseWebSocketPubSub()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await ws_manager.start()
    yield
    # Shutdown
    await ws_manager.cleanup()


app = FastAPI(lifespan=lifespan)


@app.websocket("/ws/{channel}")
async def websocket_endpoint(websocket: WebSocket, channel: str):
    await websocket.accept()

    try:
        # Подписка на канал
        await ws_manager.subscribe(channel, websocket)

        # Обработка входящих сообщений от клиента
        async for message in websocket.iter_json():
            # Публикация в Redis
            await ws_manager.publish(
                channel,
                {
                    "channel": channel,
                    "data": message,
                    "timestamp": datetime.now().isoformat(),
                },
            )

    except WebSocketDisconnect:
        # Автоматическая отписка
        await ws_manager.unsubscribe_all(websocket)
