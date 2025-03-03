@echo off
setlocal

set BACKEND_DIR=kanban_project
set FRONTEND_DIR=src
set VENV_DIR=venv
set DJANGO_PORT=8000
set DEFAULT_REACT_PORT=3000
set DB_FILE=db.sqlite3

cd /d %~dp0

if not exist %VENV_DIR% (
    echo El entorno virtual "%VENV_DIR%" no existe. Creándolo...
    python -m venv %VENV_DIR%
)

call %VENV_DIR%\Scripts\activate

pip install -r requirements.txt --no-cache-dir

cd %BACKEND_DIR%
python manage.py makemigrations

if not exist %DB_FILE% (
    echo La base de datos no existe. Creándola...
    python manage.py migrate --run-syncdb
) else (
    python manage.py migrate
)

start python manage.py runserver 0.0.0.0:%DJANGO_PORT%

cd ..

cd %FRONTEND_DIR%

if not exist "node_modules" (
    npm install
)

set REACT_PORT=%DEFAULT_REACT_PORT%
for /L %%I in (0,1,50) do (
    netstat -an | find ":%REACT_PORT%" >nul && set /A REACT_PORT+=1 || goto start_react
)

:start_react
set BROWSER=none
set PORT=%REACT_PORT%
start "" cmd /k "npm start"

echo Servidores en ejecución:
echo    - Django: http://localhost:%DJANGO_PORT%
echo    - React: http://localhost:%REACT_PORT%

endlocal