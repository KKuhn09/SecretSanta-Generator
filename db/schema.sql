DROP DATABASE IF EXISTS secretsanta_db;
CREATE DATABASE secretsanta_db;

USE secretsanta_db;

CREATE TABLE users(
	id INT NOT NULL AUTO_INCREMENT,
	username VARCHAR(255) NOT NULL,
	password VARCHAR(14) NOT NULL,
	PRIMARY KEY (id)
);