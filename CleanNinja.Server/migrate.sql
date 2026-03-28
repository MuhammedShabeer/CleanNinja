-- ============================================================
-- CleanNinja DB Migration Script
-- Adds new columns to Bookings table and creates Expenses table
-- Safe to run multiple times (all checks use IF NOT EXISTS)
-- ============================================================

PRINT 'Starting CleanNinja DB migration...';

-- 1. Add new columns to Bookings table
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'Bookings') AND name = 'StartedAt')
BEGIN ALTER TABLE Bookings ADD StartedAt DATETIME2 NULL; PRINT 'Added: Bookings.StartedAt'; END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'Bookings') AND name = 'CompletedAt')
BEGIN ALTER TABLE Bookings ADD CompletedAt DATETIME2 NULL; PRINT 'Added: Bookings.CompletedAt'; END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'Bookings') AND name = 'Revenue')
BEGIN ALTER TABLE Bookings ADD Revenue DECIMAL(18,2) NOT NULL DEFAULT 0; PRINT 'Added: Bookings.Revenue'; END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'Bookings') AND name = 'Notes')
BEGIN ALTER TABLE Bookings ADD Notes NVARCHAR(MAX) NULL; PRINT 'Added: Bookings.Notes'; END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'Bookings') AND name = 'ScheduledDate')
BEGIN ALTER TABLE Bookings ADD ScheduledDate DATETIME2 NULL; PRINT 'Added: Bookings.ScheduledDate'; END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'Bookings') AND name = 'FrequencyCount')
BEGIN ALTER TABLE Bookings ADD FrequencyCount INT NOT NULL DEFAULT 1; PRINT 'Added: Bookings.FrequencyCount'; END

-- 2. Create Expenses table if it doesn't exist
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Expenses')
BEGIN
    CREATE TABLE Expenses (
        Id          INT IDENTITY(1,1) PRIMARY KEY,
        Description NVARCHAR(MAX) NOT NULL,
        Amount      DECIMAL(18,2) NOT NULL,
        Category    NVARCHAR(100) NOT NULL DEFAULT 'General',
        Date        DATETIME2 NOT NULL,
        CreatedAt   DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
    PRINT 'Created: Expenses table';
END

PRINT 'Migration complete!';

-- Show current Bookings columns for verification
SELECT name, max_length, is_nullable
FROM sys.columns
WHERE object_id = OBJECT_ID(N'Bookings')
ORDER BY column_id;
