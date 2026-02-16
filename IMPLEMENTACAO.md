# Implementação das Funcionalidades SIAM

1. Setup Rápido
### Configuração do Banco de Dados

```bash
# PowerShell
Get-Content db\schema.sql | docker exec -i postgres-siam psql -U postgres -d siam
Get-Content db\populate_db_manually.sql | docker exec -i postgres-siam psql -U postgres -d siam

# Git Bash
cat db/schema.sql | docker exec -i postgres-siam psql -U postgres -d siam
cat db/populate_db_manually.sql | docker exec -i postgres-siam psql -U postgres -d siam
```

### Instalação e Execução
```bash
# Instalar dependências
npm install

# Iniciar serviços (em terminais separados)
npm run start:device-comm    # Terminal 1
npm run start:middleware     # Terminal 2  
npm run start:api           # Terminal 3
2. Testes das Funcionalidades
Autenticação
bash
Copiar

./tools/trigger.sh --operation login --email user1.uno@example.com --password password123
Funcionalidade 3.1: Acessos de usuário em prédio
bash
Copiar

./tools/trigger.sh --operation getUserAccessesInBuilding --userId 1 --buildingId 1 --token "SEU_TOKEN"
Resultado esperado:

json
Copiar

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
    }
  ]
}
```

### Funcionalidade 3.2: Abrir todas as portas do prédio
```bash
./tools/trigger.sh --operation openAllDoorsInBuilding --buildingId 1 --token "SEU_TOKEN"
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
3. Uso de Inteligência Artificial
Ferramentas utilizadas:

Claude 4 Sonnet (Anthropic) - Assistente de IA para desenvolvimento
Gemini CLI (Google) - Agente de IA para automação de tarefas de terminal e infraestrutura
Nível de assistência: Fundamental para análise da arquitetura, implementação das funcionalidades, debugging de infraestrutura e criação da documentação.

Principais prompts:

"Analise este sistema SIAM com arquitetura de microserviços e me ajude a entender o fluxo de comunicação entre API, Middleware e Device-comm para implementar duas novas funcionalidades..."
"Como implementar um endpoint REST que retorna todos os acessos de um usuário específico em um prédio específico, seguindo a arquitetura existente com RPC via RabbitMQ?"
"Como criar um endpoint que abre todas as portas de um prédio, enviando comandos para o serviço device-comm via mensageria?"
"Estou tendo erro 'column User.first_name does not exist' no TypeORM. Como debugar problemas de conexão com PostgreSQL em ambiente Docker?"
4. Questão Bônus: Problemas com Constantes no Middleware
Por que a implementação atual não é ideal:
Duplicação de Código: Constantes repetidas em middleware/src/constants/ e libs/common/src/constants/, violando o princípio DRY
Falta de Centralização: Valores espalhados em múltiplos arquivos (database.constants.ts, events.constants.ts, rabbitmq.constants.ts) dificultam manutenção
Inconsistência: Risco de valores diferentes para a mesma constante em arquivos distintos
Acoplamento Forte: Cada serviço define suas próprias constantes ao invés de usar uma fonte única compartilhada
Solução Recomendada:
Centralizar todas as constantes em libs/common/src/constants/ com categorização lógica e importar nos serviços, garantindo consistência, type safety e facilitando manutenção.

Exemplo:

typescript
Copiar

// libs/common/src/constants/events.constants.ts
export const EVENTS = {
  ACCESS: {
    GRANT: "access.grant",
    GET_USER_ACCESSES_IN_BUILDING: "access.get_user_accesses_in_building"
  },
  BUILDING: {
    OPEN_ALL_DOORS: "building.open_all_doors"
  }
} as const;
✅ Conclusão
Funcionalidades implementadas com sucesso:

✅ Funcionalidade 3.1: Retorna acessos de usuário específico em prédio específico
✅ Funcionalidade 3.2: Abre todas as portas de um prédio específico
✅ Testável via trigger.sh conforme especificado
✅ Compilação funciona na primeira execução
Desenvolvedor: Felipe
Data de conclusão: 16/02/2026
Status: ✅ Completo e testado
