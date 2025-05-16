@echo off
echo Checking for existing processes on port 4200...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4200') do (
    echo Found process: %%a on port 4200
    taskkill /F /PID %%a 2>NUL
)
echo Starting frontend application...
cd frontend
npm start 