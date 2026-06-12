$connectionString = "Server=db44529.public.databaseasp.net; Database=db44529; User Id=db44529; Password=5Dt?K=3r7m+C; Encrypt=True; TrustServerCertificate=True;"

$blogs = @(
    @{
        Title = "The Ultimate Car Wash Experience: Why Regular Cleaning Matters"
        Content = @"
<p>Maintaining a clean car is about more than just aesthetics; it's about preserving the value and integrity of your vehicle. At Clean Ninja, our professional exterior and interior car detailing service ensures every nook and cranny is spotless.</p>
<h3>Why Choose Professional Car Detailing?</h3>
<ul>
    <li><strong>Preserve Your Paintwork:</strong> Regular washing removes acidic contaminants like bird droppings and bug splatter that can eat into your clear coat.</li>
    <li><strong>Enhance Resale Value:</strong> A well-maintained car exterior and a fresh interior can significantly boost the resale value of your vehicle.</li>
    <li><strong>Healthier Interior:</strong> Our interior cleaning eliminates dust, allergens, and bacteria, making your commute much healthier.</li>
</ul>
<p>Don't settle for a basic drive-through wash. Let the professionals give your car the attention it deserves!</p>
"@
        ImageUrl = "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        Author = "Clean Ninja Team"
    },
    @{
        Title = "Revitalize Your Home with Professional Carpet Cleaning"
        Content = @"
<p>Carpets are magnets for dirt, dust mites, pet dander, and allergens. Even with regular vacuuming, deep-seated grime can wear down carpet fibers and impact indoor air quality. That's where our Deep Carpet Cleaning comes in!</p>
<h3>The Benefits of Deep Extraction</h3>
<p>We use industrial-grade equipment to sanitize and lift stains from all carpet types. Our process not only restores the vibrant color and soft texture of your carpets but also completely removes odor-causing bacteria.</p>
<p>Whether it's a high-traffic hallway or a cozy living room, professional cleaning extends the lifespan of your carpets and creates a fresher, healthier home environment.</p>
"@
        ImageUrl = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        Author = "Clean Ninja Team"
    },
    @{
        Title = "A Spotless Home is a Happy Home: Our House Cleaning Services"
        Content = @"
<p>Life gets busy, and keeping up with household chores can be overwhelming. Clean Ninja offers deep home cleaning services, inside and out, so you can spend your free time doing what you love.</p>
<h3>Comprehensive Cleaning Solutions</h3>
<p>Our dedicated team tackles everything from dusty ceiling fans to grimy baseboards. We focus on high-touch areas, kitchens, and bathrooms to ensure a hygienic environment for your family.</p>
<p>Experience the peace of mind that comes with returning to a sparkling clean house. Book an appointment today to get a custom quote tailored to your home's needs!</p>
"@
        ImageUrl = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        Author = "Clean Ninja Team"
    },
    @{
        Title = "Let the Light In: The Importance of Professional Window Cleaning"
        Content = @"
<p>Nothing ruins a beautiful view quite like dirty, streaky windows. Our professional window cleaning service guarantees shiny, streak-free windows that instantly brighten up your home or office.</p>
<h3>More Than Just Glass</h3>
<p>We don't just clean the glass; we take care of the frames, sills, and tracks. Removing built-up dirt and debris prevents hardware degradation and ensures smooth operation of your windows.</p>
<p>Boost your property's curb appeal and let natural light flood your living spaces. Contact us for a quote!</p>
"@
        ImageUrl = "https://images.unsplash.com/photo-1527689638836-411945a2b57c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        Author = "Clean Ninja Team"
    },
    @{
        Title = "Introducing the Silver Package: The Essential Exterior Wash"
        Content = @"
<p>Looking for a quick but thorough exterior clean? Our <strong>Silver Package</strong> is the perfect maintenance wash to keep your car looking sharp.</p>
<h3>What's Included?</h3>
<ul>
    <li>High-pressure pre-rinse to remove loose dirt without scratching the paint.</li>
    <li>Thick foam wash using premium pH-neutral shampoo.</li>
    <li>Detailed wheel and rim deep cleaning, paired with a basic tyre shine.</li>
    <li>Underbody wash to remove corrosive salt and grime.</li>
    <li>Exterior glass cleaning and a streak-free hand dry finish.</li>
</ul>
<p>It's the ideal choice for regular upkeep, ensuring your vehicle maintains its pristine appearance week after week.</p>
"@
        ImageUrl = "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        Author = "Clean Ninja Team"
    },
    @{
        Title = "The Gold Package: Complete Interior & Exterior Care"
        Content = @"
<p>When your car needs a reset inside and out, the <strong>Gold Package</strong> delivers. It combines our thorough exterior wash with a meticulous interior detailing service.</p>
<h3>The Gold Standard</h3>
<p>On top of the comprehensive exterior foam wash and wheel cleaning, we dive deep into the cabin. This includes a full interior vacuum, mat cleaning, and dashboard/panel polishing. We clean your center console, cup holders, and interior glass, leaving your car looking and smelling brand new.</p>
<p>Treat your car to the Gold Package and enjoy that 'new car' feeling all over again.</p>
"@
        ImageUrl = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        Author = "Clean Ninja Team"
    },
    @{
        Title = "Transform Your Driveway with Pavement Cleaning"
        Content = @"
<p>Your driveway and patio are the first things people see, but over time, they gather dirt, moss, algae, and tough stains. Our professional high-pressure pavement washing restores these surfaces to their former glory.</p>
<h3>Safety and Aesthetics</h3>
<p>Moss and algae don't just look bad; they can make surfaces incredibly slippery and dangerous. Our high-pressure cleaning safely removes these hazards while dramatically improving the curb appeal of your property.</p>
<p>Ready to transform your outdoor spaces? Book an appointment today for a personalized quote.</p>
"@
        ImageUrl = "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        Author = "Clean Ninja Team"
    },
    @{
        Title = "The Premium Platinum Package: Ultimate Car Detailing"
        Content = @"
<p>For the true automotive enthusiast or anyone preparing to sell their vehicle, the <strong>Premium Platinum Package</strong> offers an unmatched level of detailing.</p>
<h3>Total Transformation</h3>
<p>This package leaves no stone unturned. We start with engine room cleaning and degreasing, followed by iron particle and water spot removal on the exterior. We finish the exterior with a ceramic shampoo wash and spray ceramic protection for lasting shine and defense.</p>
<p>Inside, we perform deep seat and carpet extraction to remove embedded stains, along with comprehensive dashboard, console, and door panel polishing. It's the ultimate spa day for your vehicle.</p>
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
    
    foreach ($blog in $blogs) {
        $command = $connection.CreateCommand()
        $command.CommandText = $query
        
        $command.Parameters.AddWithValue("@Title", $blog.Title) | Out-Null
        $command.Parameters.AddWithValue("@Content", $blog.Content) | Out-Null
        $command.Parameters.AddWithValue("@ImageUrl", $blog.ImageUrl) | Out-Null
        $command.Parameters.AddWithValue("@Author", $blog.Author) | Out-Null
        $command.Parameters.AddWithValue("@CreatedAt", [DateTime]::UtcNow.ToString("yyyy-MM-dd HH:mm:ss")) | Out-Null
        
        $command.ExecuteNonQuery()
        Write-Host "Inserted: $($blog.Title)"
        Start-Sleep -Seconds 1 # small delay to differentiate CreatedAt timestamps
    }
    
    $connection.Close()
    Write-Host "Successfully inserted all blog posts!"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
