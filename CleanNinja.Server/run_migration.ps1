$r = Invoke-WebRequest -Uri "https://cleanninja.uk/api/services" -UseBasicParsing
Write-Host "Status: $($r.StatusCode)"
Write-Host "Content length: $($r.Content.Length)"
Write-Host ($r.Content.Substring(0, [Math]::Min(500, $r.Content.Length)))
