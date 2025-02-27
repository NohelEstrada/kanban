#!/bin/bash

BACKEND_DIR="kanban_project"
FRONTEND_DIR="src"
VENV_DIR="venv"
DJANGO_PORT=8000
DEFAULT_REACT_PORT=3000
DB_FILE="db.sqlite3"

cd "$(dirname "$0")" || exit

if [ ! -d "$VENV_DIR" ]; then
    echo "El entorno virtual '$VENV_DIR' no existe. Creándolo..."
    python3 -m venv $VENV_DIR
fi

source $VENV_DIR/bin/activate

pip install -r requirements.txt --no-cache-dir

cd $BACKEND_DIR || exit
python3 manage.py makemigrations

if [ ! -f "$DB_FILE" ]; then
    echo "La base de datos no existe. Creándola..."
    python3 manage.py migrate --run-syncdb
else
    python3 manage.py migrate
fi

python3 manage.py runserver 0.0.0.0:$DJANGO_PORT &

cd ..

cd $FRONTEND_DIR || exit

if [ ! -d "node_modules" ]; then
    npm install
fi

REACT_PORT=$DEFAULT_REACT_PORT
while lsof -i :$REACT_PORT &>/dev/null; do
    ((REACT_PORT++))
done

export BROWSER=none
export PORT=$REACT_PORT
npm start &

echo "Servidores en ejecución:"
echo "   - Django: http://localhost:$DJANGO_PORT"
echo "   - React: http://localhost:$REACT_PORT"
