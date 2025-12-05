# Test App on Device via ADB

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ADB Device Testing" -ForegroundColor Cyan
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
    Write-Host "❌ ADB not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Android SDK Platform Tools:" -ForegroundColor Yellow
    Write-Host "Download from: https://developer.android.com/studio/releases/platform-tools" -ForegroundColor White
    exit 1
}

Write-Host "✅ ADB found: $adbPath" -ForegroundColor Green
Write-Host ""

# Check for connected devices
Write-Host "Checking for connected devices..." -ForegroundColor Cyan
$devices = & $adbPath devices
Write-Host $devices
Write-Host ""

if ($devices -notmatch "device$") {
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

Write-Host "✅ Device connected" -ForegroundColor Green
Write-Host ""

# Check if AAB exists
$aabPath = "apk\dia-block-game-release.aab"
if (-not (Test-Path $aabPath)) {
    Write-Host "❌ AAB file not found: $aabPath" -ForegroundColor Red
    Write-Host "Please build the AAB first using: cd android; .\build-with-proguard.bat" -ForegroundColor Yellow
    exit 1
}

Write-Host "AAB file found: $aabPath" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Options:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. View device logs (recommended for testing)" -ForegroundColor Yellow
Write-Host "   Run: adb logcat | findstr \"chromium\|WebView\|AndroidRuntime\|DiaBlock\""
Write-Host ""
Write-Host "2. Install via Google Play Console (Internal Testing)" -ForegroundColor Yellow
Write-Host "   Upload AAB to: https://play.google.com/apps/internaltest/4701058561435013842"
Write-Host ""
Write-Host "3. Build debug APK for direct install" -ForegroundColor Yellow
Write-Host "   Run: cd android; .\debug-apk.bat"
Write-Host "   Then: adb install app\build\outputs\apk\debug\app-debug.apk"
Write-Host ""

# Ask if user wants to view logs
Write-Host "Would you like to view device logs now? (Y/N)" -ForegroundColor Cyan
$response = Read-Host

if ($response -eq "Y" -or $response -eq "y") {
    Write-Host ""
    Write-Host "Starting logcat... Press Ctrl+C to stop" -ForegroundColor Yellow
    Write-Host "Filtering for app-related logs..." -ForegroundColor Yellow
    Write-Host ""
    & $adbPath logcat | Select-String -Pattern "chromium|WebView|AndroidRuntime|DiaBlock|com.diablock"
}

