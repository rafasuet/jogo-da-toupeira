-- Acerte a Toupeira — esquema do banco (MySQL 8+ / MariaDB 10.5+)
-- Executado por database/setup.php; também pode ser importado direto no phpMyAdmin.

CREATE DATABASE IF NOT EXISTS whack_a_mole
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE whack_a_mole;

CREATE TABLE IF NOT EXISTS users (
    id             INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    full_name      VARCHAR(120)  NOT NULL,
    birth_date     DATE          NOT NULL,
    cpf            CHAR(11)      NOT NULL,              -- somente dígitos
    phone          VARCHAR(11)   NOT NULL,              -- somente dígitos (DDD + número)
    email          VARCHAR(160)  NOT NULL,
    username       VARCHAR(30)   NOT NULL,
    password_hash  VARCHAR(255)  NOT NULL,              -- password_hash() do PHP
    created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_username (username),
    UNIQUE KEY uq_users_cpf (cpf)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS matches (
    id             INT UNSIGNED      NOT NULL AUTO_INCREMENT,
    user_id        INT UNSIGNED      NOT NULL,
    board_rows     TINYINT UNSIGNED  NOT NULL,
    board_cols     TINYINT UNSIGNED  NOT NULL,
    mode           ENUM('classic', 'explosive') NOT NULL,
    score          INT               NOT NULL,          -- pode ser negativo (modalidade explosiva)
    moles_hit      INT UNSIGNED      NOT NULL DEFAULT 0,
    bombs_hit      INT UNSIGNED      NOT NULL DEFAULT 0,
    level_reached  SMALLINT UNSIGNED NOT NULL,
    end_reason     ENUM('defeat', 'quit') NOT NULL,
    played_at      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_matches_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT chk_matches_board CHECK (board_rows BETWEEN 2 AND 8 AND board_cols BETWEEN 2 AND 8),
    KEY idx_matches_user_played (user_id, played_at),        -- histórico do jogador
    KEY idx_matches_ranking (mode, score, level_reached)     -- ranking por modalidade
) ENGINE = InnoDB;
