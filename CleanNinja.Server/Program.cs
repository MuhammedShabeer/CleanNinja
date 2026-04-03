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
    ");
}

app.Run();
