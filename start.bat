@echo off
echo Starting OPD backend and frontend...
echo.

REM ── Backend (Spring Boot) ─────────────────────────────────────────────
start "OPD Backend" cmd /k "cd /d %~dp0backend && mvnw.cmd spring-boot:run"

REM ── Wait a moment for backend to begin startup ────────────────────────
timeout /t 3 /nobreak >nul

REM ── Frontend (Angular dev server) ─────────────────────────────────────
start "OPD Frontend" cmd /k "cd /d %~dp0frontend && npm run start"

echo.
echo Both servers are starting in separate windows.
echo   Backend  → http://localhost:8080
echo   Frontend → http://localhost:4200
echo.
