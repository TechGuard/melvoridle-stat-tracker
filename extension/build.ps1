$InputDir = "./src"
$OutputDir = "./dist"

Write-Output "1. Prepare distribution directory ...`n"

if (Test-Path $OutputDir) {
    Remove-Item $OutputDir -Recurse
}
New-Item -Path $OutputDir -ItemType "directory"

Write-Output "`n2. Zipping extension ..."
$DestPath = "$OutputDir/extension.zip"
if (Test-Path $DestPath) {
    Remove-Item $DestPath
}
Compress-Archive -Path "$InputDir/*" -DestinationPath $DestPath

Write-Output "`nCompleted!`n"