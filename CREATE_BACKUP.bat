@echo off
echo Creating emergency backup of Birth Announcement Studio...
echo.

set BACKUP_DIR=BACKUP_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=%BACKUP_DIR: =0%

echo Creating backup directory: %BACKUP_DIR%
mkdir "%BACKUP_DIR%"

echo Copying critical files...
xcopy "components\*.tsx" "%BACKUP_DIR%\components\" /s /i /y
xcopy "src\*.ts" "%BACKUP_DIR%\src\" /s /i /y  
xcopy "src\*.tsx" "%BACKUP_DIR%\src\" /s /i /y
copy "package.json" "%BACKUP_DIR%\"
copy "tsconfig.json" "%BACKUP_DIR%\"
copy "App.tsx" "%BACKUP_DIR%\"
copy "*.md" "%BACKUP_DIR%\"

echo.
echo ✅ BACKUP COMPLETE: %BACKUP_DIR%
echo.
echo Critical files backed up:
echo - All components (*.tsx)
echo - All source files (src/*.ts, src/*.tsx)  
echo - Configuration files
echo - Documentation
echo.
echo If you need to restore, copy files back from %BACKUP_DIR%
pause