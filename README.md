# Controle de Gastos Residenciais

Aplicação web desenvolvida para cadastrar moradores, registrar receitas e despesas e acompanhar o saldo financeiro de uma residência.

O projeto foi desenvolvido como desafio técnico utilizando uma API em ASP.NET Core integrada a uma interface em React com TypeScript.

## Funcionalidades

- Cadastro de pessoas
- Listagem de pessoas cadastradas
- Exclusão de pessoas
- Cadastro de receitas
- Cadastro de despesas
- Listagem do histórico de transações
- Atualização dos dados financeiros
- Cálculo automático de receitas
- Cálculo automático de despesas
- Cálculo automático do saldo residencial
- Validação dos dados informados
- Persistência dos dados em banco SQLite
- Integração entre frontend e backend

## Regras de negócio

- O nome da pessoa é obrigatório.
- O nome deve possuir entre 2 e 100 caracteres.
- A idade deve estar entre 0 e 130 anos.
- Pessoas menores de 18 anos somente podem possuir transações do tipo despesa.
- O valor da transação deve ser maior que zero.
- A descrição da transação é obrigatória.
- A pessoa informada na transação deve existir.
- Receitas são adicionadas ao saldo.
- Despesas são subtraídas do saldo.
- Ao excluir uma pessoa, suas informações são removidas conforme as regras da aplicação.

## Tecnologias utilizadas

### Backend

- C#
- ASP.NET Core Web API
- Entity Framework Core
- SQLite
- .NET

### Frontend

- React
- TypeScript
- Vite
- CSS
- Fetch API

### Ferramentas

- Visual Studio Code
- Git
- GitHub
- PowerShell
- REST Client

## Estrutura do projeto

```text
controle-gastos-residenciais
├── backend
│   └── ControleGastos.Api
│       ├── Controllers
│       ├── Data
│       ├── DTOs
│       │   ├── People
│       │   └── Transactions
│       ├── Enums
│       ├── Migrations
│       ├── Models
│       ├── Services
│       ├── Program.cs
│       ├── appsettings.json
│       └── ControleGastos.Api.csproj
├── frontend
│   ├── public
│   ├── src
│   │   ├── assets
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── .gitignore
├── ControleGastosResidenciais.slnx
└── README.md
```

## Como executar o projeto

Para utilizar a aplicação, o backend e o frontend devem permanecer em execução ao mesmo tempo.

### Pré-requisitos

Antes de executar o projeto, é necessário possuir:

- .NET SDK instalado
- Node.js instalado
- npm instalado
- Git instalado

## Executando o backend

Abra um terminal na raiz do projeto e acesse a pasta da API:

```powershell
cd backend\ControleGastos.Api
```

Restaure as dependências:

```powershell
dotnet restore
```

Execute as migrations no banco de dados, caso necessário:

```powershell
dotnet ef database update
```

Inicie a API:

```powershell
dotnet run
```

A API será iniciada em:

```text
http://localhost:5288
```

A rota principal da API não possui uma página visual. Por isso, acessar apenas `http://localhost:5288` pode retornar erro 404.

Para testar os dados diretamente, utilize:

```text
http://localhost:5288/api/people
```

ou:

```text
http://localhost:5288/api/transactions
```

## Executando o frontend

Abra outro terminal e acesse a pasta do frontend:

```powershell
cd frontend
```

Instale as dependências:

```powershell
npm install
```

Inicie o servidor do Vite:

```powershell
npm run dev
```

A aplicação será disponibilizada em:

```text
http://localhost:5173
```

## Endpoints da API

### Pessoas

#### Listar pessoas

```http
GET /api/people
```

#### Cadastrar pessoa

```http
POST /api/people
```

#### Excluir pessoa

```http
DELETE /api/people/{id}
```

### Transações

#### Listar transações

```http
GET /api/transactions
```

#### Cadastrar transação

```http
POST /api/transactions
```

## Exemplos de requisições

### Cadastrar uma pessoa adulta

```json
{
  "name": "Ana Souza",
  "age": 32
}
```

### Cadastrar uma pessoa menor de idade

```json
{
  "name": "Pedro Lima",
  "age": 16
}
```

### Cadastrar uma receita

```json
{
  "description": "Salário",
  "amount": 3000,
  "type": "Income",
  "personId": 1
}
```

### Cadastrar uma despesa

```json
{
  "description": "Mercado",
  "amount": 450,
  "type": "Expense",
  "personId": 1
}
```

### Cadastrar uma despesa para menor de idade

```json
{
  "description": "Material escolar",
  "amount": 80,
  "type": "Expense",
  "personId": 3
}
```

## Exemplos de validação

### Nome vazio

```json
{
  "name": "",
  "age": 25
}
```

Resultado esperado:

```text
400 Bad Request
O nome é obrigatório.
```

### Idade inválida

```json
{
  "name": "Pessoa inválida",
  "age": 150
}
```

Resultado esperado:

```text
400 Bad Request
A idade deve estar entre 0 e 130 anos.
```

### Valor inválido

```json
{
  "description": "Valor inválido",
  "amount": 0,
  "type": "Expense",
  "personId": 1
}
```

Resultado esperado:

```text
400 Bad Request
O valor deve ser maior que zero.
```

### Receita para menor de idade

```json
{
  "description": "Mesada",
  "amount": 100,
  "type": "Income",
  "personId": 3
}
```

Resultado esperado:

```text
400 Bad Request
Pessoas menores de 18 anos só podem possuir despesas.
```

### Pessoa inexistente

```json
{
  "description": "Teste",
  "amount": 50,
  "type": "Expense",
  "personId": 999
}
```

Resultado esperado:

```text
404 Not Found
Pessoa não encontrada.
```

## Interface da aplicação

A interface apresenta:

- título e descrição do sistema;
- resumo do total de receitas;
- resumo do total de despesas;
- saldo financeiro atual;
- formulário para cadastro de moradores;
- formulário para cadastro de transações;
- seleção da pessoa responsável pela movimentação;
- histórico de receitas e despesas;
- identificação visual de entradas e saídas;
- lista de pessoas cadastradas;
- opção de exclusão de moradores;
- mensagens de sucesso e erro;
- botão para atualização dos dados.

## Integração entre frontend e backend

O frontend realiza requisições para a API utilizando o endereço:

```text
http://localhost:5288
```

O sistema consulta os endpoints de pessoas e transações para atualizar automaticamente:

- moradores cadastrados;
- histórico financeiro;
- total de receitas;
- total de despesas;
- saldo disponível.

## Banco de dados

O projeto utiliza SQLite para armazenar os dados.

O arquivo do banco é criado dentro da pasta do backend:

```text
backend/ControleGastos.Api/controle-gastos.db
```

Os arquivos temporários do SQLite, como `.db-shm` e `.db-wal`, são ignorados pelo Git.

## Controle de versão

O projeto utiliza Git e GitHub para controle de versão.

Exemplo de comandos utilizados:

```powershell
git add .
git commit -m "feat: implementa interface React para controle de gastos"
git push
```

## Possíveis melhorias futuras

- Edição de pessoas cadastradas
- Edição e exclusão de transações
- Filtro de transações por pessoa
- Filtro por receitas e despesas
- Busca por nome
- Paginação do histórico
- Confirmação visual antes da exclusão
- Autenticação de usuários
- Relatórios mensais
- Gráficos financeiros
- Testes automatizados
- Dockerização da aplicação
- Publicação do frontend e da API

## Autora

Desenvolvido por **Sara Oliveira**.