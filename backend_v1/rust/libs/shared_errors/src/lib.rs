use thiserror::Error;

#[derive(Debug, Error)]
pub enum LibError {
    #[error("Value error: {0}")]
    ValueError(String),
    #[error("Value error: {0}")]
    ParseError(String),
}
