@echo off
echo Starting frontend...
cd frontend
start cmd /k "npm run dev"

cd..
echo Starting backend...
cd backend
start cmd /k "python app.py"

echo Both frontend and backend have been started in separate terminals.
pause
