-- ═══════════════════════════════════════════════
-- CVC Hire — Database Schema
-- Import this in phpMyAdmin (XAMPP) to create everything
-- ═══════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS cvc_hire CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE cvc_hire;

-- Students ---------------------------------------------------
CREATE TABLE students (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(150),
    last_name   VARCHAR(80),
    first_name  VARCHAR(80),
    mi          VARCHAR(10),
    birthdate   DATE NULL,
    age         INT NULL,
    phone       VARCHAR(30),
    address     VARCHAR(255),
    skills      TEXT,
    course      VARCHAR(150),
    school      VARCHAR(150),
    bio         TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Employers ----------------------------------------------------
CREATE TABLE employers (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password      VARCHAR(255) NOT NULL,
    contact_name  VARCHAR(150),
    phone         VARCHAR(30),
    address       VARCHAR(255),
    company_name  VARCHAR(150),
    industry      VARCHAR(150),
    website       VARCHAR(255),
    description   TEXT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Jobs -----------------------------------------------------------
CREATE TABLE jobs (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    employer_id  INT NOT NULL,
    title        VARCHAR(150) NOT NULL,
    company      VARCHAR(150),
    type         ENUM('internship','fulltime','remote') DEFAULT 'fulltime',
    location     VARCHAR(150),
    salary       VARCHAR(100),
    description  TEXT,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employer_id) REFERENCES employers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Applications -----------------------------------------------------
CREATE TABLE applications (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    job_id         INT NOT NULL,
    student_email  VARCHAR(150) NOT NULL,
    student_name   VARCHAR(150),
    status         ENUM('Pending','Interview','Accepted','Rejected') DEFAULT 'Pending',
    applied_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_application (job_id, student_email),
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Saved jobs -------------------------------------------------------
CREATE TABLE saved_jobs (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    student_email  VARCHAR(150) NOT NULL,
    job_id         INT NOT NULL,
    UNIQUE KEY unique_save (student_email, job_id),
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Interview / chat messages ------------------------------------------
CREATE TABLE messages (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    job_id         INT NOT NULL,
    student_email  VARCHAR(150) NOT NULL,
    sender         ENUM('student','employer') NOT NULL,
    message        TEXT NOT NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB;
