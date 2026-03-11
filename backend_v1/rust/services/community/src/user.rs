use std::net::ToSocketAddrs;

use chrono::{DateTime, Utc};
use mongodb::Collection;
use serde::{Deserialize, Serialize};
use shared_enums::{Gender, Social};
use shared_services::{DataService, MongoRepository};
use shared_structs::{Birthday, Email};
use uuid::Uuid;

#[derive(Clone, Serialize, Deserialize)]
pub struct User {
    id: Uuid,
    email: Email,
    bio: String,
    nickname: String,
    gender: Gender,
    birthday: Birthday,
    created_at: DateTime<Utc>,
    socials: Vec<Social>,
    last_updated: DateTime<Utc>,
}

pub type UserRepo = MongoRepository<User>;
pub type UserSerivce = DataService<User>;
