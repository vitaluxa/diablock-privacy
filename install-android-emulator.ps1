# Android Emulator Installation Script
# This script installs the Android emulator using the existing SDK

$sdkPath = "$env:LOCALAPPDATA\Android\Sdk"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Android Emulator Installation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if SDK exists
if (-not (Test-Path $sdkPath)) {
    Write-Host "❌ Android SDK not found at: $sdkPath" -ForegroundColor Red
    Write-Host "Please install Android Studio first from: https://developer.android.com/studio" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Android SDK found: $sdkPath" -ForegroundColor Green
Write-Host ""

# Find SDK Manager
$sdkManager = $null
$sdkManagerPaths = @(
    "$sdkPath\cmdline-tools\latest\bin\sdkmanager.bat",
    "$sdkPath\tools\bin\sdkmanager.bat",
    "$sdkPath\cmdline-tools\bin\sdkmanager.bat"
)

foreach ($path in $sdkManagerPaths) {
    if (Test-Path $path) {
        $sdkManager = $path
        Write-Host "✅ SDK Manager found: $path" -ForegroundColor Green
        break
    }
}

if (-not $sdkManager) {
    Write-Host "❌ SDK Manager not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Installing command-line tools..." -ForegroundColor Yellow
    
    # Download command-line tools
    $toolsUrl = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
    $toolsZip = "$env:TEMP\android-cmdline-tools.zip"
    $toolsExtract = "$env:TEMP\android-cmdline-tools"
    
    Write-Host "Downloading command-line tools..." -ForegroundColor Cyan
    try {
        Invoke-WebRequest -Uri $toolsUrl -OutFile $toolsZip -UseBasicParsing
        Write-Host "✅ Downloaded" -ForegroundColor Green
        
        Write-Host "Extracting..." -ForegroundColor Cyan
        Expand-Archive -Path $toolsZip -DestinationPath $toolsExtract -Force
        
        # Move to SDK location
        $cmdlinePath = "$sdkPath\cmdline-tools\latest"
        New-Item -ItemType Directory -Path $cmdlinePath -Force | Out-Null
        Move-Item -Path "$toolsExtract\cmdline-tools\*" -Destination $cmdlinePath -Force
        
        $sdkManager = "$cmdlinePath\bin\sdkmanager.bat"
        Write-Host "✅ Command-line tools installed" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to download command-line tools: $_" -ForegroundColor Red
        Write-Host "Please install Android Studio manually from: https://developer.android.com/studio" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "Installing Android Emulator..." -ForegroundColor Cyan
Write-Host "This may take several minutes..." -ForegroundColor Yellow
Write-Host ""

# Install emulator
try {
    & $sdkManager "emulator" --sdk_root=$sdkPath
    Write-Host "✅ Emulator installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install emulator: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Installing platform tools (ADB)..." -ForegroundColor Cyan
try {
    & $sdkManager "platform-tools" --sdk_root=$sdkPath
    Write-Host "✅ Platform tools installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Platform tools installation failed (may already be installed)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Installing system image (Android 13)..." -ForegroundColor Cyan
try {
    & $sdkManager "system-images;android-33;google_apis;x86_64" --sdk_root=$sdkPath
    Write-Host "✅ System image installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️ System image installation failed: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Creating Android Virtual Device (AVD)..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$avdManager = "$sdkPath\cmdline-tools\latest\bin\avdmanager.bat"
if (-not (Test-Path $avdManager)) {
    $avdManager = "$sdkPath\tools\bin\avdmanager.bat"
}

if (Test-Path $avdManager) {
    Write-Host "Creating AVD 'DiaBlock_Emulator'..." -ForegroundColor Cyan
    try {
        & $avdManager create avd -n "DiaBlock_Emulator" -k "system-images;android-33;google_apis;x86_64" -d "pixel_5" --force
        Write-Host "✅ AVD created successfully!" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ AVD creation failed (you can create it manually in Android Studio)" -ForegroundColor Yellow
        Write-Host "Error: $_" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ AVD Manager not found. You can create an AVD manually:" -ForegroundColor Yellow
    Write-Host "1. Open Android Studio" -ForegroundColor White
    Write-Host "2. Go to Tools > Device Manager" -ForegroundColor White
    Write-Host "3. Click 'Create Device'" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the emulator, run:" -ForegroundColor Yellow
Write-Host "  `$emulator = `"$sdkPath\emulator\emulator.exe`"" -ForegroundColor White
Write-Host "  & `$emulator -avd DiaBlock_Emulator" -ForegroundColor White
Write-Host ""
Write-Host "Or use the script: .\start-emulator.ps1" -ForegroundColor Cyan
Write-Host ""

