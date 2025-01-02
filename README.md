# faq

stories:

1. see question, input answer, submit.


CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  passwordHash VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE folders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  userId INT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE topics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  folderId INT NOT NULL,
  userId INT NOT NULL,
  FOREIGN KEY (folderId) REFERENCES folders(id),
  FOREIGN KEY (userId) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  question TEXT NOT NULL,
  rightAnswer TEXT NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lastShownDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  answersQuantity INT DEFAULT 0,
  folderId INT NOT NULL,
  topicId INT NOT NULL,
  userId INT NOT NULL,
  FOREIGN KEY (folderId) REFERENCES folders(id),
  FOREIGN KEY (topicId) REFERENCES topics(id),
  FOREIGN KEY (userId) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticketId INT NOT NULL,
  body TEXT NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  rate INT NOT NULL,
  userId INT NOT NULL,
  FOREIGN KEY (ticketId) REFERENCES tickets(id),
  FOREIGN KEY (userId) REFERENCES users(id)
) ENGINE=InnoDB;


===

To display a ticket that was not displayed more than others, you need to prioritize tickets based on their lastShownDate and answersQuantity. The goal is to find the ticket that has been shown the least or has the oldest lastShownDate.

SELECT *
FROM tickets
ORDER BY lastShownDate ASC, answersQuantity ASC
LIMIT 1;

Once you display the ticket, you should update its lastShownDate to the current timestamp to ensure it’s not repeatedly shown. Here’s how you can do it:

UPDATE tickets
SET lastShownDate = CURRENT_TIMESTAMP
WHERE id = <ticket_id>;

upadte table:

ALTER TABLE tickets
ADD COLUMN folder VARCHAR(255) NOT NULL,
ADD COLUMN topic VARCHAR(255) NOT NULL;




