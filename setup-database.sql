    -- ============================================
-- Hotel Reservation System - Database Setup
-- ============================================
-- This script sets up the complete database for the hotel management system
-- 
-- FOR RAILWAY.APP:
-- 1. Go to your Railway MySQL service
-- 2. Click "Data" tab
-- 3. Copy and paste this ENTIRE file into the Query section
-- 4. Click "Run" or "Execute"
--
-- NOTE: Railway's default database is called 'railway'
-- We'll use that instead of creating a new database

-- Use Railway's default database
-- If you want to use 'hotel_reservation' instead, uncomment the next 2 lines:
-- CREATE DATABASE IF NOT EXISTS hotel_reservation;
-- USE hotel_reservation;

-- ============================================
-- TABLE CREATION
-- ============================================

-- Rooms table
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

-- Guests table
CREATE TABLE IF NOT EXISTS Guests (
    GuestId INT AUTO_INCREMENT PRIMARY KEY,
    FullName VARCHAR(100) NOT NULL,
    PhoneNumber VARCHAR(20) NOT NULL,
    Email VARCHAR(100),
    Gender VARCHAR(20),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Managers table
CREATE TABLE IF NOT EXISTS Managers (
    ManagerId INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    FullName VARCHAR(100) NOT NULL,
    Role ENUM('Yönetici', 'Personel') DEFAULT 'Personel',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    LastLoginAt DATETIME
);

-- Reservations table
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

-- ============================================
-- DEFAULT ADMIN ACCOUNT
-- ============================================
-- Email: admin@hotel.com
-- Password: admin123
-- IMPORTANT: Change this password after first login!

-- Check if admin exists, if not create it
INSERT INTO Managers (Email, PasswordHash, FullName, Role, CreatedAt)
SELECT 'admin@hotel.com', '$2b$10$W1WHyps7Ozl2NyPRovTPqu/i96dgIA2ViiUGOv.lNPXiWDWESz.Im', 'Administrator', 'Yönetici', NOW()
WHERE NOT EXISTS (SELECT 1 FROM Managers WHERE Email = 'admin@hotel.com');

-- ============================================
-- SAMPLE DATA (OPTIONAL - Comment out if not needed)
-- ============================================

-- Sample Rooms - Floor 1
INSERT IGNORE INTO Rooms (RoomNumber, Type, Status, PricePerNight, FloorNumber, MaxGuests, CreatedAt) VALUES
('101', 'Standard', 'Available', 99.99, 1, 2, NOW()),
('102', 'Standard', 'Available', 99.99, 1, 2, NOW()),
('103', 'Deluxe', 'Available', 149.99, 1, 3, NOW()),
('104', 'Deluxe', 'Available', 149.99, 1, 3, NOW()),
('105', 'Suite', 'Available', 249.99, 1, 4, NOW());

-- Sample Rooms - Floor 2
INSERT IGNORE INTO Rooms (RoomNumber, Type, Status, PricePerNight, FloorNumber, MaxGuests, CreatedAt) VALUES
('201', 'Deluxe', 'Available', 149.99, 2, 3, NOW()),
('202', 'Deluxe', 'Available', 149.99, 2, 3, NOW()),
('203', 'Suite', 'Available', 249.99, 2, 4, NOW()),
('204', 'Standard', 'Available', 99.99, 2, 2, NOW()),
('205', 'Deluxe', 'Available', 149.99, 2, 3, NOW());

-- Sample Rooms - Floor 3
INSERT IGNORE INTO Rooms (RoomNumber, Type, Status, PricePerNight, FloorNumber, MaxGuests, CreatedAt) VALUES
('301', 'Suite', 'Available', 299.99, 3, 5, NOW()),
('302', 'Suite', 'Available', 299.99, 3, 5, NOW()),
('303', 'Suite', 'Available', 299.99, 3, 5, NOW());

-- ============================================
-- VERIFICATION
-- ============================================

SELECT '✅ Database setup complete!' as Status;
SELECT COUNT(*) as TotalRooms FROM Rooms;
SELECT COUNT(*) as TotalManagers FROM Managers;
SELECT '📧 Admin Email: admin@hotel.com' as LoginInfo;
SELECT '🔑 Password: admin123' as LoginInfo;
SELECT '⚠️  CHANGE PASSWORD AFTER FIRST LOGIN!' as Warning;

