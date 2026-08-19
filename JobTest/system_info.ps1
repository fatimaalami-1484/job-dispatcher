Write-Host "===== Job: System Information ====="

Write-Host "Computer Name: $env:COMPUTERNAME"
Write-Host "User: $env:USERNAME"
Write-Host "OS: $((Get-CimInstance Win32_OperatingSystem).Caption)"
Write-Host "Processors: $((Get-CimInstance Win32_ComputerSystem).NumberOfProcessors)"
Write-Host "Time: $(Get-Date)"