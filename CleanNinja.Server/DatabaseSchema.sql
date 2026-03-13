-- Database Schema for CleanNinja

CREATE TABLE Bookings (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CustomerName NVARCHAR(255) NOT NULL,
    Phone NVARCHAR(50) NOT NULL,
    ServicePackage NVARCHAR(50) NOT NULL,
    Latitude FLOAT NOT NULL,
    Longitude FLOAT NOT NULL,
    Status NVARCHAR(50) DEFAULT 'Pending',
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE SiteContent (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Section NVARCHAR(100) NOT NULL,
    [Key] NVARCHAR(100) NOT NULL,
    Value NVARCHAR(MAX) NOT NULL
);

-- Seed Data for Site Content
INSERT INTO SiteContent (Section, [Key], Value)
VALUES 
    ('LandingPage', 'Tagline', 'In a mission to keep our red land clean.'),
    ('LandingPage', 'Services', '["Car Wash", "Bin Cleaning", "Window Cleaning"]'),
    ('Pricing', 'SilverPackagePrice', '24.99'),
    ('Pricing', 'SilverPackageFeatures', '["Exterior Foam Wash", "Wheel Cleaning", "Tire Dressing", "Interior Vacuum"]'),
    ('Pricing', 'GoldPackagePrice', '44.99'),
    ('Pricing', 'GoldPackageFeatures', '["Complete Interior/Exterior Care", "Wax Protection", "Upholstery Cleaning", "Engine Bay Cleaning"]'),
    ('Social', 'InstagramHandle', '@clean_ninja_official'),
    ('Admin', 'WhatsAppContact', '+447578334674');
