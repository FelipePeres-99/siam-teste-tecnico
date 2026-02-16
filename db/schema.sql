-- Run while connected to database "siam"
BEGIN;

-- Create schema
CREATE SCHEMA IF NOT EXISTS device_comm_example AUTHORIZATION current_user;
SET search_path = device_comm_example, public;

DROP TABLE IF EXISTS device_comm_example.access_event CASCADE;
DROP TABLE IF EXISTS device_comm_example.key_authorization CASCADE;
DROP TABLE IF EXISTS device_comm_example."key" CASCADE;
DROP TABLE IF EXISTS device_comm_example.reader CASCADE;
DROP TABLE IF EXISTS device_comm_example.door CASCADE;
DROP TABLE IF EXISTS device_comm_example.device CASCADE;
DROP TABLE IF EXISTS device_comm_example."user" CASCADE;
DROP TABLE IF EXISTS device_comm_example.building CASCADE;

---------------------------------------------------------------------
-- BUILDING
---------------------------------------------------------------------
CREATE TABLE device_comm_example.building (
    building_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name          VARCHAR(200)        NOT NULL,
    address       VARCHAR(400),
    city          VARCHAR(100),
    state         VARCHAR(100),
    country       VARCHAR(100),
    created_at    TIMESTAMPTZ         NOT NULL DEFAULT now()
);

---------------------------------------------------------------------
-- DEVICE (general parent for hardware)
---------------------------------------------------------------------
CREATE TABLE device_comm_example.device (
    device_id     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    building_id   INT                 NOT NULL,
    device_type   VARCHAR(50)         NOT NULL,
    model         VARCHAR(200),
    serial_number VARCHAR(200),
    location_desc VARCHAR(400),
    installed_at  TIMESTAMPTZ,
    status        VARCHAR(50)         DEFAULT 'active',
    url           VARCHAR(255),
    CONSTRAINT fk_device_building FOREIGN KEY (building_id)
        REFERENCES device_comm_example.building (building_id)
        ON DELETE RESTRICT
);

CREATE UNIQUE INDEX IF NOT EXISTS  ux_device_serial
    ON device_comm_example.device(serial_number) WHERE serial_number IS NOT NULL;

---------------------------------------------------------------------
-- DOOR (subtype of device: device_id is PK and FK to device)
---------------------------------------------------------------------
CREATE TABLE device_comm_example.door (
    device_id   INT PRIMARY KEY,
    door_name   VARCHAR(200),
    room        VARCHAR(200),
    is_locked   BOOLEAN DEFAULT TRUE,
    notes       VARCHAR(400),
    CONSTRAINT fk_door_device FOREIGN KEY (device_id)
        REFERENCES device_comm_example.device (device_id)
        ON DELETE CASCADE
);

---------------------------------------------------------------------
-- READER (subtype of device: device_id is PK and FK to device)
---------------------------------------------------------------------
CREATE TABLE device_comm_example.reader (
    device_id        INT PRIMARY KEY,
    reader_type      VARCHAR(50),
    firmware_version VARCHAR(100),
    door_device_id   INT,
    mounted_height   VARCHAR(50),
    CONSTRAINT fk_reader_device FOREIGN KEY (device_id)
        REFERENCES device_comm_example.device (device_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_reader_door FOREIGN KEY (door_device_id)
        REFERENCES device_comm_example.door (device_id)
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_reader_door_device
    ON device_comm_example.reader(door_device_id);

---------------------------------------------------------------------
-- USER
---------------------------------------------------------------------
CREATE TABLE device_comm_example."user" (
    user_id      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name   VARCHAR(150)     NOT NULL,
    last_name    VARCHAR(150)     NOT NULL,
    email        VARCHAR(254)     UNIQUE,
    phone        VARCHAR(50),
    apartment    VARCHAR(50),
    building_id  INT,
    password_hash VARCHAR(255),
    created_at   TIMESTAMPTZ      NOT NULL DEFAULT now(),
    active       BOOLEAN          NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_user_building FOREIGN KEY (building_id)
        REFERENCES device_comm_example.building (building_id)
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_user_building
    ON device_comm_example."user"(building_id);

---------------------------------------------------------------------
-- KEY
---------------------------------------------------------------------
CREATE TABLE device_comm_example."key" (
    key_id        INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id       INT                 NOT NULL,
    key_type      VARCHAR(50)         NOT NULL,
    key_subtype   VARCHAR(100),
    key_data_hash TEXT,
    issued_at     TIMESTAMPTZ       NOT NULL DEFAULT now(),
    expires_at    TIMESTAMPTZ,
    active        BOOLEAN            NOT NULL DEFAULT TRUE,
    notes         VARCHAR(400),
    CONSTRAINT fk_key_user FOREIGN KEY (user_id)
        REFERENCES device_comm_example."user"(user_id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_key_user
    ON device_comm_example."key"(user_id);
CREATE INDEX IF NOT EXISTS idx_key_active
    ON device_comm_example."key"(active);

---------------------------------------------------------------------
-- KEY_AUTHORIZATION
---------------------------------------------------------------------
CREATE TABLE device_comm_example.key_authorization (
    key_id         INT NOT NULL,
    reader_id      INT NOT NULL,
    allowed        BOOLEAN NOT NULL DEFAULT TRUE,
    allowed_from   TIMESTAMPTZ,
    allowed_to     TIMESTAMPTZ,
    schedule_rule  VARCHAR(400),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by_user INT,
    PRIMARY KEY (key_id, reader_id),
    CONSTRAINT fk_ka_key FOREIGN KEY (key_id)
        REFERENCES device_comm_example."key"(key_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_ka_reader FOREIGN KEY (reader_id)
        REFERENCES device_comm_example.reader(device_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_ka_created_by FOREIGN KEY (created_by_user)
        REFERENCES device_comm_example."user"(user_id)
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ka_reader
    ON device_comm_example.key_authorization(reader_id);
CREATE INDEX IF NOT EXISTS idx_ka_key
    ON device_comm_example.key_authorization(key_id);

---------------------------------------------------------------------
-- ACCESS_EVENT
---------------------------------------------------------------------
CREATE TABLE device_comm_example.access_event (
    event_id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    occurred_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    reader_id     INT,
    device_id     INT,
    key_id        INT,
    user_id       INT,
    allowed       BOOLEAN,
    reason        VARCHAR(400),
    raw_payload   JSONB,
    CONSTRAINT fk_ae_reader FOREIGN KEY (reader_id) REFERENCES device_comm_example.reader(device_id) ON DELETE SET NULL,
    CONSTRAINT fk_ae_key FOREIGN KEY (key_id) REFERENCES device_comm_example."key"(key_id) ON DELETE SET NULL,
    CONSTRAINT fk_ae_user FOREIGN KEY (user_id) REFERENCES device_comm_example."user"(user_id) ON DELETE SET NULL
);

COMMIT;
