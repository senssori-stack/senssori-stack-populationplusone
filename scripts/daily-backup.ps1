# PopPlusOne Daily Backup Script
# Runs nightly at 9 PM via Windows Task Scheduler
# Creates a dated zip backup + updates PROJECT_BACKUP.md

$projectDir = "c:\Users\Owner\Desktop\PopPlusOne"
$backupRoot = "c:\Users\Owner\Desktop\PopPlusOne_Backups"
$date = Get-Date -Format "yyyy-MM-dd"
$time = Get-Date -Format "hh:mm tt"
$backupZip = "$backupRoot\PopPlusOne_$date.zip"
$logFile = "$backupRoot\backup-log.txt"

# Create backup folder if it doesn't exist
if (-not (Test-Path $backupRoot)) {
    New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
}

# Remove backups older than 30 days to save disk space
Get-ChildItem "$backupRoot\PopPlusOne_*.zip" -ErrorAction SilentlyContinue |
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } |
    Remove-Item -Force

# Create the zip backup (exclude node_modules, .expo, android/build, etc.)
$tempStaging = "$env:TEMP\PopPlusOne_backup_staging"
if (Test-Path $tempStaging) { Remove-Item $tempStaging -Recurse -Force }

# Use robocopy to stage files (excludes heavy folders)
robocopy $projectDir $tempStaging /E /XD "node_modules" ".expo" "android\app\build" "android\.gradle" ".git" | Out-Null

# Compress to zip
if (Test-Path $backupZip) { Remove-Item $backupZip -Force }
Compress-Archive -Path "$tempStaging\*" -DestinationPath $backupZip -CompressionLevel Optimal

# Clean up staging
Remove-Item $tempStaging -Recurse -Force -ErrorAction SilentlyContinue

# Get backup size
$sizeMB = [math]::Round((Get-Item $backupZip).Length / 1MB, 1)

# Count source files
$fileCount = (Get-ChildItem $projectDir -Recurse -File -Exclude "node_modules",".expo" -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch "node_modules|\.expo|android\\app\\build" }).Count

# Count total backups
$totalBackups = (Get-ChildItem "$backupRoot\PopPlusOne_*.zip" -ErrorAction SilentlyContinue).Count

# Update the PROJECT_BACKUP.md in the project
$mdPath = "$projectDir\PROJECT_BACKUP.md"
$mdContent = @"
# PopPlusOne Project Backup Status

## Last Backup
- **Date:** $date
- **Time:** $time
- **Size:** $($sizeMB) MB
- **Files in project:** $fileCount
- **Backup location:** ``$backupRoot``
- **Backup file:** ``PopPlusOne_$date.zip``

## Backup History
- **Total backups stored:** $totalBackups
- **Retention:** 30 days (older backups auto-deleted)
- **Schedule:** Every day at 9:00 PM

## What's Backed Up
- All source code (screens, components, hooks, constants)
- Assets (images, lullabies, PDFs, stories)
- Configuration files (app.json, tsconfig, babel, metro)
- Firebase functions
- Android build config (gradle files)
- Scripts and documentation

## What's Excluded (too large / regeneratable)
- ``node_modules/`` (reinstall with ``npm install``)
- ``.expo/`` (regenerated on build)
- ``android/app/build/`` (regenerated on build)
- ``.git/`` (version control history)

## Restore Instructions
1. Unzip the backup: ``PopPlusOne_YYYY-MM-DD.zip``
2. Copy contents to your project folder
3. Run ``npm install`` to restore dependencies
4. Run ``npx expo start`` to launch

---
*Auto-updated nightly at 9 PM by daily-backup.ps1*
"@

Set-Content -Path $mdPath -Value $mdContent -Encoding UTF8

# Append to log
$logEntry = "$date $time | $($sizeMB) MB | $fileCount files | OK"
Add-Content -Path $logFile -Value $logEntry

Write-Host "Backup complete: $backupZip ($($sizeMB) MB)"
