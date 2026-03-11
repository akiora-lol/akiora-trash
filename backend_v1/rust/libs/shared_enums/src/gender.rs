use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Default, Clone, Copy)]
pub enum Gender {
    #[default]
    ANY,
    MALE,
    FEMALE,
}
