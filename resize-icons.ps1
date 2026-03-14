Add-Type -AssemblyName System.Drawing

$sourcePath = "d:\Others\CleanNinja\CleanNinja\Images\CleanNinjaWB.png"
$img = [System.Drawing.Image]::FromFile($sourcePath)

$dest192 = "d:\Others\CleanNinja\CleanNinja\cleanninja.client\public\assets\images\icon-192x192.png"
$bmp192 = New-Object System.Drawing.Bitmap(192, 192)
$graph192 = [System.Drawing.Graphics]::FromImage($bmp192)
$graph192.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graph192.DrawImage($img, 0, 0, 192, 192)
$bmp192.Save($dest192, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp192.Dispose()
$graph192.Dispose()

$dest512 = "d:\Others\CleanNinja\CleanNinja\cleanninja.client\public\assets\images\icon-512x512.png"
$bmp512 = New-Object System.Drawing.Bitmap(512, 512)
$graph512 = [System.Drawing.Graphics]::FromImage($bmp512)
$graph512.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graph512.DrawImage($img, 0, 0, 512, 512)
$bmp512.Save($dest512, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp512.Dispose()
$graph512.Dispose()

$img.Dispose()

Write-Host "Icons generated successfully!"
