**Instalación y Ejecución del Proyecto**

Este documento describe el procedimiento para la instalación y ejecución del proyecto, el cual utiliza Django para el backend y React para el frontend. Se ha proporcionado un script en Bash para automatizar este proceso.

**Requisitos Previos**

Antes de ejecutar el script, se deben cumplir los siguientes requisitos:

Tener Sqlite3

Tener Python 3 instalado.

Tener Node.js y npm instalados.

Haber clonado el repositorio en la máquina local.

**Procedimiento de Ejecución**

Para iniciar tanto el backend como el frontend de manera automatizada, siga estos pasos:

Abrir una terminal y navegar hasta la raíz del proyecto.

cd ruta/del/proyecto

Ejecutar el script:

./setup.sh

**Este script ejecutará las siguientes acciones:**

Activación del entorno virtual de Python.

Instalación de dependencias de Django en caso de ser necesario.

Aplicación de migraciones a la base de datos.

Inicio del servidor de Django.

Instalación de dependencias de React si no están presentes.

Inicio del servidor de React.
