# Get Stack Trace for Dia Block Game

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Dia Block Game Stack Trace" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Find ADB
$adbPath = $null
$possiblePaths = @(
    "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe",
    "$env:ProgramFiles\Android\Android Studio\platform-tools\adb.exe"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $adbPath = $path
        break
    }
}

if (-not $adbPath) {
    $adbCmd = Get-Command adb -ErrorAction SilentlyContinue
    if ($adbCmd) {
        $adbPath = $adbCmd.Source
    }
}

if (-not $adbPath) {
    Write-Host "❌ ADB not found. Install Android SDK Platform Tools first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ ADB: $adbPath" -ForegroundColor Green
Write-Host ""

# Check device
$devices = & $adbPath devices
if ($devices -notmatch "device$") {
    Write-Host "❌ No device connected. Connect your Android device first." -ForegroundColor Red
    exit 1
}

Write-Host "Connected device detected" -ForegroundColor Green
Write-Host ""

# Get stack trace for the app
Write-Host "Getting stack trace for com.diablock.game..." -ForegroundColor Cyan
Write-Host ""

# Clear and capture
& $adbPath logcat -c

Write-Host "Reproduce the crash now, then press Enter..." -ForegroundColor Yellow
Read-Host

Write-Host ""
Write-Host "Capturing stack trace..." -ForegroundColor Cyan

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$stackFile = "crash-logs\stack-trace-$timestamp.txt"

if (-not (Test-Path "crash-logs")) {
    New-Item -ItemType Directory -Path "crash-logs" | Out-Null
}

# Get crash logs filtered for our app
& $adbPath logcat -d | Select-String -Pattern "com.diablock.game|DiaBlock|AndroidRuntime|FATAL" | Out-File $stackFile

Write-Host ""
Write-Host "✅ Stack trace saved to: $stackFile" -ForegroundColor Green
Write-Host ""

# Display the stack trace
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Stack Trace:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Get-Content $stackFile | ForEach-Object {
    if ($_ -match "FATAL|Exception|Error|at com.diablock") {
        Write-Host $_ -ForegroundColor Red
    } elseif ($_ -match "Caused by") {
        Write-Host $_ -ForegroundColor Yellow
    } else {
        Write-Host $_ -ForegroundColor White
    }
}

Write-Host ""
Write-Host "Full stack trace in: $stackFile" -ForegroundColor Cyan
Write-Host ""



