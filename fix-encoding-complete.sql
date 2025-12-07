-- Comprehensive Fix for Turkish Character Encoding
-- This changes the Role column to VARCHAR with UTF-8 encoding

-- Step 1: Change Role column from ENUM to VARCHAR with UTF-8
ALTER TABLE Managers 
MODIFY COLUMN Role VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Personel';

-- Step 2: Update existing admin to correct role
UPDATE Managers 
SET Role = 'Yönetici'
WHERE Email = 'admin@hotel.com';

-- Step 3: Verify the fix
SELECT ManagerId, Email, FullName, Role, CHAR_LENGTH(Role) as RoleLength
FROM Managers;

-- The Role should now show as 'Yönetici' (8 characters) not 'Y??netici' (10 characters)

