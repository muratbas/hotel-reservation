-- Fix Admin Account Role Encoding Issue
-- This updates the admin account to have the correct Turkish character encoding

-- Update the admin account with correct UTF-8 role
UPDATE Managers 
SET Role = 'Yönetici' 
WHERE Email = 'admin@hotel.com';

-- Verify the update
SELECT ManagerId, Email, FullName, Role 
FROM Managers 
WHERE Email = 'admin@hotel.com';

-- Result should show: Role = Yönetici (with correct Turkish ö character)

