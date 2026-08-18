Write-Host "===== Job: Matrix Addition (20x20) =====" -ForegroundColor Cyan

$size = 30

# Create Matrix A
$A = @()
for ($i = 0; $i -lt $size; $i++) {
    $row = @()
    for ($j = 0; $j -lt $size; $j++) {
        $row += Get-Random -Minimum 1 -Maximum 11
    }
    $A += ,$row
}

# Create Matrix B
$B = @()
for ($i = 0; $i -lt $size; $i++) {
    $row = @()
    for ($j = 0; $j -lt $size; $j++) {
        $row += Get-Random -Minimum 1 -Maximum 11
    }
    $B += ,$row
}

# Print Matrix A
Write-Host "`n===== Matrix A =====" -ForegroundColor Yellow
foreach ($row in $A) {
    $row | ForEach-Object { Write-Host -NoNewline ("{0,3}" -f $_) }
    Write-Host
}

# Print Matrix B
Write-Host "`n===== Matrix B =====" -ForegroundColor Yellow
foreach ($row in $B) {
    $row | ForEach-Object { Write-Host -NoNewline ("{0,3}" -f $_) }
    Write-Host
}

# Calculate Matrix C = A + B
$C = @()
for ($i = 0; $i -lt $size; $i++) {
    $row = @()
    for ($j = 0; $j -lt $size; $j++) {
        $row += ($A[$i][$j] + $B[$i][$j])
    }
    $C += ,$row
}

# Print Matrix C
Write-Host "`n===== Matrix A + B =====" -ForegroundColor Green
foreach ($row in $C) {
    $row | ForEach-Object { Write-Host -NoNewline ("{0,3}" -f $_) }
    Write-Host
}

Write-Host "`nJob Completed Successfully." -ForegroundColor Cyan