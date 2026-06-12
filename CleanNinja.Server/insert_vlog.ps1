$connectionString = "Server=db44529.public.databaseasp.net; Database=db44529; User Id=db44529; Password=5Dt?K=3r7m+C; Encrypt=True; TrustServerCertificate=True;"

$content = @"
<p>At Clean Ninja, we believe that delivering an unmatched professional mobile valeting service requires the best equipment on the market. That's why we're proud to use the <strong>Gold Car Detailing Business Start-Up Package</strong> from Equip2clean for our top-tier services.</p>

<h3>What's in our arsenal?</h3>
<ul>
    <li><strong>DTLR Pro Pressure Washer:</strong> A commercial-grade power washer that safely yet effectively strips dirt and grime from your vehicle. With its dual-purpose mount, it offers incredible stability and performance.</li>
    <li><strong>De-ionising Water Filter:</strong> The secret to a perfect, spot-free finish! This filter removes minerals from the water, ensuring your car dries flawlessly without any watermarks.</li>
    <li><strong>Premium Snow Foam Cannon:</strong> We blanket your vehicle in a thick layer of premium snow foam to safely encapsulate and lift away dirt before we even touch the paintwork.</li>
</ul>

<p>By investing in premium detailing equipment like this £2,995 setup, we ensure that every vehicle we touch gets the ultimate care and attention. Our commitment to quality tools means a safer wash, a deeper clean, and a showroom finish every single time.</p>
"@

$title = "Premium Equipment for Premium Results: The Gold Start-Up Package"
$imageUrl = "http://equip2clean.co.uk/cdn/shop/files/BUSINESS_PACKS_20257_0b15ec0b-a84f-403b-a06c-1b3b51dfbfc1.jpg?v=1760535618"
$author = "Clean Ninja Team"
$createdAt = [DateTime]::UtcNow.ToString("yyyy-MM-dd HH:mm:ss")

$query = @"
INSERT INTO [Blogs] ([Title], [Content], [ImageUrl], [Author], [CreatedAt], [IsPublished])
VALUES (@Title, @Content, @ImageUrl, @Author, @CreatedAt, 1)
"@

try {
    $connection = New-Object System.Data.SqlClient.SqlConnection
    $connection.ConnectionString = $connectionString
    $connection.Open()
    
    $command = $connection.CreateCommand()
    $command.CommandText = $query
    $command.Parameters.AddWithValue("@Title", $title) | Out-Null
    $command.Parameters.AddWithValue("@Content", $content) | Out-Null
    $command.Parameters.AddWithValue("@ImageUrl", $imageUrl) | Out-Null
    $command.Parameters.AddWithValue("@Author", $author) | Out-Null
    $command.Parameters.AddWithValue("@CreatedAt", $createdAt) | Out-Null
    
    $command.ExecuteNonQuery()
    
    $connection.Close()
    Write-Host "Successfully inserted the blog post!"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
