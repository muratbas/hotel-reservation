-- Fix Role to Use English Instead of Turkish
-- This avoids character encoding issues completely

-- Update all managers to use English roles
UPDATE Managers 
SET Role = 'Manager' 
WHERE Role = 'Yönetici' OR Role LIKE 'Y%netici';

UPDATE Managers 
SET Role = 'Staff' 
WHERE Role = 'Personel';

-- Verify the update
SELECT ManagerId, Email, FullName, Role 
FROM Managers;

