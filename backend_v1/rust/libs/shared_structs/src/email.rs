use regex::Regex;
use serde::{Deserialize, Serialize};
use shared_errors::LibError::{self, ValueError};
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Email(String);

impl Email {
    pub fn new(email: String) -> Result<Self, LibError> {
        let email_regex: Regex = Regex::new(r"^[\w\.-]+@[\w\.-]+\.\w+$")
            .map_err(|e| LibError::ParseError(e.to_string()))?;
        if email_regex.is_match(&email) {
            Ok(Self(email))
        } else {
            Err(ValueError(format!("Email is not valid: {email}")))
        }
    }
}
