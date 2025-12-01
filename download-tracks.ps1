$ProgressPreference = 'SilentlyContinue'

if (-not (Test-Path "public\music")) {
    New-Item -ItemType Directory -Path "public\music" -Force | Out-Null
    Write-Host "Created public\music directory"
}

$tracks = @(
    @{Name='adventure_quest.mp3';Url='https://opengameart.org/sites/default/files/adventure_quest.mp3'},
    @{Name='battle_song.mp3';Url='https://opengameart.org/sites/default/files/battle_song_1.mp3'},
    @{Name='bonus_level.mp3';Url='https://opengameart.org/sites/default/files/bonus_level.mp3'},
    @{Name='main_menu.mp3';Url='https://opengameart.org/sites/default/files/main_menu.mp3'},
    @{Name='outro_song.mp3';Url='https://opengameart.org/sites/default/files/outro_song.mp3'}
)

Write-Host "Downloading 8-bit music tracks..."
Write-Host ""

$success = 0
$failed = 0

foreach ($track in $tracks) {
    $filePath = "public\music\$($track.Name)"
    
    if (Test-Path $filePath) {
        Write-Host "[OK] $($track.Name) already exists" -ForegroundColor Green
        $success++
        continue
    }
    
    Write-Host "Downloading $($track.Name)..." -ForegroundColor Yellow
    try {
        $headers = @{
            'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            'Accept' = '*/*'
            'Referer' = 'https://opengameart.org/'
        }
        Invoke-WebRequest -Uri $track.Url -OutFile $filePath -Headers $headers -UseBasicParsing -ErrorAction Stop | Out-Null
        
        if (Test-Path $filePath) {
            $fileSize = (Get-Item $filePath).Length
            if ($fileSize -gt 1000) {
                $fileSizeMB = [math]::Round($fileSize/1MB, 2)
                Write-Host "[OK] Downloaded: $($track.Name) - $fileSizeMB MB" -ForegroundColor Green
                $success++
            } else {
                Write-Host "[FAIL] $($track.Name) - File too small" -ForegroundColor Red
                Remove-Item $filePath -ErrorAction SilentlyContinue
                $failed++
            }
        } else {
            Write-Host "[FAIL] $($track.Name) - File not created" -ForegroundColor Red
            $failed++
        }
    } catch {
        Write-Host "[FAIL] $($track.Name) - $($_.Exception.Message)" -ForegroundColor Red
        if (Test-Path $filePath) { 
            Remove-Item $filePath -ErrorAction SilentlyContinue 
        }
        $failed++
    }
}

Write-Host ""
Write-Host "Complete! Success: $success, Failed: $failed" -ForegroundColor Cyan

if ($success -gt 0) {
    Write-Host ""
    Write-Host "Music files are ready in public\music\ folder!" -ForegroundColor Green
}
