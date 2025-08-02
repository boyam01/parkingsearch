$testData = @{
    plate = "TEST" + [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
    vehicleType = "car"
    applicantName = "API Test User"
    contactPhone = "0912345678"
    identityType = "visitor"
    applicationDate = "2025-08-02"
} | ConvertTo-Json

Write-Host "Starting API write test..."
Write-Host "Test data: $testData"

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/vehicles" -Method Post -ContentType "application/json" -Body $testData
    Write-Host "Success! Write completed."
    Write-Host "Response data:" ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "Failed: $($_.Exception.Message)"
    Write-Host "Error details: $($_.ErrorDetails.Message)"
}
