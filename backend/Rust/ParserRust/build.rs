// build.rs
fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Компилируем proto-файлы через protox (без protoc!)
    let file_descriptors = protox::compile(
        ["api/parser/v1/services.proto"], // путь относительно корня include
        ["../../proto"], // корневая директория для поиска импортов (там где лежит папка proto)
    )?;
    // Используем сгенерированный FileDescriptorSet в prost
    tonic_prost_build::compile_fds(file_descriptors)?;

    Ok(())
}
