$AppDir = "../app"
$InputDir = "./src"
$OutputDir = "./dist"

Write-Output "1. Prepare distribution directory ...`n"

if (Test-Path $OutputDir) {
    Remove-Item $OutputDir -Recurse
}
if (!(Copy-Item $InputDir $OutputDir -Recurse -PassThru)) {
    throw "Failed to create output directory."
}

$Match = Select-String -Path "$AppDir/package.json" -Pattern '"version": "([^"]+)"'
if ($Match.Matches.Length -eq 0) {
    throw "Failed to find app version."
}

$AppVersion = $Match.Matches.Groups[1].Value
Write-Output "App Version: $AppVersion"

(Get-Content "$OutputDir/manifest.json") -replace "{VERSION_NUMBER}", $AppVersion | Out-File "$OutputDir/manifest.json" -Encoding "UTF8"

Write-Output "`n2. Building app ..."
Push-Location $AppDir
npm run build
Pop-Location

$DestPath = "$OutputDir/app.bundle.js"
if (Test-Path $DestPath) {
    Remove-Item $DestPath
}
Move-Item "$AppDir/dist/app.bundle.js" $DestPath

Write-Output "`n3. Zipping extension ..."
$DestPath = "$OutputDir/extension.zip"
if (Test-Path $DestPath) {
    Remove-Item $DestPath
}
Compress-Archive -Path "$OutputDir/*" -DestinationPath $DestPath

Write-Output "`nCompleted!`n"