use chrono::NaiveDate;
use regex::Regex;
use serde::{Deserialize, Serialize};
use shared_errors::LibError::{self, ValueError};
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Birthday {
    date: NaiveDate,
    hidden: bool,
}
