## Configuración para desarrolladores

1. Clona el repositorio
git clone <url-del-repositorio>
cd <nombre-del-proyecto>

2. Instala dependencias: `npm install`

3. Configurar variables de entorno
Copia el archivo de ejemplo: `cp .env.example .env`

4. Edita `.env` y pon tu IP local:
   - Windows: ejecuta `ipconfig`
   - Mac/Linux: ejecuta `ifconfig`
   
5. Inicia el proyecto: `npx expo start -c`

**IMPORTANTE:** 
- Tu dispositivo/emulador y tu PC deben estar en la misma red WiFi
- Si cambias de red WiFi, actualiza la IP en tu `.env`