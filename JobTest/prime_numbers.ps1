Write-Host "===== Job: Prime Numbers (1 to 100000) =====" -ForegroundColor Cyan

$primes = @()
$sum = [System.Numerics.BigInteger]::Zero

for ($n = 2; $n -le 100000; $n++) {

    $isPrime = $true
    $limit = [Math]::Sqrt($n)

    for ($i = 2; $i -le $limit; $i++) {
        if ($n % $i -eq 0) {
            $isPrime = $false
            break
        }
    }

    if ($isPrime) {
        $primes += $n
        $sum += $n
    }
}

Write-Host "`n===== Prime Numbers =====" -ForegroundColor Yellow

foreach ($prime in $primes) {
    Write-Host $prime
}

Write-Host "`n===== Summary =====" -ForegroundColor Green
Write-Host "Total Prime Numbers : $($primes.Count)"
Write-Host "Sum of Prime Numbers: $sum"
Write-Host "Last Prime Number   : $($primes[-1])"

Write-Host "`nJob Completed Successfully." -ForegroundColor Cyan