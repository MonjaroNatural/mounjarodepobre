#!/bin/bash

# Define o nome do arquivo ZIP de saída
OUTPUT_FILE="Mounjaro-Project-Source.zip"
# Define o nome da pasta de origem temporária
SOURCE_DIR="project_source"

# Limpa arquivos antigos, se existirem
rm -f "$OUTPUT_FILE"
rm -rf "$SOURCE_DIR"

# Cria a pasta de origem
mkdir -p "$SOURCE_DIR"

# Copia os arquivos e pastas essenciais do projeto para a pasta de origem
# Adicione ou remova itens desta lista conforme necessário
cp -R src "$SOURCE_DIR/"
cp -R public "$SOURCE_DIR/"
cp package.json "$SOURCE_DIR/"
cp package-lock.json "$SOURCE_DIR/"
cp tailwind.config.ts "$SOURCE_DIR/"
cp tsconfig.json "$SOURCE_DIR/"
cp next.config.ts "$SOURCE_DIR/"
cp components.json "$SOURCE_DIR/"
cp .gitignore "$SOURCE_DIR/"
cp README.md "$SOURCE_DIR/"
cp apphosting.yaml "$SOURCE_DIR/"


# Cria o arquivo ZIP a partir da pasta de origem
zip -r "$OUTPUT_FILE" "$SOURCE_DIR"

# Limpa a pasta de origem temporária
rm -rf "$SOURCE_DIR"

echo "------------------------------------------------"
echo "Projeto compactado com sucesso em: $OUTPUT_FILE"
echo "------------------------------------------------"
echo "Agora você pode baixar o arquivo '$OUTPUT_FILE' do explorador de arquivos."
echo "------------------------------------------------"

