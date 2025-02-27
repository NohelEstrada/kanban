#!/bin/bash

BACKEND_DIR="kanban_project"
FRONTEND_DIR="src"
VENV_DIR="venv"
DJANGO_PORT=8000
DEFAULT_REACT_PORT=3000


echo "Moviéndonos a la raíz del proyecto..."
cd "$(dirname "$0")" || exit

# Verificar si el entorno virtual existe
if [ ! -d "$VENV_DIR" ]; then
    echo "El entorno virtual '$VENV_DIR' no existe."
    exit 1
fi

echo "Activando el entorno virtual..."
source $VENV_DIR/bin/activate


echo "Instalando dependencias de Django..."
pip install -r requirements.txt --no-cache-dir


echo "Aplicando migraciones..."
cd $BACKEND_DIR || exit
python3 manage.py makemigrations
python3 manage.py migrate


echo "Iniciando el servidor de Django en el puerto $DJANGO_PORT..."
python3 manage.py runserver 0.0.0.0:$DJANGO_PORT &


cd ..


echo "Moviéndonos al frontend..."
cd $FRONTEND_DIR || exit

if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias de React..."
    npm install
fi

REACT_PORT=$DEFAULT_REACT_PORT
while lsof -i :$REACT_PORT &>/dev/null; do
    ((REACT_PORT++))
done

echo "Iniciando el servidor de React en el puerto $REACT_PORT..."
export BROWSER=none
export PORT=$REACT_PORT
npm start &

echo " Servidores en ejecución:"
echo "   - Django: http://127.0.0.1:$DJANGO_PORT"
echo "   - React: http://localhost:$REACT_PORT"
