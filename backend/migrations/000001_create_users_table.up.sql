CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    nick_name VARCHAR(100) UNIQUE,

    birthday DATE NOT NULL,

    email VARCHAR(150) UNIQUE NOT NULL,
    password TEXT NOT NULL,

    avatar TEXT,
    about_me TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);