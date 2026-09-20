#Requires -Version 5.1
<#
.SYNOPSIS
  Release Android de KM0 LAB en un solo comando.

.DESCRIPTION
  1) Build web de produccion (env/.env.production) + cap sync
  2) (Opcional -BumpVersion) incrementa versionCode en android/app/build.gradle
  3) gradlew bundleRelease + assembleRelease (firma con keystore.properties)
  4) Verifica la firma e imprime las rutas de los artefactos

  Prerequisitos: ver docs/ANDROID-RELEASE.md (JDK 21, SDK 35, keystore).

.PARAMETER BumpVersion
  Incrementa versionCode (+1) antes de compilar. Obligatorio subirlo en cada
  upload a Play Console.

.PARAMETER SkipBuildWeb
  Reutiliza el dist/ y los assets ya sincronizados (no rebuild web).

.EXAMPLE
  .\scripts\release-android.ps1 -BumpVersion
#>
param(
  [switch]$BumpVersion,
  [switch]$SkipBuildWeb
)

$ErrorActionPreference = "Stop"

$appDir     = Split-Path -Parent $PSScriptRoot          # apps/km0lab
$androidDir = Join-Path $appDir "android"
$gradleFile = Join-Path $androidDir "app\build.gradle"
$aabPath    = Join-Path $androidDir "app\build\outputs\bundle\release\app-release.aab"
$apkPath    = Join-Path $androidDir "app\build\outputs\apk\release\app-release.apk"

function Write-Step([string]$msg) {
  Write-Host ""
  Write-Host "==> $msg" -ForegroundColor Cyan
}

# --- JDK: JAVA_HOME o el JBR que trae Android Studio -------------------------
if (-not $env:JAVA_HOME -or -not (Test-Path (Join-Path $env:JAVA_HOME "bin\java.exe"))) {
  $jbr = "C:\Program Files\Android\Android Studio\jbr"
  if (Test-Path (Join-Path $jbr "bin\java.exe")) {
    $env:JAVA_HOME = $jbr
    Write-Host "JAVA_HOME no valido; usando JBR de Android Studio" -ForegroundColor DarkYellow
  } else {
    throw "No se encuentra un JDK 21. Instala Android Studio o define JAVA_HOME."
  }
}

# --- Firma configurada --------------------------------------------------------
$keystoreProps = Join-Path $androidDir "app\keystore.properties"
if (-not (Test-Path $keystoreProps)) {
  throw "Falta android/app/keystore.properties (copia de keystore.properties.example). Sin el, el release no se firma."
}

# --- 1) Build web + sync ------------------------------------------------------
if (-not $SkipBuildWeb) {
  Write-Step "Build web produccion + cap sync"
  Push-Location $appDir
  try {
    & pnpm run cap:build:android
    if ($LASTEXITCODE -ne 0) { throw "cap:build:android fallo (exit $LASTEXITCODE)" }
  } finally {
    Pop-Location
  }
} else {
  Write-Host "SkipBuildWeb: se reutiliza el dist/ actual" -ForegroundColor DarkYellow
}

# --- 2) Bump versionCode ------------------------------------------------------
if ($BumpVersion) {
  Write-Step "Incrementando versionCode"
  $content = Get-Content $gradleFile -Raw
  $m = [regex]::Match($content, "versionCode\s+(\d+)")
  if (-not $m.Success) { throw "No se encontro 'versionCode' en $gradleFile" }
  $old = [int]$m.Groups[1].Value
  $new = $old + 1
  $content = $content.Replace($m.Value, "versionCode $new")
  Set-Content $gradleFile $content -NoNewline -Encoding UTF8
  Write-Host "versionCode: $old -> $new" -ForegroundColor Green
}

# --- 3) Gradle release --------------------------------------------------------
Write-Step "gradlew bundleRelease assembleRelease"
Push-Location $androidDir
try {
  & .\gradlew.bat bundleRelease assembleRelease --console=plain
  if ($LASTEXITCODE -ne 0) { throw "gradlew fallo (exit $LASTEXITCODE)" }
} finally {
  Pop-Location
}

foreach ($f in @($aabPath, $apkPath)) {
  if (-not (Test-Path $f)) { throw "No se genero $f" }
}

# --- 4) Verificar firma -------------------------------------------------------
Write-Step "Verificando firma del APK"
$sdkDir = $null
$localProps = Join-Path $androidDir "local.properties"
if (Test-Path $localProps) {
  $line = Get-Content $localProps | Where-Object { $_ -match "^\s*sdk\.dir=" } | Select-Object -First 1
  if ($line) { $sdkDir = ($line -replace "^\s*sdk\.dir=", "").Trim() -replace "\\\\", "\" }
}
if (-not $sdkDir -or -not (Test-Path $sdkDir)) { $sdkDir = $env:ANDROID_HOME }
$apksigner = $null
if ($sdkDir) {
  $bt = Get-ChildItem (Join-Path $sdkDir "build-tools") -Directory -ErrorAction SilentlyContinue |
        Sort-Object Name -Descending | Select-Object -First 1
  if ($bt) { $apksigner = Join-Path $bt.FullName "apksigner.bat" }
}
if ($apksigner -and (Test-Path $apksigner)) {
  & $apksigner verify "$apkPath" | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "apksigner: el APK NO esta firmado correctamente" }
  Write-Host "APK firmado OK" -ForegroundColor Green
} else {
  Write-Host "apksigner no encontrado; se omite la verificacion (el build firmo con keystore.properties)" -ForegroundColor DarkYellow
}

# --- Resumen ------------------------------------------------------------------
$versionName = ([regex]::Match((Get-Content $gradleFile -Raw), 'versionName\s+"([^"]+)"')).Groups[1].Value
$versionCode = ([regex]::Match((Get-Content $gradleFile -Raw), 'versionCode\s+(\d+)')).Groups[1].Value

Write-Step "Release Android lista (versionName=$versionName, versionCode=$versionCode)"
$aabMB = (Get-Item $aabPath).Length / 1MB
$apkMB = (Get-Item $apkPath).Length / 1MB
Write-Host ("  AAB (Play Console): {0} ({1:N1} MB)" -f $aabPath, $aabMB) -ForegroundColor Green
Write-Host ("  APK (dispositivo):  {0} ({1:N1} MB)" -f $apkPath, $apkMB) -ForegroundColor Green
Write-Host ""
Write-Host "Siguiente: Play Console > app com.km0lab.app > Pruebas internas/Produccion > subir el .aab"
