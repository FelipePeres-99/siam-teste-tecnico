# Device Comm Example POC

This POC demonstrates the how the separation of concerns between API, Middleware, and Device-Comm services should be done in the SIAM 2.0 (backend) codebase. 

The idea is to have a concrete guideline/example that will act as a "North Star", and slowly evolve the current codebase in order to get there, guaranteeing that:

1. SIAM 2.0 always work.
2. It is possible to add features and fix bugs in parallel.
3. The effort needed is as small as possible.

![Evolving SIAM](docs/img/EvolvingSIAM.png)

## Glossary

Essential terms used throughout this documentation:

- **Middleware**: The central logic hub of the system. It handles complex business rules, database transactions, and orchestrates communication between the API and devices.
- **Device-Comm**: A dedicated service acting as a bridge between our system's internal messages (RabbitMQ) and external hardware protocols (HTTP, TCP, etc.).
- **RPC (Remote Procedure Call)**: A synchronous communication pattern where a service sends a message and waits for a response (e.g., API waiting for Middleware to validate a user).
- **Fire-and-forget**: An asynchronous communication pattern where a message is sent without waiting for a reply (e.g., Middleware telling Device-Comm to open a door).
- **Topic Exchange**: A RabbitMQ routing mechanism that allows messages to be broadcast to multiple consumers based on a matching pattern (e.g., `user.*` matches `user.created` and `user.deleted`).
- **JWT (JSON Web Token)**: A secure token used to authenticate requests.

## High Level Architecture

The system is composed of 3 services:

- **API**:
    - Receives the requests from the clients (e.g. Frontend).
    - **Permissions**: Can only **read from Redis cache** (not from PostgreSQL directly). Cannot write to either Redis or PostgreSQL.
    - **Data Access**: Reads come from the Redis cache layer. Database reads bypass the API and are handled by the Middleware when needed.
    - **Responsibilities**: 
        - **Basic Request Validation**: Ensures payload presence and type correctness.
        - **Authorization Checks**: Uses cached data (from Redis) to verify if a user has the necessary rights (e.g., to open a door) *before* forwarding the command.
    - **All requests must include a valid JWT token** (except `/auth/login` and `/auth/refresh`).
- **Middleware**: 
    - Acts as a bridge, processing (most of the) business logic and database operations. 
    - It consumes messages from the API and produces messages for the Device-Comm service.
    - **Responsibilities**:
        - **Orchestration**: Manages complex flows involving Database transactions, complex domain rules, and external command triggering.
    - **Only the middleware can write to the database and Redis cache**.
- **Device-Comm**: 
    - Handles direct communication with external devices. 
    - It consumes messages from the Middleware.
    - **Responsibilities**:
        - **Protocol Translation**: Converts RabbitMQ commands into HTTP requests (or other protocols) understood by the physical hardware.
    - **Permissions**: No database or cache access. Receives commands via RabbitMQ and executes device operations.

:bulb: This POC uses a [script](tools/device_mock.py) **that listens to HTTP requests** in order to simulate external hardware devices, and a [script](tools/trigger.sh) **that sends HTTP requests** in order to simulate the clients (Frontend)

### Service Permissions Matrix

| Operation | API | Middleware | Device-Comm |
|-----------|-----|-----------|-------------|
| **Read from PostgreSQL** | ❌ | ✅ | ❌ |
| **Read from Redis Cache** | ✅ | ✅ | ❌ |
| **Write to PostgreSQL** | ❌ | ✅ | ❌ |
| **Write to Redis Cache** | ❌ | ✅ (via events) | ❌ |
| **Consume from RabbitMQ** | ✅ (RPC) | ✅ (RPC & Events) | ✅ (Fire-and-forget) |
| **Access External Devices** | ❌ | ❌ | ✅ |

**Key Principle**: The Middleware is the single point of authority for all data mutations. All changes to PostgreSQL and Redis originate from the Middleware, ensuring consistency and centralized business logic enforcement.

## Communication & Messaging

### Service Communication Mechanisms

#### 1. API
- **Inbound (HTTP)**: Receives RESTful HTTP requests from clients (e.g., Frontend).
- **Read (Redis)**: Directly reads from **Redis Cache** for fast data retrieval.
    - *Note*: The API **never** reads directly from PostgreSQL.
- **Outbound (RPC)**: Communicates with the **Middleware** using RabbitMQ Request/Response (RPC) pattern.
    - **Usage**: When a request requires DB writes, complex validation, or device interaction (e.g., `grantAccess`, `openDoor`).
    - **Queue**: `poc.device_comm_example.middleware.q`

#### 2. Middleware
- **Inbound (RPC)**: Receives synchronous commands from the API.
    - **Usage**: Validating user credentials (`AUTH_VALIDATE_CREDENTIALS_CMD`), processing access requests (`ACCESS_GRANT_CMD`).
- **Internal (In-Memory)**: Uses `EventEmitter2` for decoupled communication between its own services (e.g., `DeviceService` <-> `ReaderService`).
- **Outbound (Events)**: Publishes events to a RabbitMQ **Topic Exchange** for asynchronous processing.
    - **Usage**: Data synchronization. When data changes in DB, an event is emitted (e.g., `user.created`) so the `CacheEventsSubscriber` (also in Middleware) can update Redis.
    - **Exchange**: `poc.device_comm_example.events`
- **Outbound (Fire-and-Forget)**: Sends asynchronous commands to **Device-Comm**.
    - **Usage**: Triggering physical actions where no immediate return value is needed by the API (e.g., `OPEN_DOOR`).
    - **Queue**: `poc.device_comm_example.devices.q`

#### 3. Device-Comm
- **Inbound (Fire-and-Forget)**: Consumes commands from the Middleware via RabbitMQ.
- **Outbound (HTTP)**: Sends HTTP requests to the physical device hardware (or mock).

### Queues and Services Configuration

This section details the specific RabbitMQ queues and services used for inter-microservice communication.

#### 1. **MIDDLEWARE_SERVICE**
- **Queue Name**: `poc.device_comm_example.middleware.q`
- **Transport**: RabbitMQ with Direct Queue (RPC-style communication)
- **Durability**: Non-durable (`durable: false`) — messages are lost if RabbitMQ restarts
- **Used By**: API service calls the Middleware using RPC pattern
- **Purpose**: Synchronous RPC calls from API to Middleware for operations like:
  - Granting access to doors
  - Authenticating users
  - Populating cache
  - Database operations (create, update, delete)
- **Example Pattern**: `api.send('middleware.pattern', payload).toPromise()`

#### 2. **DEVICE_COMM_SERVICE**
- **Queue Name**: `poc.device_comm_example.devices.q`
- **Transport**: RabbitMQ with Direct Queue (Fire-and-forget style)
- **Durability**: Non-durable (`durable: false`) — messages are lost if RabbitMQ restarts
- **Used By**: Middleware service sends commands to Device-Comm
- **Purpose**: Asynchronous fire-and-forget messages for device operations like:
  - Opening doors
  - Sending hardware commands
  - Direct communication with physical devices
- **Example Pattern**: `middleware.emit('device.command', payload)` — no response expected
- **Note**: Uses `@EventPattern('device.command')` in the Device-Comm controller to listen for messages

#### 3. **EVENT_BUS_SERVICE** (Topic Exchange - RabbitMQ)
- **Exchange Name**: `poc.device_comm_example.events`
- **Exchange Type**: `topic` — allows subscription to patterns (e.g., `user.*`, `key.*`)
- **Durability**: Durable (`durable: true`) — survives RabbitMQ restarts
- **Acknowledgement**: No acknowledgement (`noAck: true`) — messages are discarded after delivery
- **Used By**: Middleware services emit events after database operations
- **Purpose**: Publish-subscribe pattern for cache synchronization via RabbitMQ:
  - `user.created` — triggers user cache update in Redis
  - `users.deleted` — invalidates user cache in Redis
  - `key.created` — triggers key cache update in Redis
  - `key-authorization.created` — triggers key-authorization cache update in Redis
- **Emission**: `eventBusService.emit('user.created', userData)` in services
- **Subscribers** (via `@EventPattern()` in `CacheEventsSubscriber` controller):
  - `@EventPattern('user.created')` → updates Redis with user data
  - `@EventPattern('users.deleted')` → removes user keys from Redis
  - `@EventPattern('key.created')` → updates Redis with key data
  - `@EventPattern('key-authorization.created')` → updates Redis with key authorization and reader sets
- **Note**: The `CacheEventsSubscriber` controller (in `cache-events.subscriber.ts`) listens to all cache-related events from RabbitMQ and synchronizes the Redis cache accordingly.

### Internal Service Decoupling (In-Memory Events)

In addition to RabbitMQ for inter-service communication, the **Middleware** uses NestJS's `EventEmitter2` for internal communication between its own modules. This is primarily done to **avoid circular dependencies** (e.g., between `DeviceService` and `ReaderService`) without using `forwardRef`.

These events are handled using the standard **`@OnEvent`** decorator provided by `@nestjs/event-emitter`.

#### Events List

1. **`DEVICE_GET_BASIC_CONFIG_CMD`**
   -   **Pattern**: `device.get-basic-config`
   -   **Triggered By**: `ReaderService` (via `eventEmitter.emitAsync()`)
   -   **Handled By**: `DeviceService` (via `@OnEvent('device.get-basic-config')`)
   -   **Purpose**: Allows the `ReaderService` to retrieve device configuration details without directly importing the `DeviceService`.
   -   **Payload**: `{ deviceId: number }`
   -   **Returns**: `Device | null`

2. **`READER_CHECK_CONFIGURATION_CMD`**
   -   **Pattern**: `reader.check-configuration`
   -   **Triggered By**: `DeviceService` (via `eventEmitter.emitAsync()`)
   -   **Handled By**: `ReaderService` (via `@OnEvent('reader.check-configuration')`)
   -   **Purpose**: Allows the `DeviceService` to verify if a reader is valid and configured without directly importing the `ReaderService`.
   -   **Payload**: `{ readerId: number }`
   -   **Returns**: `boolean`

### Conventions and Naming Patterns

To ensure consistency and clarity across the services, we follow specific naming patterns for messages sent via RabbitMQ. These patterns, defined as constants in `libs/common/src/constants.ts`, help distinguish between different types of messages.

#### Commands (`_CMD` Suffix)

A **Command** is an imperative message that requests a specific operation to be performed. It is typically directed to a single consumer that is responsible for executing the action.

-   **Purpose:** To tell a service *what to do*.
-   **Pattern:** `[NOUN]_[VERB]_CMD`
-   **Example:** `DOOR_TRIGGER_OPEN_CMD`
    -   This constant represents a direct order to the `middleware` to initiate the process of opening a door.

#### Events (`_EVENT` Suffix)

An **Event** is a notification that something significant *has already happened* within a service.

-   **Purpose:** To notify the system that a state change has occurred.
-   **Pattern:** `[NOUN]_[PAST_TENSE_VERB]_EVENT`
-   **Example:** `USER_CREATED_EVENT`
    -   This constant represents a notification that a new user has been successfully created in the database. The `CacheEventsSubscriber` listens for this event to update the cache accordingly.

## Data & State Management

### Data Architecture and Caching

This project's data architecture is designed for performance, consistency, and scalability, using PostgreSQL as the source of truth and Redis as a read-caching layer.

#### Overview

-   **Source of Truth (PostgreSQL)**: PostgreSQL is the main database and the single authoritative source of all data. All write, update, and delete operations must occur here.
-   **Data Projection (Redis)**: Redis acts as a read-only projection of the data stored in PostgreSQL. It is used by the **API** service to accelerate queries, reducing the load on the main database and decreasing latency for the end client.
-   **Write Authority (`middleware`)**: The **middleware** service is the **only** system component authorized to write or modify data, both in PostgreSQL and, indirectly, in Redis. This centralization guarantees consistency and the enforcement of business logic in a single place.

#### Data Projection Flow: From Postgres to Redis

The synchronization between PostgreSQL and Redis is not direct. It follows an asynchronous, event-driven flow to ensure resilience and decoupling.

1.  **Operation in `middleware`**: A request that modifies data (create, edit, delete) arrives at the `middleware`.
2.  **Transaction in PostgreSQL**: The corresponding service (e.g., `UserService`) executes the transaction in PostgreSQL.
3.  **Event Emission**: After the transaction is confirmed in the database, the service emits an event (e.g., `user.created`) to RabbitMQ. This is handled by the `EventBusModule` and is a "fire-and-forget" operation, meaning it's fast and does not wait for a response.
4.  **Event Consumption**: The `CacheEventsSubscriber`, an event consumer also residing in the `middleware`, is listening for events from RabbitMQ.
5.  **Redis Update**: Upon receiving the event, the `CacheEventsSubscriber` processes the data and updates Redis with the latest state.

This flow ensures that the main operation (writing to Postgres) is fast and that the cache update (writing to Redis) occurs in the background, without impacting the response time of the original request.

#### Key Components

- **`EventBusModule`**: This is a centralized, reusable module created to abstract the complexity of publishing events to RabbitMQ. It encapsulates the NestJS `ClientProxy` and provides a simple `EventBusService` with an `emit(pattern, payload)` method. Any service that needs to notify the rest of the system about a state change can inject this service and emit an event.
- **`CacheEventsSubscriber`**: Using decorators like `@EventPattern('user.created')`, it connects to RabbitMQ and executes secondary logic when an event is received. In the current context, its responsibility is to keep the Redis cache consistent with the source of truth.

#### Architectural Decisions (RabbitMQ)

The RabbitMQ configuration was tailored to optimize the event flow:

-   **`exchange` (`poc.device_comm_example.events`)**: A  exchange was created specifically for events. This separates the traffic of **events** (asynchronous notifications, "something happened") from the traffic of **RPC commands** (synchronous requests, "do this"). This is a fundamental pattern in microservices to avoid coupling communication styles.
-   **`exchangeType: 'topic'`**: This exchange type allows for flexible message routing based on a `pattern` (the topic). We currently use specific events like `user.created`, but this architecture allows a service to subscribe to `user.*` in the future to receive all user-related events, for example.
-   **`durable: true`**: This option ensures that the exchange and the event queue survive a RabbitMQ broker restart. Without it, a broker failure would result in the loss of the topology and any pending messages, compromising the cache's consistency.
-   **`noAck: true` (No Acknowledge)**: This means the message is removed from the queue by the broker as soon as it's delivered to the consumer, without waiting for a processing confirmation.
    -   **Advantage**: Higher performance, as it eliminates the round-trip for acknowledgement messages.
    -   **Risk**: If the consumer fails *during* processing, the message is lost forever.
    -   **Justification**: For this use case (cache updates), the risk is acceptable. In the worst-case scenario, a cache entry becomes temporarily stale until it's corrected by a future operation. If the processing were critical (e.g., a financial transaction), this option would be `false`, and manual acknowledgement would be required.

## Security

### Authentication & Security

This POC implements **JWT-based authentication** with the following features:

#### Token Types
- **Access Token**: Short-lived (15 minutes), used to authenticate API requests
- **Refresh Token**: Long-lived (7 days), stored in Redis for token renewal

#### Token Storage
- **Refresh tokens** are stored in Redis by the **Middleware** (only service with write access to Redis)
- **Access tokens** are validated using JWT signature verification
- **Revoked tokens** are added to a blacklist in Redis with a 15-minute TTL

#### Endpoints
- `POST /auth/login` - Authenticate with email and password, returns both token types
- `POST /auth/refresh` - Renew access token using refresh token
- `POST /auth/logout` - Revoke all tokens for the user

#### Security Policies
- All endpoints (except `/auth/login` and `/auth/refresh`) require a valid JWT in the `Authorization: Bearer <token>` header
- Passwords are hashed using bcrypt before storage in the database
- JWT secret keys should be changed in production (configured via environment variables)

## Configuration

### Environment Variables

The application uses the following environment variables for configuration. You can set these in a `.env` file in the root of each service (`api/.env`, `middleware/.env`, `device-comm/.env`).

#### General & Infrastructure
| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `RABBITMQ_URL` | Connection URL for RabbitMQ | `amqp://siam:siam@localhost` |
| `DB_HOST` | PostgreSQL Database Host | `localhost` |
| `DB_PORT` | PostgreSQL Database Port | `5432` |
| `DB_USERNAME` | PostgreSQL Username | `postgres` |
| `DB_PASSWORD` | PostgreSQL Password | `siam` |
| `DB_DATABASE` | PostgreSQL Database Name | `siam` |
| `REDIS_HOST` | Redis Host | `localhost` |
| `REDIS_PORT` | Redis Port | `6379` |
| `REDIS_TTL_BLACKLIST_SECONDS` | TTL for blacklisted tokens (in seconds) | `900` |
| `RMQ_MESSAGE_TIMEOUT` | Timeout for RabbitMQ RPC calls (in ms) | `5000` |

#### Security (JWT)
| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `JWT_SECRET` | Secret key for signing Access Tokens | `your-super-secret-key` |
| `JWT_REFRESH_SECRET` | Secret key for signing Refresh Tokens | `your-refresh-secret-key` |
| `JWT_ACCESS_TOKEN_EXPIRATION_TIME` | Expiration time for Access Tokens | `15m` |
| `JWT_REFRESH_TOKEN_EXPIRATION_TIME` | Expiration time for Refresh Tokens | `7d` |

#### Service Specific
| Variable | Description | Default Value | Service |
| :--- | :--- | :--- | :--- |
| `API_PORT` | HTTP Port for the API Service | `3000` | API |

#### Logging
| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `LOG_LEVEL` | Log verbosity (`error`, `warn`, `info`, `debug`) | `info` |
| `LOG_FILE` | Path to the general log file | `logs/<service_name>.log` |
| `ERROR_LOG_FILE` | Path to the error log file | `logs/error.log` |

### Logging Configuration

Adjusting the log verbosity for each service (API, Middleware, Device-Comm) should be a simple task, achievable even by a non-developer. This is done by configuring the `LOG_LEVEL` environment variable in their respective `.env` files.

Each service has an `.env` file in its root directory (e.g., `api/.env`). To change the log level, simply edit this file:

```
LOG_LEVEL=debug
```

**Supported Log Levels (from least to most verbose):**
*   `error`: For critical errors.
*   `warn`: For warnings that don't prevent the application from functioning.
*   `info`: General information about the application's flow (default).
*   `debug`: Detailed information, useful for debugging.

After modifying a `.env` file, you must restart the corresponding service for the changes to take effect.

## Getting Started & Usage

### Prerequisites

- Node.js & npm
- Python 3.9+
- PostgreSQL (running on localhost:5432, user: postgres, pass: siam, db: siam)
- RabbitMQ (running on localhost:5672)
- Redis 8.4+

:bulb: Use containers for PostgreSQL, RabbitMQ and Redis, and a virtual environment for the python script.


### Setup

1. **Database**:
   Run the SQL scripts to create the schema and populate data.
   ```bash
   psql -U postgres -d siam -f db/schema.sql
   psql -U postgres -d siam -f db/populate_db_manually.sql
   ```
2. **Dependencies**:
   Install dependencies for all services.
   ```bash
   npm install
   ```
### Run it

1) **Prepare script for device mock (Python)**
   ```bash
   mkdir tools/venv 
   python3 -m venv tools/venv/ # Python virtual environment, for installing the dependencies

   cd tools/venv 
   ./bin/pip3 install -r ../requirements.txt # Installing the dependencies
   cd ../..
   ```

2) **Run the Mock Device**
   ```bash
   # From the project root
   tools/venv/bin/python3 tools/device_mock.py
   ```

3) **Run the Services**

   Open 3 separate terminal tabs/windows:

   **Middleware**:
   ```bash
   npm run start:middleware
   ```

   **Device-Comm**:
   ```bash
   npm run start:device-comm
   ```

   **API**:
   ```bash
   npm run start:api
   ```

:bulb: If you experience `yarn` related errors on any of the services, run `yarn` at the repository root to install dependencies for all workspaces so workspace binaries (for example `ts-node`) are available to the `start` scripts. If you prefer to install tooling only for the `api` workspace, run:

```bash
yarn workspace api add -D ts-node ts-node-dev tsconfig-paths
```

### Triggering Flows

Once everything is running, use the trigger script to test the implemented flows. The script requires `jq` for formatting the output.

#### 0. Authentication (Required for all other operations)

##### 0.1 Login
Authenticates a user with email and password, returns access and refresh tokens.
```bash
./tools/trigger.sh --operation login --email "user1.uno@example.com" --password "password123"
```

Example response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

##### 0.2 Refresh Token
Renews the access token using a refresh token.
```bash
./tools/trigger.sh --operation refresh --refreshToken "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzY5ODgyODkwLCJleHAiOjE3NzA0ODc2OTB9.4bqTBubiagG97lvS9jrLOTsY1PHsbC7w7Kek7ZUZXx8"
```

##### 0.3 Logout
Revokes all tokens for the authenticated user.
```bash
./tools/trigger.sh --operation logout --token "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3Njk4ODI5MTAsImV4cCI6MTc2OTg4MzgxMH0.2TcVE06XKE8wU0EHUI4d-wHOeVR8RCCCZ0QKxAvydFg"
```


#### 1. Populate User Cache (RPC / Cache Write - Auth Required)
Triggers a command to the middleware to populate the cache.
```bash
./tools/trigger.sh --operation populateCache --token "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidXNlcjEudW5vQGV4YW1wbGUuY29tIiwidHlwZSI6ImFjY2VzcyIsImlhdCI6MTc2OTg4Mjk3MywiZXhwIjoxNzY5ODgzODczfQ.1RdtmCI2D5unhlbIQGwc79sBmxBGC6iIXY4UNfgoQyw"
```

#### 2. Get User (Direct Read - Auth Required)
Retrieves user information directly from the database through the API.
```bash
./tools/trigger.sh --operation getUser --userId 1 --token "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidXNlcjEudW5vQGV4YW1wbGUuY29tIiwidHlwZSI6ImFjY2VzcyIsImlhdCI6MTc2OTg4Mjk3MywiZXhwIjoxNzY5ODgzODczfQ.1RdtmCI2D5unhlbIQGwc79sBmxBGC6iIXY4UNfgoQyw"
```

#### 3. Grant Access (RPC / DB Write - Auth Required)
Grants a user access to a door. This uses an RPC call from API to Middleware.
```bash
./tools/trigger.sh --operation grantAccess --userId 1 --doorId 101 --token "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidXNlcjEudW5vQGV4YW1wbGUuY29tIiwidHlwZSI6ImFjY2VzcyIsImlhdCI6MTc2OTg4Mjk3MywiZXhwIjoxNzY5ODgzODczfQ.1RdtmCI2D5unhlbIQGwc79sBmxBGC6iIXY4UNfgoQyw"
```

#### 4. Open Door (Fire-and-forget / Device Comm - Auth Required)
Triggers a door opening. API calls Middleware (RPC), which then sends a fire-and-forget message to Device-Comm, which finally calls the Mock Device.
```bash
./tools/trigger.sh --operation openDoor --userId 1 --doorId 101 --token "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidXNlcjEudW5vQGV4YW1wbGUuY29tIiwidHlwZSI6ImFjY2VzcyIsImlhdCI6MTc2OTg4Mjk3MywiZXhwIjoxNzY5ODgzODczfQ.1RdtmCI2D5unhlbIQGwc79sBmxBGC6iIXY4UNfgoQyw"
```

#### 5. Delete Users in Building (Event / Background - Auth Required)
Deletes all users associated with a building. This is handled as an asynchronous event.
```bash
./tools/trigger.sh --operation deleteAllUsersInBuilding --buildingId 500 --token "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 6. Get Reader With Device (RPC / DB Read - Auth Required)
Retrieves reader information along with its associated device from the database through the API.
```bash
./tools/trigger.sh --operation getReaderWithDevice --readerId 1 --token "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidXNlcjEudW5vQGV4YW1wbGUuY29tIiwidHlwZSI6ImFjY2VzcyIsImlhdCI6MTc2OTg4Mjk3MywiZXhwIjoxNzY5ODgzODczfQ.1RdtmCI2D5unhlbIQGwc79sBmxBGC6iIXY4UNfgoQyw"
```

### Debug

You can debug each service independently using the VSCode debug scripts configured in `package.json`:

- `npm run debug:api` (Port 9229)
- `npm run debug:middleware` (Port 9230)
- `npm run debug:device-comm` (Port 9231)