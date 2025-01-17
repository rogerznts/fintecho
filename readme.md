# Extrator de Dados OFX

Este projeto é um extrator de dados de arquivos OFX (Open Financial Exchange) que processa extratos bancários baixados através do Gmail e os envia para uma planilha do Google Sheets.


## 🚀 Funcionalidades

Leitura de arquivos OFX atravé do Gmail
Classificação automática de transações
Integração com Google Sheets
Processamento de múltiplos arquivos
Suporte a diferentes bancos (Banco Inter, Nubank)


## 📋 Pré-requisitos

- Deno 2
- Conta Google com acesso à API do Google Sheets e Gmail
- Arquivo `.env` configurado


## ⚙️ Configuração


1. Clone o repositório

2. Crie um arquivo `.env` com as seguintes variáveis:
```
SPREADSHEET_ID=seu_id_da_planilha
SHEET_RANGE=intervalo_da_planilha
SHEET_IN=nome_aba_entrada
SHEET_OUT=nome_aba_saida
```

3. Configure as credenciais do Google Sheets

## 🛠️ Instalação

```bash
# Instalar dependências
deno cache main.ts

# Executar o projeto
deno run --allow-net --allow-env --allow-read --allow-write --allow-run main.ts

# Compilar o projeto
deno compile --allow-net --allow-env --allow-read --allow-write --allow-run main.ts
```

## 📦 Estrutura do Projeto

```
.
├── main.ts                 # Ponto de entrada
├── src/
│   ├── ofxParser.ts       # Parser de arquivos OFX
│   ├── auth.ts            # Autenticação Google
│   ├── googleSheets.ts    # Integração com Google Sheets
│   ├── getAttachments.ts  # Busca de anexos no gmail
│   └── classifyTransaction.ts # Classificação de transações
├── workdir/               # Diretório de trabalho
└── .env                   # Variáveis de ambiente
```

## 🧪 Testes

Para executar os testes, você pode usar os seguintes comandos no terminal:

```bash
deno test --allow-read --allow-env
```

2. Executar um teste específico:
```bash
deno test --allow-read --allow-env --filter "deve classificar transações corretamente"
```

3. Executar com cobertura de código:
```bash
deno test --allow-read --allow-env --coverage
```

4. Executar em modo watch (para desenvolvimento):
```bash
deno test --allow-read --allow-env --watch
```


## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia as diretrizes de contribuição antes de enviar um PR.

## 📄 Licença

Este projeto está sob a licença MIT.


## 🔍 Referências

- [Deno](https://deno.com/)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Google Gmail API](https://developers.google.com/gmail/api)
- [Google OAuth2](https://developers.google.com/oauthplayground)
