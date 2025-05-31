@echo off

cd F:\cid_staging\backend

pm2 start index.js --name cid_staging

pause
