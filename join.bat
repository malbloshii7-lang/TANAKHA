@echo off
rem Rejoin the four large masters from their pieces, then print each one's SHA-256 to compare with MANIFEST.sha256.
rem Windows: double-click this file in the downloaded folder.
cd /d "%~dp0"
for %%f in (part1-4k50 part1-4k50-restrained part1-pull-4k50 part1-pull-4k50-restrained) do (
  copy /b "%%f.mp4.part-aa" + "%%f.mp4.part-ab" + "%%f.mp4.part-ac" "%%f.mp4" >nul
  echo rejoined %%f.mp4
  certutil -hashfile "%%f.mp4" SHA256
)
echo Compare each hash above with the same file's line in MANIFEST.sha256. The .part-* files can then be deleted.
pause
