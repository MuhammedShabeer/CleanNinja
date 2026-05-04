using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using CleanNinja.Server.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<CleanNinja.Server.Services.IAvailabilityService, CleanNinja.Server.Services.AvailabilityService>();

// Allow large uploads (photos/videos) up to 100 MB
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 100 * 1024 * 1024; // 100 MB
});

var app = builder.Build();

app.UseCors("AllowAngular");

// Ensure uploads directory exists
var uploadsPath = Path.Combine(app.Environment.WebRootPath ?? "wwwroot", "uploads", "services");
Directory.CreateDirectory(uploadsPath);

app.UseDefaultFiles();
app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("/index.html");

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.ExecuteSqlRaw(@"
        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'AdminUsers' AND COLUMN_NAME = 'AllowedMenus')
        BEGIN
            ALTER TABLE AdminUsers ADD AllowedMenus NVARCHAR(MAX) NOT NULL DEFAULT 'all';
        END

        -- Update existing plain text admin password to BCrypt hash if it matches 'admin'
        UPDATE AdminUsers SET PasswordHash = '$2a$11$IvB0pX0zK4Hk.V3eO7Z9G.V6E9p6s8hR5n/K6mE0WpIUPnQ.R1Z2G' WHERE PasswordHash = 'admin';
            
        IF NOT EXISTS (SELECT * FROM AdminUsers WHERE Email = 'admin@cleanninja.com')
        BEGIN
            INSERT INTO AdminUsers (Name, Email, PasswordHash) VALUES ('Admin', 'admin@cleanninja.com', '$2a$11$IvB0pX0zK4Hk.V3eO7Z9G.V6E9p6s8hR5n/K6mE0WpIUPnQ.R1Z2G');
        END

        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'WorkingHours')
        BEGIN
            CREATE TABLE WorkingHours (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                DayOfWeek INT NOT NULL,
                StartTime TIME NOT NULL,
                EndTime TIME NOT NULL,
                IsClosed BIT NOT NULL DEFAULT 0,
                CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
            );
            -- Default 08:00 - 18:00 for all days
            INSERT INTO WorkingHours (DayOfWeek, StartTime, EndTime, IsClosed) 
            SELECT value, '08:00:00', '18:00:00', 0 FROM (VALUES (0),(1),(2),(3),(4),(5),(6)) as V(value);
        END

        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'WorkSchedules')
        BEGIN
            CREATE TABLE WorkSchedules (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                BookingId INT NOT NULL,
                ScheduledStart DATETIME2 NOT NULL,
                ScheduledEnd DATETIME2 NOT NULL,
                Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
                Notes NVARCHAR(MAX) NULL,
                CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
                CONSTRAINT FK_WorkSchedules_Bookings FOREIGN KEY (BookingId) REFERENCES Bookings (Id) ON DELETE CASCADE
            );
        END

        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'BookingEmployee')
        BEGIN
            CREATE TABLE BookingEmployee (
                BookingsId INT NOT NULL,
                AssignedEmployeesId INT NOT NULL,
                CONSTRAINT PK_BookingEmployee PRIMARY KEY (BookingsId, AssignedEmployeesId),
                CONSTRAINT FK_BookingEmployee_Bookings FOREIGN KEY (BookingsId) REFERENCES Bookings (Id) ON DELETE CASCADE,
                CONSTRAINT FK_BookingEmployee_Employees FOREIGN KEY (AssignedEmployeesId) REFERENCES Employees (Id) ON DELETE CASCADE
            );
        END

        -- Add missing columns to Services
        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Services' AND COLUMN_NAME = 'DefaultDurationMinutes')
        BEGIN
            ALTER TABLE Services ADD DefaultDurationMinutes INT NOT NULL DEFAULT 60;
        END

        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Services' AND COLUMN_NAME = 'ShowInOffersPopup')
        BEGIN
            ALTER TABLE Services ADD ShowInOffersPopup BIT NOT NULL DEFAULT 0;
        END

        -- Add missing columns to Bookings
        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Bookings' AND COLUMN_NAME = 'DurationMinutes')
        BEGIN
            ALTER TABLE Bookings ADD DurationMinutes INT NOT NULL DEFAULT 60;
        END
        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Bookings' AND COLUMN_NAME = 'Frequency')
        BEGIN
            ALTER TABLE Bookings ADD Frequency NVARCHAR(MAX) NULL;
        END
        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Bookings' AND COLUMN_NAME = 'FrequencyCount')
        BEGIN
            ALTER TABLE Bookings ADD FrequencyCount INT NOT NULL DEFAULT 1;
        END

        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Services' AND COLUMN_NAME = 'Category')
        BEGIN
            ALTER TABLE Services ADD Category NVARCHAR(MAX) NOT NULL DEFAULT 'Uncategorized';
        END
    "
    );

    db.Database.ExecuteSqlRaw(@"
        -- Basic categorization update
        UPDATE Services SET Category = 'Car Wash' WHERE Category = 'Uncategorized' AND (Name LIKE '%Wash%' OR Name LIKE '%Detail%' OR Name LIKE '%Valet%');
        UPDATE Services SET Category = 'Bin Cleaning' WHERE Category = 'Uncategorized' AND (Name LIKE '%Bin%');
        UPDATE Services SET Category = 'Window Cleaning' WHERE Category = 'Uncategorized' AND (Name LIKE '%Window%');
        UPDATE Services SET Category = 'Home Cleaning' WHERE Category = 'Uncategorized' AND (Name LIKE '%Home%' OR Name LIKE '%Carpet%' OR Name LIKE '%Tenancy%');
        IF NOT EXISTS (SELECT * FROM Services WHERE Name = 'Silver Package')
        BEGIN
            INSERT INTO Services (Name, Description, Category, Price, DefaultDurationMinutes, IsActive, IsHighlighted, Icon, SortOrder, CreatedAt)
            VALUES ('Silver Package', 'Placeholder', 'Car Wash', 24.99, 60, 1, 0, '', 0, GETUTCDATE());
        END

        IF NOT EXISTS (SELECT * FROM Services WHERE Name = 'Gold Package')
        BEGIN
            INSERT INTO Services (Name, Description, Category, Price, DefaultDurationMinutes, IsActive, IsHighlighted, Icon, SortOrder, CreatedAt)
            VALUES ('Gold Package', 'Placeholder', 'Car Wash', 44.99, 90, 1, 1, '', 0, GETUTCDATE());
        END

        IF NOT EXISTS (SELECT * FROM Services WHERE Name = 'Pavement Cleaning')
        BEGIN
            INSERT INTO Services (Name, Description, Category, Price, DefaultDurationMinutes, IsActive, IsHighlighted, Icon, SortOrder, CreatedAt)
            VALUES ('Pavement Cleaning', 'Professional high-pressure washing for driveways, patios, and pavements to remove dirt, moss, and stains.', 'Pavement Cleaning', 80.00, 120, 1, 0, '', 0, GETUTCDATE());
        END

        -- Explicitly update descriptions and fix broken icons
        UPDATE Services SET 
            Description = '<strong>EXTERIOR FOAM WASH</strong><ul style=""margin-top:10px; padding-left:20px;""><li>HIGH PRESURE PRE RINSE TO REMOVE LOOSE DIRT</li><li>THICK FOAM WASH USING PREMIUM SHAMPOO</li><li>EXTERIOR BODY HAND WASH</li><li>WHEEL &amp; RIM DEEP CLEANING</li><li>TYRE WASH &amp; BASIC TYRE SHINE</li><li>UNDER BODY WASH</li><li>DOOR SILLS &amp; EXTERIOR TRIMS WIPED CLEAN</li><li>EXTERIOR GLASS CLEANING</li><li>FINAL HAND DRY FOR A STREAK FREE FINISH</li></ul>', 
            Icon = '' 
        WHERE Name = 'Silver Package';

        UPDATE Services SET 
            Description = '<strong>COMPLETE INTERIOR &amp; EXTERIOR CARE</strong><br><br><strong>EXTERIOR CLEANING</strong><ul style=""margin-top:10px; padding-left:20px;""><li>HIGH PRESURE PRE RINSE TO REMOVE LOOSE DIRT</li><li>THICK FOAM WASH USING PREMIUM SHAMPOO</li><li>EXTERIOR BODY HAND WASH</li><li>WHEEL &amp; RIM DEEP CLEANING</li><li>TYRE WASH &amp; BASIC TYRE SHINE</li><li>UNDER BODY WASH</li><li>DOOR SILLS &amp; EXTERIOR TRIMS WIPED CLEAN</li><li>EXTERIOR GLASS CLEANING</li><li>FINAL HAND DRY FOR A STREAK FREE FINISH</li></ul><strong>INTERIOR CLEANING</strong><ul style=""margin-top:10px; padding-left:20px;""><li>FULL INTERIOR VACCUM CLEANING</li><li>MAT CLEANING (RUBBER OR FABRIC)</li><li>DASHBOARD &amp; INTERIOR PANEL POLISH</li><li>CENTER CONSOLE &amp; CUP HOLDER CLEANING</li><li>DOOR PANEL &amp; HANDLE CLEANING</li><li>INTERIOR GLASS CLEANING</li><li>HANGING CAR FRESHNER</li></ul>', 
            Icon = '' 
        WHERE Name = 'Gold Package';

        UPDATE Services SET Icon = '' WHERE Name = 'Pavement Cleaning';

        -- Deactivate old generic Car Wash service
        UPDATE Services SET IsActive = 0 WHERE Name = 'Car Wash';

        -- Seed Service Media
        DECLARE @SilverId INT = (SELECT TOP 1 Id FROM Services WHERE Name = 'Silver Package');
        IF @SilverId IS NOT NULL AND NOT EXISTS (SELECT * FROM ServiceMedia WHERE ServiceId = @SilverId AND FileName = 'silver_package.png')
        BEGIN
            INSERT INTO ServiceMedia (ServiceId, FileName, FileType, Url, CreatedAt) VALUES (@SilverId, 'silver_package.png', 'image', 'seeded_images/silver_package.png', GETUTCDATE());
        END

        DECLARE @GoldId INT = (SELECT TOP 1 Id FROM Services WHERE Name = 'Gold Package');
        IF @GoldId IS NOT NULL AND NOT EXISTS (SELECT * FROM ServiceMedia WHERE ServiceId = @GoldId AND FileName = 'gold_package.png')
        BEGIN
            INSERT INTO ServiceMedia (ServiceId, FileName, FileType, Url, CreatedAt) VALUES (@GoldId, 'gold_package.png', 'image', 'seeded_images/gold_package.png', GETUTCDATE());
        END

        DECLARE @PavementId INT = (SELECT TOP 1 Id FROM Services WHERE Name = 'Pavement Cleaning');
        IF @PavementId IS NOT NULL AND NOT EXISTS (SELECT * FROM ServiceMedia WHERE ServiceId = @PavementId AND FileName = 'pavement_cleaning.png')
        BEGIN
            INSERT INTO ServiceMedia (ServiceId, FileName, FileType, Url, CreatedAt) VALUES (@PavementId, 'pavement_cleaning.png', 'image', 'seeded_images/pavement_cleaning.png', GETUTCDATE());
        END

        DECLARE @CarpetId INT = (SELECT TOP 1 Id FROM Services WHERE Name = 'Carpet Cleaning');
        IF @CarpetId IS NOT NULL AND NOT EXISTS (SELECT * FROM ServiceMedia WHERE ServiceId = @CarpetId AND FileName = 'carpet_cleaning.png')
        BEGIN
            INSERT INTO ServiceMedia (ServiceId, FileName, FileType, Url, CreatedAt) VALUES (@CarpetId, 'carpet_cleaning.png', 'image', 'seeded_images/carpet_cleaning.png', GETUTCDATE());
        END

        DECLARE @HouseId INT = (SELECT TOP 1 Id FROM Services WHERE Name = 'House Cleaning');
        IF @HouseId IS NOT NULL AND NOT EXISTS (SELECT * FROM ServiceMedia WHERE ServiceId = @HouseId AND FileName = 'house_cleaning.png')
        BEGIN
            INSERT INTO ServiceMedia (ServiceId, FileName, FileType, Url, CreatedAt) VALUES (@HouseId, 'house_cleaning.png', 'image', 'seeded_images/house_cleaning.png', GETUTCDATE());
        END

        DECLARE @WindowId INT = (SELECT TOP 1 Id FROM Services WHERE Name = 'Window Cleaning');
        IF @WindowId IS NOT NULL AND NOT EXISTS (SELECT * FROM ServiceMedia WHERE ServiceId = @WindowId AND FileName = 'window_cleaning.png')
        BEGIN
            INSERT INTO ServiceMedia (ServiceId, FileName, FileType, Url, CreatedAt) VALUES (@WindowId, 'window_cleaning.png', 'image', 'seeded_images/window_cleaning.png', GETUTCDATE());
        END

        DECLARE @BinId INT = (SELECT TOP 1 Id FROM Services WHERE Name = 'Bin Cleaning');
        IF @BinId IS NOT NULL AND NOT EXISTS (SELECT * FROM ServiceMedia WHERE ServiceId = @BinId AND FileName = 'bin_cleaning.png')
        BEGIN
            INSERT INTO ServiceMedia (ServiceId, FileName, FileType, Url, CreatedAt) VALUES (@BinId, 'bin_cleaning.png', 'image', 'seeded_images/bin_cleaning.png', GETUTCDATE());
        END
    "
    );
}

app.Run();
