$connStr = "Server=db44529.public.databaseasp.net; Database=db44529; User Id=db44529; Password=5Dt?K=3r7m+C; Encrypt=True; TrustServerCertificate=True;"
$conn = New-Object System.Data.SqlClient.SqlConnection($connStr)
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT Id, Name, Description FROM Services"
$reader = $cmd.ExecuteReader()
while($reader.Read()) {
    Write-Host ($reader["Name"].ToString() + " - " + $reader["Description"].ToString())
}
$conn.Close()
