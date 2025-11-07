-- Add Gender column to Guests table
USE hotel_reservation;

ALTER TABLE Guests
ADD COLUMN Gender VARCHAR(20) NULL AFTER Email;

-- Optional: Update existing records with default value
-- UPDATE Guests SET Gender = 'Not specified' WHERE Gender IS NULL;

