$connectionString = "Server=db44529.public.databaseasp.net; Database=db44529; User Id=db44529; Password=5Dt?K=3r7m+C; Encrypt=True; TrustServerCertificate=True;"

$query = @"
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Blogs' and xtype='U')
BEGIN
    CREATE TABLE [Blogs] (
        [Id] int NOT NULL IDENTITY,
        [Title] nvarchar(200) NOT NULL,
        [Content] nvarchar(max) NOT NULL,
        [ImageUrl] nvarchar(500) NULL,
        [Author] nvarchar(100) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [IsPublished] bit NOT NULL,
        CONSTRAINT [PK_Blogs] PRIMARY KEY ([Id])
    );
    PRINT 'Blogs table created.'
END
ELSE
BEGIN
    PRINT 'Blogs table already exists.'
END
"@

try {
    $connection = New-Object System.Data.SqlClient.SqlConnection
    $connection.ConnectionString = $connectionString
    $connection.Open()
    
    $command = $connection.CreateCommand()
    $command.CommandText = $query
    $command.ExecuteNonQuery()
    
    $connection.Close()
    Write-Host "Success!"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
