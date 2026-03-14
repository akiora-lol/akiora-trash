backend_dir := justfile_directory() + "/backend_v1/rust"
proto_build := backend_dir + "/proto_build"
draft := backend_dir + "/services/draft"

proto:
    @cd {{ proto_build }} && cargo build

draft:
    @cd {{ draft }} && cargo run
check:
    @cd {{ backend_dir }} && cargo check --workspace
