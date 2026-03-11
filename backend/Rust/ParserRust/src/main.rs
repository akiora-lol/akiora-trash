use tonic::transport::Server;

use crate::qwer::hw::parser_server::ParserServer;

mod qwer;
use qwer::Mg;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let addr = "[::1]:50051".parse()?;
    let mgs = Mg::default();
    Server::builder()
        .add_service(ParserServer::new(mgs))
        .serve(addr)
        .await?;
    Ok(())
}
