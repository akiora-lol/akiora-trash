use tonic::{Request, Response, Status};

use crate::qwer::hw::{GetAccountRequest, SimpleAccountResponse, parser_server::Parser};

pub mod hw {
    tonic::include_proto!("api.parser.v1");
}

#[derive(Debug, Default)]
pub struct Mg {}

#[tonic::async_trait]
impl Parser for Mg {
    async fn get_account(
        &self,
        request: Request<GetAccountRequest>,
    ) -> Result<Response<SimpleAccountResponse>, tonic::Status> {
        let inner_msg = request.into_inner();

        let reply = SimpleAccountResponse {
            icon_id: inner_msg.user_id.clone(),
        };
        Ok(Response::new(reply))
    }
}
