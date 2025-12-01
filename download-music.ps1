# PowerShell script to download free 8-bit music tracks
# Run this script: .\download-music.ps1

# Create music directory if it doesn't exist
$musicDir = "public\music"
if (-not (Test-Path $musicDir)) {
    New-Item -ItemType Directory -Path $musicDir -Force | Out-Null
    Write-Host "Created $musicDir directory"
}

# Free 8-bit music tracks from OpenGameArt (CC0 - No attribution required)
$tracks = @(
    @{ Name = "8bit-Adventure.mp3"; Url = "https://opengameart.org/sites/default/files/8bit-Adventure.mp3" },
    @{ Name = "8bit-Battle.mp3"; Url = "https://opengameart.org/sites/default/files/8bit-Battle.mp3" },
    @{ Name = "8bit-MainMenu.mp3"; Url = "https://opengameart.org/sites/default/files/8bit-MainMenu.mp3" },
    @{ Name = "8bit-Quest.mp3"; Url = "https://opengameart.org/sites/default/files/8bit-Quest.mp3" },
    @{ Name = "8bit-Village.mp3"; Url = "https://opengameart.org/sites/default/files/8bit-Village.mp3" }
)

Write-Host "Starting music download...`n"

$successCount = 0
$failCount = 0

foreach ($track in $tracks) {
    $filePath = Join-Path $musicDir $track.Name
    
    # Skip if file already exists
    if (Test-Path $filePath) {
        Write-Host "✓ $($track.Name) already exists, skipping..." -ForegroundColor Green
        $successCount++
        continue
    }
    
    Write-Host "Downloading $($track.Name)..." -ForegroundColor Yellow
    $result = Invoke-WebRequest -Uri $track.Url -OutFile $filePath -ErrorAction SilentlyContinue
    if ($result -or (Test-Path $filePath)) {
        Write-Host "✓ Successfully downloaded: $($track.Name)" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "✗ Failed to download $($track.Name)" -ForegroundColor Red
        $failCount++
    }
}

Write-Host "`nDownload complete!" -ForegroundColor Cyan
Write-Host "Success: $successCount, Failed: $failCount" -ForegroundColor Cyan

if ($successCount -gt 0) {
    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "1. Open src/services/musicService.js"
    Write-Host "2. Update the tracks array with:"
    Write-Host "   this.tracks = [" -ForegroundColor Green
    foreach ($track in $tracks) {
        $filePath = Join-Path $musicDir $track.Name
        if (Test-Path $filePath) {
            Write-Host "     '/music/$($track.Name)'," -ForegroundColor Green
        }
    }
    Write-Host "   ];" -ForegroundColor Green
}

if ($failCount -gt 0) {
    Write-Host "`nSome downloads failed. You can manually download tracks from:" -ForegroundColor Yellow
    Write-Host "- https://opengameart.org/content/5-free-tracks-for-your-game-8-bit-style-0"
    Write-Host "- https://ericskiff.com/music/"
    Write-Host "- https://ozzed.net/music/"
    Write-Host "`nPlace downloaded files in public/music/ folder and update musicService.js"
}

