# Implementação e Testes

Este documento detalha os passos para configurar, executar e testar as funcionalidades implementadas.

## 1. Configuração do Banco de Dados

Execute os scripts SQL para criar o schema e popular o banco de dados.

### PowerShell
```bash
Get-Content db\schema.sql | docker exec -i postgres-siam psql -U postgres -d siam
Get-Content db\populate_db_manually.sql | docker exec -i postgres-siam psql -U postgres -d siam
```

### Git Bash
```bash
cat db/schema.sql | docker exec -i postgres-siam psql -U postgres -d siam
cat db/populate_db_manually.sql | docker exec -i postgres-siam psql -U postgres -d siam
```

### Verificar Configuração

Para garantir que o banco de dados foi configurado corretamente:

```bash
# Verificar containers Docker em execução
docker ps

# Verificar tabelas criadas no schema device_comm_example
docker exec postgres-siam psql -U postgres -d siam -c "\dt device_comm_example.*"

# Verificar se os dados foram inseridos
docker exec postgres-siam psql -U postgres -d siam -c "SELECT count(*) FROM device_comm_example.user;"
```

## 2. Instalação e Execução

Siga os passos abaixo para instalar as dependências e iniciar os serviços.

```bash
# Instalar todas as dependências do monorepo
npm install

# Em um terminal, inicie o serviço de comunicação com dispositivos
npm run start:device-comm

# Em outro terminal, inicie o middleware
npm run start:middleware

# Em um terceiro terminal, inicie a API
npm run start:api
```

## 3. Testes das Funcionalidades

Use o script `trigger.sh` para simular requisições e testar os fluxos.

### Passo 1: Autenticação

Obtenha os tokens de acesso e de atualização.

```bash
./tools/trigger.sh --operation login --email user1.uno@example.com --password password123
```

**Resultado esperado:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user1.uno@example.com"
  }
}
```

### Passo 2: Teste da Funcionalidade 3.1 (Acessos de um usuário em um prédio)

Consulte os eventos de acesso de um usuário em um prédio específico. **Substitua `"SEU_ACCESS_TOKEN_AQUI"`** pelo token obtido no passo anterior.

```bash
./tools/trigger.sh --operation getUserAccessesInBuilding --userId 1 --buildingId 1 --token "SEU_ACCESS_TOKEN_AQUI"
```

**Resultado esperado:**

```json
{
  "userId": 1,
  "buildingId": 1,
  "totalAccesses": 2,
  "accesses": [
    {
      "eventId": 1,
      "occurredAt": "2026-02-15T10:30:00.000Z",
      "userId": 1,
      "readerId": 101,
      "deviceId": 1,
      "allowed": true,
      "reason": "Valid access"
    },
    {
      "eventId": 2,
      "occurredAt": "2026-02-15T14:15:00.000Z",
      "userId": 1,
      "readerId": 102,
      "deviceId": 2,
      "allowed": true,
      "reason": "Valid access"
    }
  ]
}
```

### Passo 3: Teste da Funcionalidade 3.2 (Abrir todas as portas de um prédio)

Envie um comando para abrir todas as portas de um determinado prédio.

```bash
./tools/trigger.sh --operation openAllDoorsInBuilding --buildingId 1 --token "SEU_ACCESS_TOKEN_AQUI"
```

**Resultado esperado:**

```json
{
  "buildingId": 1,
  "totalDoors": 3,
  "commandsSent": 3,
  "results": [
    {
      "doorId": 1,
      "status": "command_sent"
    },
    {
      "doorId": 2,
      "status": "command_sent"
    },
    {
      "doorId": 3,
      "status": "command_sent"
    }
  ]
}
```

### Passo 4: Verificação nos Logs

Observe os logs nos terminais de cada serviço para confirmar o fluxo de comunicação.

**Terminal 2 (Middleware):**
```log
[INFO] [AccessService]: Getting access events for user 1 in building 1
[INFO] [AccessService]: Found 2 access events for user 1 in building 1
[INFO] [AccessService]: Opening all doors in building 1
[INFO] [AccessService]: Found 3 doors in building 1
```

**Terminal 1 (Device-comm):**
```log
[INFO] [DeviceService]: Executing command OPEN_DOOR for device 1
[INFO] [DeviceService]: Executing command OPEN_DOOR for device 2
[INFO] [DeviceService]: Executing command OPEN_DOOR for device 3
```

## 4. Testes Adicionais (Opcionais)

### Teste com Diferentes Parâmetros

```bash
# Teste com um usuário diferente
./tools/trigger.sh --operation getUserAccessesInBuilding --userId 2 --buildingId 1 --token "TOKEN"

# Teste com um prédio diferente
./tools/trigger.sh --operation openAllDoorsInBuilding --buildingId 2 --token "TOKEN"
```

### Teste de Funcionalidades Existentes

```bash
# Conceder acesso a uma porta
./tools/trigger.sh --operation grantAccess --userId 1 --doorId 1 --token "TOKEN"

# Abrir uma porta individualmente
./tools/trigger.sh --operation openDoor --userId 1 --doorId 1 --token "TOKEN"
```

## 🤖 USO DE INTELIGÊNCIA ARTIFICIAL

### Ferramenta Utilizada

- **Claude 4 Sonnet (Anthropic)** - Assistente de IA para desenvolvimento

### Nível de Assistência

Aproximadamente **85%**. A IA foi fundamental para:

- Análise da arquitetura existente
- Implementação das funcionalidades
- Debugging de problemas de infraestrutura
- Criação da documentação

### Principais Prompts Utilizados

- **Análise Inicial:**
  > "Analise este sistema SIAM com arquitetura de microserviços e me ajude a entender o fluxo de comunicação entre API, Middleware e Device-comm para implementar duas novas funcionalidades..."

- **Implementação da Funcionalidade 3.1:**
  > "Como implementar um endpoint REST que retorna todos os acessos de um usuário específico em um prédio específico, seguindo a arquitetura existente com RPC via RabbitMQ?"

- **Implementação da Funcionalidade 3.2:**
  > "Como criar um endpoint que abre todas as portas de um prédio, enviando comandos para o serviço device-comm via mensageria?"

- **Debugging de Infraestrutura:**
  > "Estou tendo erro 'column User.first_name does not exist' no TypeORM. Como debugar problemas de conexão com PostgreSQL em ambiente Docker?"

- **Configuração de Ambiente:**
  > "Como configurar variáveis de ambiente para o middleware conectar no PostgreSQL correto, evitando conflito de portas com outro container?"

- **Documentação:**
  > "Crie documentação completa para entrega de teste técnico, incluindo instruções de setup, testes e explicação da implementação."

### Contribuição do Desenvolvedor

- Execução prática de todos os comandos
- Testes e validação das funcionalidades
- Adaptação do código para o ambiente específico
- Resolução de problemas de configuração
- Validação final da solução

## 🎯 QUESTÃO BÔNUS: Problemas com Constantes no Middleware

### Problema Identificado

A implementação atual de constantes no serviço de middleware apresenta várias deficiências arquiteturais que violam princípios de desenvolvimento de software.

### Problemas Específicos

1.  **Duplicação de Código (Violação do Princípio DRY)**
    ```typescript
    // ❌ PROBLEMA: Constantes duplicadas
    // Em libs/common/src/constants/events.constants.ts
    export const ACCESS_GRANT_CMD = "access.grant";

    // Em middleware/src/constants/events.constants.ts  
    export const ACCESS_GRANT_CMD = "access.grant"; // DUPLICADO!
    ```
    **Impacto:** Manutenção complexa e propensa a erros.

2.  **Inconsistência de Valores**
    ```typescript
    // ❌ PROBLEMA: Mesma constante, valores diferentes
    // Arquivo A
    export const TIMEOUT = 5000;

    // Arquivo B  
    export const TIMEOUT = 3000; // INCONSISTENTE!
    ```
    **Impacto:** Comportamentos inesperados e bugs difíceis de rastrear.

3.  **Acoplamento Forte**
    ```typescript
    // ❌ PROBLEMA: Middleware define suas próprias constantes
    // middleware/src/constants/database.constants.ts
    export const DB_HOST_TOKEN = 'DB_HOST';

    // Deveria usar constantes compartilhadas
    ```
    **Impacto:** Dificuldade de reutilização e padronização entre serviços.

4.  **Falta de Centralização**
    ```typescript
    // ❌ PROBLEMA: Constantes espalhadas em múltiplos locais
    middleware/src/constants/database.constants.ts
    middleware/src/constants/events.constants.ts  
    middleware/src/constants/rabbitmq.constants.ts
    libs/common/src/constants/events.constants.ts
    ```
    **Impacto:** Dificuldade para encontrar e gerenciar constantes.

### Soluções Recomendadas

1.  **Centralização Completa**
    ```typescript
    // ✅ SOLUÇÃO: Apenas em libs/common/src/constants/
    // libs/common/src/constants/index.ts
    export * from './events.constants';
    export * from './database.constants';
    export * from './timeouts.constants';
    ```

2.  **Categorização Lógica**
    ```typescript
    // ✅ SOLUÇÃO: Constantes organizadas por domínio
    // libs/common/src/constants/events.constants.ts
    export const EVENTS = {
      ACCESS: {
        GRANT: "access.grant",
        REVOKE: "access.revoke",
        GET_USER_ACCESSES_IN_BUILDING: "access.get_user_accesses_in_building"
      },
      BUILDING: {
        OPEN_ALL_DOORS: "building.open_all_doors"
      }
    } as const;
    ```

3.  **Type Safety**
    ```typescript
    // ✅ SOLUÇÃO: Tipos TypeScript para validação
    export type EventCommand = typeof EVENTS.ACCESS.GRANT | typeof EVENTS.BUILDING.OPEN_ALL_DOORS;

    // Uso seguro
    const command: EventCommand = EVENTS.ACCESS.GRANT;
    ```

4.  **Validação em Runtime**
    ```typescript
    // ✅ SOLUÇÃO: Validação de constantes
    export function isValidEventCommand(command: string): command is EventCommand {
      return Object.values(EVENTS).some(category => 
        Object.values(category).includes(command as any)
      );
    }
    ```

5.  **Configuração por Ambiente**
    ```typescript
    // ✅ SOLUÇÃO: Constantes configuráveis
    // libs/common/src/constants/config.constants.ts
    export const CONFIG = {
      TIMEOUTS: {
        RPC: process.env.RPC_TIMEOUT || 5000,
        DATABASE: process.env.DB_TIMEOUT || 3000
      },
      RETRIES: {
        MAX_ATTEMPTS: parseInt(process.env.MAX_RETRIES) || 3
      }
    } as const;
    ```

### Implementação da Melhoria

**Antes (Problemático):**
```typescript
// middleware/src/constants/events.constants.ts
export const DEVICE_COMMAND_OPEN_DOOR = "OPEN_DOOR";

// middleware/src/access/access.service.ts
import { DEVICE_COMMAND_OPEN_DOOR } from '../constants/events.constants';
```

**Depois (Melhorado):**
```typescript
// libs/common/src/constants/device.constants.ts
export const DEVICE_COMMANDS = {
  OPEN_DOOR: "OPEN_DOOR",
  CLOSE_DOOR: "CLOSE_DOOR",
  CHECK_STATUS: "CHECK_STATUS"
} as const;

// middleware/src/access/access.service.ts
import { DEVICE_COMMANDS } from '@siam/common';

// Uso type-safe
const command = DEVICE_COMMANDS.OPEN_DOOR;
```

### Benefícios da Solução

-   **Manutenibilidade:** Uma única fonte de verdade
-   **Consistência:** Valores garantidamente iguais
-   **Type Safety:** Validação em tempo de compilação
-   **Reutilização:** Fácil compartilhamento entre serviços
-   **Escalabilidade:** Fácil adição de novas constantes
-   **Debugging:** Mais fácil rastrear problemas

### Impacto na Arquitetura

Esta melhoria alinha o sistema com princípios de **Clean Architecture** e **Domain-Driven Design**, criando uma base sólida para crescimento e manutenção do sistema SIAM.

## ✅ CONCLUSÃO

As funcionalidades foram implementadas com sucesso, respeitando completamente os requisitos:

-   ✅ Funcionalidade 3.1: Retorna acessos de usuário específico em prédio específico
-   ✅ Funcionalidade 3.2: Abre todas as portas de um prédio específico
-   ✅ Parâmetros: Respeitados conforme especificação
-   ✅ Fluxo de comunicação: Mantém arquitetura de microserviços
-   ✅ Testabilidade: Funciona via `trigger.sh`
-   ✅ Compilação: Funciona de primeira execução
-   ✅ Questão bônus: Analisada e solucionada

O sistema está pronto para produção e pode ser facilmente estendido com novas funcionalidades seguindo os padrões estabelecidos.

---
**Desenvolvedor:** Felipe  
**Data de conclusão:** 16/02/2026  
**Status:** ✅ Completo e testado
