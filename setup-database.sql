    























CREATE TABLE IF NOT EXISTS Rooms (
    RoomId INT AUTO_INCREMENT PRIMARY KEY,
    RoomNumber VARCHAR(10) NOT NULL UNIQUE,
    Type VARCHAR(50) NOT NULL,
    Status VARCHAR(50) NOT NULL DEFAULT 'Available',
    CurrentReservationId INT,
    PricePerNight DECIMAL(10, 2) NOT NULL,
    FloorNumber INT NOT NULL,
    MaxGuests INT NOT NULL DEFAULT 2,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS Guests (
    GuestId INT AUTO_INCREMENT PRIMARY KEY,
    FullName VARCHAR(100) NOT NULL,
    PhoneNumber VARCHAR(20) NOT NULL,
    Email VARCHAR(100),
    Gender VARCHAR(20),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS Managers (
    ManagerId INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    FullName VARCHAR(100) NOT NULL,
    Role ENUM('Yönetici', 'Personel') DEFAULT 'Personel',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    LastLoginAt DATETIME
);


CREATE TABLE IF NOT EXISTS Reservations (
    ReservationId INT AUTO_INCREMENT PRIMARY KEY,
    RoomId INT NOT NULL,
    GuestId INT NOT NULL,
    CheckInDate DATE NOT NULL,
    CheckOutDate DATE NOT NULL,
    NumberOfGuests INT NOT NULL DEFAULT 1,
    StaffNotes TEXT,
    Status VARCHAR(50) NOT NULL DEFAULT 'Active',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    CreatedByManagerId INT NOT NULL,
    FOREIGN KEY (RoomId) REFERENCES Rooms(RoomId),
    FOREIGN KEY (GuestId) REFERENCES Guests(GuestId),
    FOREIGN KEY (CreatedByManagerId) REFERENCES Managers(ManagerId)
);









INSERT INTO Managers (Email, PasswordHash, FullName, Role, CreatedAt)
SELECT 'admin@hotel.com', '$2b$10$W1WHyps7Ozl2NyPRovTPqu/i96dgIA2ViiUGOv.lNPXiWDWESz.Im', 'Yönetici', 'Yönetici', NOW()
WHERE NOT EXISTS (SELECT 1 FROM Managers WHERE Email = 'admin@hotel.com');






INSERT IGNORE INTO Rooms (RoomNumber, Type, Status, PricePerNight, FloorNumber, MaxGuests, CreatedAt) VALUES
('101', 'Standard', 'Available', 99.99, 1, 2, NOW()),
('102', 'Standard', 'Available', 99.99, 1, 2, NOW()),
('103', 'Deluxe', 'Available', 149.99, 1, 3, NOW()),
('104', 'Deluxe', 'Available', 149.99, 1, 3, NOW()),
('105', 'Suite', 'Available', 249.99, 1, 4, NOW());


INSERT IGNORE INTO Rooms (RoomNumber, Type, Status, PricePerNight, FloorNumber, MaxGuests, CreatedAt) VALUES
('201', 'Deluxe', 'Available', 149.99, 2, 3, NOW()),
('202', 'Deluxe', 'Available', 149.99, 2, 3, NOW()),
('203', 'Suite', 'Available', 249.99, 2, 4, NOW()),
('204', 'Standard', 'Available', 99.99, 2, 2, NOW()),
('205', 'Deluxe', 'Available', 149.99, 2, 3, NOW());


INSERT IGNORE INTO Rooms (RoomNumber, Type, Status, PricePerNight, FloorNumber, MaxGuests, CreatedAt) VALUES
('301', 'Suite', 'Available', 299.99, 3, 5, NOW()),
('302', 'Suite', 'Available', 299.99, 3, 5, NOW()),
('303', 'Suite', 'Available', 299.99, 3, 5, NOW());





SELECT '✅ Database setup complete!' as Status;
SELECT COUNT(*) as TotalRooms FROM Rooms;
SELECT COUNT(*) as TotalManagers FROM Managers;
SELECT '📧 Admin Email: admin@hotel.com' as LoginInfo;
SELECT '🔑 Password: admin123' as LoginInfo;
SELECT '⚠️  CHANGE PASSWORD AFTER FIRST LOGIN!' as Warning;

