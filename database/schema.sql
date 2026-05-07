DROP DATABASE IF EXISTS agriculture;
CREATE DATABASE agriculture CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE agriculture;

CREATE TABLE parcelles (
    id            INT PRIMARY KEY,
    nom           VARCHAR(50)    NOT NULL,
    localisation  VARCHAR(50)    NOT NULL,
    surface_ha    DECIMAL(5,2)   NOT NULL
) ENGINE=InnoDB;

CREATE TABLE cultures (
    id           INT PRIMARY KEY,
    type         VARCHAR(50)    NOT NULL,
    date_semis   DATE           NOT NULL,
    parcelle_id  INT            NOT NULL,
    CONSTRAINT fk_cultures_parcelle
        FOREIGN KEY (parcelle_id) REFERENCES parcelles(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE meteo (
    date         DATE PRIMARY KEY,
    temperature  INT NOT NULL,
    humidite     INT NOT NULL,
    pluie_mm     INT NOT NULL
) ENGINE=InnoDB;

CREATE TABLE observations (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    date         DATE         NOT NULL,
    etat         VARCHAR(50)  NOT NULL,
    parcelle_id  INT          NOT NULL,
    commentaire  VARCHAR(255),
    CONSTRAINT fk_observations_parcelle
        FOREIGN KEY (parcelle_id) REFERENCES parcelles(id)
        ON DELETE CASCADE,
    INDEX idx_obs_date (date),
    INDEX idx_obs_etat (etat)
) ENGINE=InnoDB;

CREATE TABLE alertes (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    date         DATE         NOT NULL,
    type         VARCHAR(50)  NOT NULL,
    parcelle_id  INT          NOT NULL,
    niveau       TINYINT      NOT NULL,
    CONSTRAINT fk_alertes_parcelle
        FOREIGN KEY (parcelle_id) REFERENCES parcelles(id)
        ON DELETE CASCADE,
    INDEX idx_alertes_date (date),
    INDEX idx_alertes_type (type)
) ENGINE=InnoDB;

CREATE TABLE users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    nom           VARCHAR(100)  NOT NULL,
    email         VARCHAR(255)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
