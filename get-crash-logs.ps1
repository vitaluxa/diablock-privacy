# Get Android Crash Logs Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Android Crash Log Capture" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check for ADB
$adbPath = $null
$possiblePaths = @(
    "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe",
    "$env:ProgramFiles\Android\Android Studio\platform-tools\adb.exe",
    "adb"  # If in PATH
)

foreach ($path in $possiblePaths) {
    if ($path -eq "adb") {
        $adbCmd = Get-Command adb -ErrorAction SilentlyContinue
        if ($adbCmd) {
            $adbPath = $adbCmd.Source
            break
        }
    } elseif (Test-Path $path) {
        $adbPath = $path
        break
    }
}

if (-not $adbPath) {
    Write-Host "❌ ADB not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Android SDK Platform Tools:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://developer.android.com/studio/releases/platform-tools" -ForegroundColor White
    Write-Host "2. Extract to: $env:LOCALAPPDATA\Android\Sdk\platform-tools\" -ForegroundColor White
    exit 1
}

Write-Host "✅ ADB found: $adbPath" -ForegroundColor Green
Write-Host ""

# Check if device is connected
Write-Host "Checking for connected devices..." -ForegroundColor Cyan
$devices = & $adbPath devices
Write-Host $devices

if ($devices -notmatch "device$") {
    Write-Host ""
    Write-Host "❌ No Android device connected!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "1. Connect your Android device via USB" -ForegroundColor White
    Write-Host "2. Enable USB Debugging:" -ForegroundColor White
    Write-Host "   - Settings > About Phone > Tap 'Build Number' 7 times" -ForegroundColor White
    Write-Host "   - Settings > Developer Options > Enable 'USB Debugging'" -ForegroundColor White
    Write-Host "3. Accept the USB debugging prompt on your device" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Capturing Crash Logs..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Create logs directory
$logsDir = "crash-logs"
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile = "$logsDir\crash-log-$timestamp.txt"

Write-Host "Capturing full logcat..." -ForegroundColor Yellow
Write-Host "This will capture the last crash. Reproduce the crash now if needed." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop capturing..." -ForegroundColor Yellow
Write-Host ""

# Clear logcat buffer first
& $adbPath logcat -c

Write-Host "Waiting 5 seconds for you to reproduce the crash..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Capture crash logs
Write-Host "Capturing logs..." -ForegroundColor Cyan
& $adbPath logcat -d *:E AndroidRuntime:E chromium:E WebView:E > $logFile

Write-Host ""
Write-Host "✅ Logs saved to: $logFile" -ForegroundColor Green
Write-Host ""

# Also get specific crash info
Write-Host "Getting crash details..." -ForegroundColor Cyan
$crashFile = "$logsDir\crash-details-$timestamp.txt"

# Get AndroidRuntime crashes
& $adbPath logcat -d | Select-String -Pattern "FATAL|AndroidRuntime|Exception|Error" | Out-File $crashFile

Write-Host "✅ Crash details saved to: $crashFile" -ForegroundColor Green
Write-Host ""

# Show summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Crash Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$crashLines = Get-Content $crashFile | Select-String -Pattern "FATAL EXCEPTION|AndroidRuntime|Caused by" | Select-Object -First 10

if ($crashLines) {
    Write-Host "Recent crashes found:" -ForegroundColor Yellow
    $crashLines | ForEach-Object { Write-Host $_ -ForegroundColor Red }
} else {
    Write-Host "No recent crashes found in logs." -ForegroundColor Yellow
    Write-Host "Try reproducing the crash and run this script again." -ForegroundColor White
}

Write-Host ""
Write-Host "Full logs available in:" -ForegroundColor Cyan
Write-Host "  - $logFile" -ForegroundColor White
Write-Host "  - $crashFile" -ForegroundColor White
Write-Host ""

