CREATE TABLE discordUsers (
    id VARCHAR(32) PRIMARY KEY,
    discordName VARCHAR(255),
    websiteName VARCHAR(255),
    recruit TINYINT(1) DEFAULT 0
);

CREATE TABLE missingDonations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    missing INT DEFAULT 0
);

CREATE TABLE signs(
    signDate DATE,
    player VARCHAR(255),
    PRIMARY KEY(signDate, player)
);
