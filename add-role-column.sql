USE hotel_reservation;

-- Add Role column to Managers table
ALTER TABLE Managers 
ADD COLUMN Role ENUM('Yönetici', 'Personel') DEFAULT 'Personel' AFTER FullName;

-- Update existing admin account to be a Yönetici (Manager)
UPDATE Managers 
SET Role = 'Yönetici' 
WHERE Email = 'admin@hotel.com';

-- Update any other existing accounts to be Yönetici by default
UPDATE Managers 
SET Role = 'Yönetici' 
WHERE Role IS NULL;

SELECT 'Role column added successfully!' AS Status;
SELECT ManagerId, Email, FullName, Role FROM Managers;

