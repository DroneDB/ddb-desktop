; Script generated by the Inno Setup Script Wizard.
; SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!

#define MyAppName "DroneDB Desktop"
#define MyAppVersion "1.0.6"
#define MyAppPublisher "DroneDB"
#define MyAppURL "https://dronedb.app"

#define InnoRoot "C:\ddb-desktop"

[Setup]
; NOTE: The value of AppId uniquely identifies this application.
; Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={{E75C901B-A57E-4FDC-2A2E-36B0CF8DE110}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
;AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\DroneDB
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
LicenseFile={#InnoRoot}\LICENSE.txt
OutputDir={#InnoRoot}\release\dist
OutputBaseFilename=DroneDB_Setup
Compression=lzma
SolidCompression=yes
ArchitecturesAllowed=x64
SignTool=signtool
PrivilegesRequired=lowest
UsePreviousAppDir=no
;SetupIconFile=setup.ico
ChangesEnvironment=yes

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "assets\VC_redist.x64.exe"; DestDir: {tmp}; Flags: deleteafterinstall
Source: "dist\win-unpacked\*"; Excludes: "resources\app\node_modules,resources\app\vendor\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "node_modules\vue\dist\vue.js"; DestDir: "{app}\resources\app\node_modules\vue\dist\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "node_modules\ddb\node_modules\*"; DestDir: "{app}\resources\app\node_modules\ddb\node_modules"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "vendor\ddb\build\*"; DestDir: "{app}\resources\app\build"; Flags: ignoreversion
Source: "vendor\ddb\nodejs\*"; DestDir: "{app}\resources\app\vendor\ddb\nodejs"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "vendor\ddb\index.js"; DestDir: "{app}\resources\app\vendor\ddb"; Flags: ignoreversion
Source: "vendor\CommonUI\dynamic\*"; DestDir: "{app}\resources\app\vendor\CommonUI\dynamic"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: {group}\DroneDB Desktop; Filename: "{app}\ddb-desktop.exe"; WorkingDir: "{app}"; IconFilename: "{app}\ddb-desktop.exe"; IconIndex: 0
Name: "{userdesktop}\DroneDB Desktop"; Filename: "{app}\ddb-desktop.exe"; WorkingDir: "{app}"; IconFilename: "{app}\ddb-desktop.exe"; IconIndex: 0; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Run]
Filename: "{tmp}\VC_redist.x64.exe"; Parameters: "/q /norestart /q:a /c:""VCREDI~3.EXE /q:a /c:""""msiexec /i vcredist.msi /qn"""" """; Check: VCRedistNeedsInstall; WorkingDir: {tmp}; StatusMsg: Installing VC++ 2019 Redistributables...
Filename: {app}\ddb-desktop.exe; Description: {cm:LaunchProgram,DroneDB Desktop}; Flags: nowait postinstall skipifsilent

[Registry]
Root: HKCU; Subkey: "Environment"; ValueType: expandsz; ValueName: "Path"; ValueData: "{olddata};{app}\resources\app\build"; Check: NeedsAddPath('resources\app\build')

[Code]
#IFDEF UNICODE
  #DEFINE AW "W"
#ELSE
  #DEFINE AW "A"
#ENDIF
type
  INSTALLSTATE = Longint;
const
  INSTALLSTATE_INVALIDARG = -2;  // An invalid parameter was passed to the function.
  INSTALLSTATE_UNKNOWN = -1;     // The product is neither advertised or installed.
  INSTALLSTATE_ADVERTISED = 1;   // The product is advertised but not installed.
  INSTALLSTATE_ABSENT = 2;       // The product is installed for a different user.
  INSTALLSTATE_DEFAULT = 5;      // The product is installed for the current user.
function MsiQueryProductState(szProduct: string): INSTALLSTATE; 
  external 'MsiQueryProductState{#AW}@msi.dll stdcall';
function VCVersionInstalled(const ProductID: string): Boolean;
begin
  Result := MsiQueryProductState(ProductID) = INSTALLSTATE_DEFAULT;
end;
function VCRedistNeedsInstall: Boolean;
begin
  Result := not (VCVersionInstalled('{33628a12-6787-4b9f-95a1-92449f69fae0}'));
end;

function NeedsAddPath(Param: string): boolean;
var
  OrigPath: string;
  AppParam: string;
begin
  AppParam := ExpandConstant('{app}') + '\' + Param;
  if not RegQueryStringValue(HKEY_CURRENT_USER,
    'Environment',
    'Path', OrigPath)
  then begin
    Result := True;
    exit;
  end;
  { look for the path with leading and trailing semicolon }
  { Pos() returns 0 if not found }
  Result := Pos(';' + AppParam + ';', ';' + OrigPath + ';') = 0;
end;