# faq

stories:

1. see question, input answer, submit.





CREATE TABLE tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  question TEXT NOT NULL,
  rightAnswer TEXT NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lastShownDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  answersQuantity INT DEFAULT 0
);

CREATE TABLE answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticketId INT NOT NULL,
  body TEXT NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  rate INT NOT NULL,
  FOREIGN KEY (ticketId) REFERENCES tickets(id)
);