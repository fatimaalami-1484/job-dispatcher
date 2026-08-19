Write-Host "===== Job: Fibonacci (100 Numbers) =====" -ForegroundColor Cyan

$a = [System.Numerics.BigInteger]0
$b = [System.Numerics.BigInteger]1

for ($i = 1; $i -le 100; $i++) {

    Write-Host ("{0,3}. {1}" -f $i, $a)

    $next = $a + $b
    $a = $b
    $b = $next
}

Write-Host "`nJob Completed Successfully." -ForegroundColor Green