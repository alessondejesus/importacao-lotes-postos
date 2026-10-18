CREATE TYPE gas_station_status AS ENUM (
    'active',
    'inactive',
    'under_implementation'
);

CREATE TYPE gas_station_fuel_type AS ENUM (
    'regular_gasoline',
    'additivated_gasoline',
    'ethanol',
    'diesel_s10',
    'regular_diesel',
    'arla_32',
    'gnv'
);

CREATE TABLE IF NOT EXISTS gas_stations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cnpj VARCHAR(14) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    trade_name VARCHAR(150) NOT NULL,
    brand VARCHAR(150) NOT NULL,
    street VARCHAR(150) NOT NULL,
    number VARCHAR(150) NOT NULL,
    complement VARCHAR(150),
    neighborhood VARCHAR(150) NOT NULL,
    city VARCHAR(150) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip_code VARCHAR(150) NOT NULL,
    responsible_cpf VARCHAR(11) NOT NULL,
    responsible_name VARCHAR(150) NOT NULL,
    responsible_email VARCHAR(150) NOT NULL,
    responsible_position VARCHAR(150) NOT NULL,
    status gas_station_status NOT NULL,
    founding_date DATE NOT NULL,
    pump_count INTEGER NOT NULL,
    lane_count INTEGER NOT NULL,
    observations TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gas_station_fuels (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    gas_station_id BIGINT NOT NULL REFERENCES gas_stations(id) ON DELETE CASCADE,
    fuel_type gas_station_fuel_type NOT NULL,
    UNIQUE (gas_station_id, fuel_type)
);