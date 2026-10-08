# API de tareas con Node.js, Express y MySQL

API REST para gestionar tareas con persistencia en MySQL. La base de datos y
el usuario temporal se configuran en `database/init/create.sql`; las tareas
se asocian provisionalmente al usuario con identificador `1`.

## Requisitos

- Docker y Docker Compose
- La extensión REST Client de Visual Studio Code para ejecutar `api.http`

## Iniciar la aplicación

Desde la raíz del proyecto:

```bash
docker compose up --build
```

Docker Compose inicia MySQL y, cuando está disponible, la API en
`http://localhost:3000`. La configuración de puertos y credenciales se puede
ajustar en `.env`; `.env.example` muestra las variables disponibles.

La base de datos `dwes` utiliza el volumen persistente de Docker. El script de
`database/init` se ejecuta al inicializar por primera vez ese volumen.

## Probar la API

Abre `api.http` en Visual Studio Code y ejecuta cada petición con REST Client.
El archivo incluye ejemplos de listado, filtros, consulta, creación,
sustitución, modificación parcial, eliminación y errores.

| Operación | Respuesta esperada |
| --- | ---: |
| Listar o consultar una tarea | `200` |
| Crear una tarea | `201` |
| Sustituir o modificar una tarea | `200` |
| Eliminar una tarea | `204` |
| Identificador no válido | `400` |
| Tarea inexistente | `404` |
| Datos de tarea no válidos | `422` |
| JSON mal formado | `400` |

Las tareas creadas permanecen en MySQL después de reiniciar Node.js.
