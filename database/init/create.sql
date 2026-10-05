-- Active: 1775814968388@@127.0.0.1@3306@dwes
#CREATE DATABASE IF NOT EXISTS tasks_db
#  CHARACTER SET utf8mb4
#  COLLATE utf8mb4_0900_ai_ci;

USE dwes;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NULL,
  status ENUM('pending', 'in_progress', 'completed')
    NOT NULL DEFAULT 'pending',
  priority ENUM('low', 'medium', 'high')
    NOT NULL DEFAULT 'medium',
  due_date DATE NULL,
  user_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_tasks_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  INDEX idx_tasks_user_id (user_id),
  INDEX idx_tasks_status (status),
  INDEX idx_tasks_due_date (due_date)
);

INSERT INTO users (
  id,
  name,
  email,
  password_hash,
  role
)
VALUES (
  1,
  'Usuario temporal',
  'temporal@example.com',
  'TEMPORARY_NOT_VALID_FOR_LOGIN',
  'user'
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name);

INSERT INTO tasks (
  title,
  description,
  status,
  priority,
  due_date,
  user_id
)
VALUES
(
  'Preparar entorno de desarrollo',
  'Instalar Node.js y comprobar npm',
  'completed',
  'high',
  NULL,
  1
),
(
  'Construir el CRUD',
  'Implementar el CRUD persistente de tareas',
  'in_progress',
  'high',
  NULL,
  1
);