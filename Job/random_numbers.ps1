Write-Host "===== Job: Random Numbers ====="

$numbers = @()

for ($i = 0; $i -lt 30; $i++) {
    $numbers += Get-Random -Minimum 1 -Maximum 21
}

Write-Host "`nGenerated Numbers:"
$numbers -join ", "

$product = [System.Numerics.BigInteger]::One

foreach ($n in $numbers) {
    $product *= $n
}

Write-Host "`nProduct:"
Write-Host $product