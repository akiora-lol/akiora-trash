use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Default, Clone)]
pub enum Social {
    #[default]
    ANY,
    VKONTAKTE(String),
    TELEGRAM(String),
    DISCORD(String),
    TWITCH(String),
    YOUTUBE(String),
}
