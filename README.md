# VriSA - Sistema de Monitoreo de Riesgos Ambientales

![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)
![React Native](https://img.shields.io/badge/React_Native-v0.73+-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-SDK_50-000020?style=for-the-badge&logo=expo&logoColor=white)
![NativeWind](https://img.shields.io/badge/Tailwind_CSS-NativeWind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-iOS_%7C_Android-gray?style=for-the-badge)

> **VriSA Mobile** es una aplicación multiplataforma diseñada para la visualización en tiempo real de la calidad del aire, gestión de estaciones de monitoreo y generación de reportes ambientales, conectando a ciudadanos, investigadores e instituciones.

---

## Descripción General

VriSA (Mobile) es el cliente móvil del ecosistema VriSA. Permite el acceso democratizado a la información ambiental mediante una interfaz intuitiva y roles de usuario definidos. La aplicación consume una API RESTful (Django) y ofrece funcionalidades específicas según el perfil del usuario (Ciudadano, Investigador o Administrador de Estación).

## Características Principales

*   **Autenticación Segura:** Gestión de sesiones mediante JWT almacenados en SecureStore.
*   **Roles Dinámicos:** Flujos de registro diferenciados para Instituciones, Investigadores y Ciudadanos.
*   **Dashboard en Tiempo Real:** Visualización de métricas AQI (Índice de Calidad del Aire) y contaminantes (PM2.5, PM10, CO, etc.).
*   **Gestión de Estaciones:** Interfaz para administradores de estaciones para ver estado de sensores y mantenimientos.
*   **Reportes PDF:** Generación y descarga de reportes históricos y certificados de calibración directamente al dispositivo.
*   **Diseño Moderno:** UI construida con **NativeWind** (TailwindCSS para React Native).

## Stack Tecnológico

El proyecto está construido sobre una arquitectura robusta y moderna:

*   **Core:** [React Native](https://reactnative.dev/)
*   **Framework:** [Expo](https://expo.dev/) (SDK 50+)
*   **Navegación:** [Expo Router](https://docs.expo.dev/router/introduction/) (v3) - Navegación basada en archivos.
*   **Estilos:** [NativeWind](https://www.nativewind.dev/) (TailwindCSS).
*   **Estado:** React Context API + Hooks.
*   **Almacenamiento Local:** Expo SecureStore & AsyncStorage.
*   **Manejo de Archivos:** Expo FileSystem & Sharing (para PDFs).

## Arquitectura del Proyecto

El código sigue una estructura modular basada en dominios dentro de la carpeta `src/shared`

## Configuración para desarrolladores

1. Clona el repositorio

```bash
git clone https://github.com/NicolleP16/vrisa-mobile.git
cd vrisa-mobile
```

2. Instala dependencias
```bash
npm install
```

3. Configurar variables de entorno
Copia el archivo de ejemplo y ponle el nombre de `.env`
```bash
.env.example 
```

4. Edita `.env` y pon tu IP local:
   - Windows: ejecuta `ipconfig`
   - Mac/Linux: ejecuta `ifconfig`
   
5. Inicia el proyecto
```bash
npx expo start -c
```
**IMPORTANTE:** 
- Asegurate de descargar Expo Go en tu dispositivo móvil.
- Tu dispositivo/emulador y tu PC deben estar en la misma red WiFi
- Si cambias de red WiFi, actualiza la IP en tu `.env`

> _Nota_: En caso de tener problemas de conexión por Firewall, es viable intentar con el argumento --tunnel
```
npx expo start --tunnel -c
```
Si adicionalmente, no se consigue una conexión con el servicio backend. Se puede utilizar ngrok para disponibilizar el servicio con `ngrok http 8000`.
En tal 
