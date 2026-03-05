FROM rust:1.91 as builder
WORKDIR /app
COPY SocketServiceRust/ ./SocketServiceRust/
WORKDIR /app/SocketServiceRust
RUN cargo build --release

FROM debian:bookworm-slim
WORKDIR /app
COPY --from=builder /app/SocketServiceRust/target/release/SocketServiceRust .
EXPOSE 3000
CMD ["./SocketServiceRust"]
