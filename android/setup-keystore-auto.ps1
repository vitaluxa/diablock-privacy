# Automated keystore setup script
# This script generates random passwords and creates the keystore automatically

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Automated Keystore Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if keystore already exists
if (Test-Path "app\release.keystore") {
    Write-Host "Keystore already exists. Skipping creation." -ForegroundColor Yellow
    exit 0
}

# Generate random passwords
$keystorePassword = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 16 | ForEach-Object {[char]$_})
$keyPassword = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 16 | ForEach-Object {[char]$_})

Write-Host "Generating keystore with random passwords..." -ForegroundColor Green
Write-Host ""

# Create keystore with non-interactive keytool command
$keyAlias = "dia-block-game"
$keystorePath = "app\release.keystore"
$validity = "10000"

# Create a temporary answer file for keytool
$answers = @"
$keystorePassword
$keystorePassword
$keyPassword
$keyPassword
CN=Dia Block Game, OU=Development, O=Dia Block Game, L=City, ST=State, C=US
y
"@

$answers | & keytool -genkey -v -keystore $keystorePath -alias $keyAlias -keyalg RSA -keysize 2048 -validity $validity -storepass $keystorePassword -keypass $keyPassword -dname "CN=Dia Block Game, OU=Development, O=Dia Block Game, L=City, ST=State, C=US" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Keystore created successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Create keystore.properties file
    $propertiesContent = @"
# Release signing configuration
# Auto-generated passwords - SAVE THESE PASSWORDS!
# DO NOT commit this file to version control!

storeFile=app/release.keystore
storePassword=$keystorePassword
keyAlias=$keyAlias
keyPassword=$keyPassword
"@
    
    $propertiesContent | Out-File -FilePath "keystore.properties" -Encoding UTF8 -NoNewline
    
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "IMPORTANT: Save these passwords!" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Keystore Password: $keystorePassword" -ForegroundColor Yellow
    Write-Host "Key Password: $keyPassword" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "These passwords are saved in keystore.properties" -ForegroundColor Green
    Write-Host "But you should also save them in a secure location!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Keystore location: $keystorePath" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERROR: Failed to create keystore" -ForegroundColor Red
    Write-Host "Make sure Java JDK is installed and keytool is in your PATH" -ForegroundColor Red
    exit 1
}



