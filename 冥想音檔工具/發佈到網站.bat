@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 將「成品」的 mp3 複製到 public\meditations ...
robocopy "成品" "..\public\meditations" *.mp3 /NJH /NJS /NDL /NP
echo.
echo 完成。接著 git add -A ^&^& git commit ^&^& git push 即可部署。
pause
