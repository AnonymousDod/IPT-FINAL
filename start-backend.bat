@echo off
echo Checking for existing processes on port 4000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4000') do (
    echo Found process: %%a on port 4000
    taskkill /F /PID %%a 2>NUL
)
echo Starting backend server...
cd backend
npm start 