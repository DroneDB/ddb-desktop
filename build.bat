REM echo off
echo Building DroneDB Desktop...
cd %~dp0

echo Building app...

echo Running webpack...
call webpack --mode production

RD /S /Q release
call npm run pack

echo Signing...

"C:\Program Files (x86)\Windows Kits\10\bin\10.0.18362.0\x64\SignTool.exe" sign /f "C:\webodm-installer\comodo.pfx" /t http://timestamp.sectigo.com "C:\ddb-desktop\dist\win-unpacked\ddb-desktop.exe"

echo Running innosetup...

"D:\Program Files (x86)\Inno Setup 6\compil32" /cc "innosetup.iss"



