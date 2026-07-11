$connectionString = "Server=db44529.public.databaseasp.net; Database=db44529; User Id=db44529; Password=5Dt?K=3r7m+C; Encrypt=True; TrustServerCertificate=True;"

$moreBlogs = @(
    @{
        Title = "Luxury Mobile Car Valeting & Detailing in Southport"
        Content = @"
<p>Southport is famous for its beautiful coastline, historic architecture, and premium vehicles. To keep your car looking its best despite the seaside wind and salt spray, Clean Ninja's luxury mobile car valeting and detailing in Southport brings the ultimate showroom treatment straight to your driveway.</p>
<h3>Tailored Detailing Packages</h3>
<p>From clay bar paint decontamination to hand-applied ceramic spray coatings, our professional detailers treat your vehicle with maximum precision. We steam-sanitize interior surfaces, extract deep stains from seats, and restore dashboards to pristine condition.</p>
<p>Book your Southport mobile valeting appointment today and let us restore your car's natural shine!</p>
"@
        ImageUrl = "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        Author = "Clean Ninja Team"
    },
    @{
        Title = "Premium House Cleaning & Domestic Help in Maghull"
        Content = @"
<p>Maghull is a popular, family-friendly residential suburb in Liverpool. Balancing family life, work, and household chores can be a struggle. Clean Ninja's premium house cleaning and domestic services in Maghull are here to give you back your free time.</p>
<h3>Custom Home Cleaning</h3>
<p>Our domestic cleaning plans are tailored to your home's unique requirements. We deep-clean kitchens, sanitize bathrooms, polish surfaces, and ensure high-traffic areas are spotless. Our vetted, fully insured professionals deliver peace of mind with every clean.</p>
<p>Enjoy a beautiful, fresh home. Contact us today for a free cleaning estimate in Maghull!</p>
"@
        ImageUrl = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        Author = "Clean Ninja Team"
    },
    @{
        Title = "Professional Carpet & Rug Deep Cleaning in St Helens"
        Content = @"
<p>Carpets add comfort to your home, but they also trap dust, pet hair, dirt, and allergens over time. Clean Ninja offers professional carpet and rug deep extraction cleaning in St Helens to revitalize your flooring and improve indoor air quality.</p>
<h3>Industrial Dirt Extraction</h3>
<p>Our carpet cleaning technicians use high-pressure hot water extraction to lift deeply embedded dirt, stains, and bacteria from carpet fibers. This process sanitizes your carpets, eliminates odors, and restores their soft, natural texture.</p>
<p>Extend the life of your carpets. Book a deep extraction carpet clean in St Helens today!</p>
"@
        ImageUrl = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        Author = "Clean Ninja Team"
    },
    @{
        Title = "End of Tenancy & Move-Out Cleaning Services in Prescot"
        Content = @"
<p>Moving out of a rented property in Prescot? Ensuring the house is clean enough to get your deposit back is a major challenge. Clean Ninja provides fully guaranteed, professional end of tenancy cleaning services in Prescot to make your move completely stress-free.</p>
<h3>Our Landlord-Approved Guarantee</h3>
<p>We clean everything from the inside of ovens and refrigerators to skirting boards, window frames, and sanitizing bathrooms. Our team follows agency-approved checklists to ensure you pass your move-out inspection on the first attempt.</p>
<p>Secure your full deposit refund. Schedule your end of tenancy clean in Prescot today.</p>
"@
        ImageUrl = "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        Author = "Clean Ninja Team"
    },
    @{
        Title = "Mobile Van Washing & Commercial Fleet Valeting in Bootle"
        Content = @"
<p>Maintaining a clean, professional vehicle fleet is essential for businesses in Bootle. Clean Ninja offers mobile van washing and commercial vehicle fleet valeting in Bootle to ensure your business makes the best impression on the road.</p>
<h3>On-Site Fleet Maintenance</h3>
<p>We bring our mobile cleaning units directly to your yard or business premises. We wash exteriors, sanitize cabs, and clean cargo areas at times that won't disrupt your daily deliveries. Our commercial rates are competitive and flexible.</p>
<p>Keep your commercial fleet looking sharp. Contact us for business valeting rates in Bootle.</p>
"@
        ImageUrl = "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
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
    
    foreach ($blog in $moreBlogs) {
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
    Write-Host "Successfully inserted more local SEO blog posts!"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
