$connectionString = "Server=db44529.public.databaseasp.net; Database=db44529; User Id=db44529; Password=5Dt?K=3r7m+C; Encrypt=True; TrustServerCertificate=True;"

$seoBlogs = @(
    @{
        Title = "The Ultimate Guide to Mobile Car Valeting in Liverpool: What to Expect"
        Content = @"
<p>If you're looking to restore your vehicle to showroom condition without leaving your home, mobile car valeting is the perfect solution. At Clean Ninja, we bring the ultimate mobile car valeting experience straight to your driveway in Liverpool.</p>

<h3>What is Mobile Car Valeting?</h3>
<p>Unlike a quick drive-through car wash, professional mobile valeting is a comprehensive, detailing-focused process. We use specialized equipment, safe wash techniques, and premium pH-neutral chemicals to clean, protect, and restore your car's paint, wheels, and cabin.</p>

<h3>Key Benefits of Our Liverpool Mobile Valeting Service:</h3>
<ul>
    <li><strong>Convenience:</strong> No waiting in long queues. We clean your car at your home or workplace.</li>
    <li><strong>Scratch-Free Methods:</strong> Safe two-bucket wash and snow foam techniques prevent swirl marks and paint scratches.</li>
    <li><strong>Complete Cabin Reset:</strong> Meticulous vacuuming, steam sanitization, and console polishing for a fresh interior.</li>
</ul>
<p>Whether you need a maintenance clean or a full detail, Clean Ninja is Liverpool's trusted choice for premium mobile car care.</p>
"@
        ImageUrl = "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        Author = "Clean Ninja Team"
    },
    @{
        Title = "End of Tenancy Cleaning Liverpool: The Complete Move-Out Checklist"
        Content = @"
<p>Moving home is stressful enough without worrying about getting your tenancy deposit back. In the UK, disputes over cleanliness are the leading cause of deposit deductions. Hiring a professional end of tenancy cleaning service in Liverpool is the smartest way to guarantee a hassle-free handover.</p>

<h3>Our Tenancy Move-Out Cleaning Checklist:</h3>
<p>To ensure your landlord or agency is completely satisfied, our professional team follows a rigorous deep cleaning checklist:</p>
<ul>
    <li><strong>Kitchen Deep Clean:</strong> Meticulous oven, hob, extractor fan, fridge, and cupboard degreasing.</li>
    <li><strong>Sanitized Bathrooms:</strong> Descaling taps, scrubbing tiles, cleaning shower screens, and deep toilet sanitization.</li>
    <li><strong>Living Rooms & Bedrooms:</strong> Cleaning window frames, dusting light fixtures, vacuuming carpets, and wiping down skirting boards.</li>
</ul>
<p>With Clean Ninja, you get a fully guaranteed end of tenancy clean in Liverpool, delivered by insured cleaning professionals. Book your slot today and secure your full deposit refund!</p>
"@
        ImageUrl = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        Author = "Clean Ninja Team"
    }
)

$query = @"
INSERT INTO [Blogs] ([Title], [Content], [ImageUrl], [Author], [CreatedAt], [IsPublished])
VALUES (@Title, @Content, @ImageUrl, @Author, @CreatedAt, 1)
"@

try {
    $connection = New-Object System.Data.SqlClient.SqlConnection
    $connection.ConnectionString = $connectionString
    $connection.Open()
    
    foreach ($blog in $seoBlogs) {
        $command = $connection.CreateCommand()
        $command.CommandText = $query
        
        $command.Parameters.AddWithValue("@Title", $blog.Title) | Out-Null
        $command.Parameters.AddWithValue("@Content", $blog.Content) | Out-Null
        $command.Parameters.AddWithValue("@ImageUrl", $blog.ImageUrl) | Out-Null
        $command.Parameters.AddWithValue("@Author", $blog.Author) | Out-Null
        $command.Parameters.AddWithValue("@CreatedAt", [DateTime]::UtcNow.ToString("yyyy-MM-dd HH:mm:ss")) | Out-Null
        
        $command.ExecuteNonQuery()
        Write-Host "Inserted: $($blog.Title)"
        Start-Sleep -Seconds 1
    }
    
    $connection.Close()
    Write-Host "Successfully inserted all SEO blog posts!"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
