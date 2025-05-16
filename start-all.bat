@echo off
echo Starting Employee Management System...

echo Checking for existing processes on port 4000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4000') do (
    echo Found process: %%a on port 4000
    taskkill /F /PID %%a 2>NUL
)

echo Checking for existing processes on port 4200...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4200') do (
    echo Found process: %%a on port 4200
    taskkill /F /PID %%a 2>NUL
)

start cmd /k "cd backend && npm start"
start cmd /k "cd frontend && npm start"
echo Both services are starting in separate windows. 