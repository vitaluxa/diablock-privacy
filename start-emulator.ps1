# Start Android Emulator Script

$sdkPath = "$env:LOCALAPPDATA\Android\Sdk"
$emulatorPath = "$sdkPath\emulator\emulator.exe"

if (-not (Test-Path $emulatorPath)) {
    Write-Host "❌ Emulator not found at: $emulatorPath" -ForegroundColor Red
    Write-Host "Run .\install-android-emulator.ps1 first" -ForegroundColor Yellow
    exit 1
}

Write-Host "Starting Android Emulator..." -ForegroundColor Cyan
Write-Host ""

# List available AVDs
Write-Host "Available AVDs:" -ForegroundColor Yellow
& $emulatorPath -list-avds
Write-Host ""

# Try to start the DiaBlock emulator, or the first available one
$avdName = "DiaBlock_Emulator"
$avds = & $emulatorPath -list-avds

if ($avds -notcontains $avdName) {
    if ($avds.Count -gt 0) {
        $avdName = $avds[0]
        Write-Host "⚠️ Using AVD: $avdName" -ForegroundColor Yellow
    } else {
        Write-Host "❌ No AVDs found. Create one first:" -ForegroundColor Red
        Write-Host "1. Open Android Studio" -ForegroundColor White
        Write-Host "2. Go to Tools > Device Manager" -ForegroundColor White
        Write-Host "3. Click 'Create Device'" -ForegroundColor White
        exit 1
    }
}

Write-Host "Starting: $avdName" -ForegroundColor Green
Write-Host ""

# Start emulator in background
Start-Process -FilePath $emulatorPath -ArgumentList "-avd", $avdName

Write-Host "✅ Emulator starting..." -ForegroundColor Green
Write-Host "Wait for it to fully boot, then you can install your APK with:" -ForegroundColor Yellow
Write-Host "  adb install apk\dia-block-game-release.aab" -ForegroundColor White
Write-Host ""



