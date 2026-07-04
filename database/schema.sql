-- ============================================================
-- TurmeriCare - MySQL Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS turmericare CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE turmericare;

-- ============================================================
-- Table: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(120) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    avatar_url    VARCHAR(512),
    phone         VARCHAR(30),
    location      VARCHAR(255),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    last_login    DATETIME,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB;

-- ============================================================
-- Table: predictions
-- ============================================================
CREATE TABLE IF NOT EXISTS predictions (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    image_path      VARCHAR(512) NOT NULL,
    plant_part      ENUM('leaf', 'stem', 'rhizome', 'whole_plant') NOT NULL,
    disease_name    VARCHAR(255),
    confidence      FLOAT,
    severity        ENUM('none', 'mild', 'moderate', 'severe') DEFAULT 'none',
    affected_part   VARCHAR(255),
    color_analysis  JSON,         -- {green_pct, yellow_pct, brown_pct, condition}
    bounding_boxes  JSON,         -- [{x,y,w,h,label,confidence}]
    heatmap_path    VARCHAR(512),
    status          ENUM('processing', 'done', 'error') NOT NULL DEFAULT 'processing',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_disease (disease_name)
) ENGINE=InnoDB;

-- ============================================================
-- Table: disease_history
-- ============================================================
CREATE TABLE IF NOT EXISTS disease_history (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    prediction_id INT NOT NULL,
    user_id       INT NOT NULL,
    disease_name  VARCHAR(255),
    plant_part    VARCHAR(100),
    severity      VARCHAR(50),
    confidence    FLOAT,
    notes         TEXT,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prediction_id) REFERENCES predictions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)       REFERENCES users(id)       ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_prediction (prediction_id)
) ENGINE=InnoDB;

-- ============================================================
-- Table: soil_analysis
-- ============================================================
CREATE TABLE IF NOT EXISTS soil_analysis (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    ph              FLOAT NOT NULL,
    nitrogen        FLOAT NOT NULL,
    phosphorus      FLOAT NOT NULL,
    potassium       FLOAT NOT NULL,
    moisture        FLOAT NOT NULL,
    organic_carbon  FLOAT NOT NULL,
    temperature     FLOAT NOT NULL,
    humidity        FLOAT NOT NULL,
    soil_health     ENUM('poor', 'fair', 'good', 'excellent') NOT NULL,
    fertility_score FLOAT NOT NULL,
    recommendations JSON,   -- {fertilizer, manure, irrigation, advice, pesticide}
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- ============================================================
-- Table: reports
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    user_id            INT NOT NULL,
    prediction_id      INT,
    soil_analysis_id   INT,
    pdf_path           VARCHAR(512),
    crop_health_score  FLOAT,
    prevention_tips    JSON,
    pesticide_rec      VARCHAR(512),
    report_date        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)          REFERENCES users(id)         ON DELETE CASCADE,
    FOREIGN KEY (prediction_id)    REFERENCES predictions(id)   ON DELETE SET NULL,
    FOREIGN KEY (soil_analysis_id) REFERENCES soil_analysis(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- ============================================================
-- Seed: Default admin user (password: Admin@123)
-- ============================================================
INSERT INTO users (name, email, password_hash, role)
VALUES (
    'Admin',
    'admin@turmericare.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMqJqhcanFp8.GOSon8ypuRwAu',
    'admin'
) ON DUPLICATE KEY UPDATE id=id;
