# API de tareas con Node.js, Express y MySQL

Proyecto didáctico para construir paso a paso una API REST de tareas. Las
soluciones de cada tema se guardan en etiquetas de Git: `main` contiene la
solución más reciente y completa, y cada etiqueta permite consultar un hito
anterior.

## Requisitos

- Git
- Docker y Docker Compose
- Visual Studio Code con la extensión REST Client para ejecutar `api.http`

## Clonar el proyecto

Abre una terminal y ejecuta:

```bash
git clone https://github.com/jbeteta-ies/2026_DWES_TASKS_API.git
cd 2026_DWES_TASKS_API
```

Puedes comprobar las versiones disponibles con:

```bash
git tag --list
```

## Recorrer las soluciones con etiquetas

Cada etiqueta marca el estado del proyecto al completar un tema. Para abrir,
por ejemplo, la solución del CRUD:

```bash
git switch --detach u1-crud
```

En esa versión puedes leer el código y ejecutar la API. Git mostrará que estás
en modo *detached HEAD*: estás visitando una versión concreta, no trabajando en
una rama. Es el modo recomendado para explorar las soluciones sin modificarlas.

Para regresar a la solución más reciente:

```bash
git switch main
git pull
```

Si quieres volver a otra versión, repite `git switch --detach` con la etiqueta
correspondiente. El recorrido previsto es:

| Etiqueta | Contenido |
| --- | --- |
| `u1-crud` | CRUD persistente con MySQL (punto de partida) |
| `u1-05-02-auth` | Registro y login |
| `u1-05-03-jwt` | Autenticación con JWT y `/auth/me` |
| `u1-05-04-completo` | Middleware, rutas protegidas y tareas por usuario |

Las etiquetas de los hitos se publicarán a medida que se complete cada tema.
Si una etiqueta todavía no aparece en `git tag --list`, ese hito aún no está
disponible. Para descargar las etiquetas publicadas más recientemente:

```bash
git fetch --tags
```

No se recomienda crear commits mientras se está en *detached HEAD*. Para
desarrollar cambios propios, vuelve a `main` y crea una rama de trabajo:

```bash
git switch main
git switch -c mi-rama
```

## Configurar y arrancar la aplicación

Desde la carpeta del proyecto, crea el archivo local de configuración a partir
del ejemplo:

```bash
cp .env.example .env
```

Genera un secreto aleatorio para firmar los JWT:

```bash
node --input-type=module -e "import { randomBytes } from 'node:crypto'; console.log(randomBytes(32).toString('hex'))"
```

Copia el resultado y sustituye el valor de `JWT_SECRET` en `.env`. El ejemplo
también configura una caducidad de `15m`, el emisor `tasks-api` y la audiencia
`tasks-api-users`. El `.env` contiene la configuración local y no se debe subir
a Git.

Para iniciar MySQL y la API:

```bash
docker compose up --build
```

Cuando los servicios estén preparados, la API estará disponible en
`http://localhost:3000`. Para detener los contenedores, pulsa `Ctrl+C` y
ejecuta:

```bash
docker compose down
```

Los datos de MySQL se conservan en un volumen de Docker aunque se detengan los
contenedores. Para borrar también ese volumen y empezar con una base de datos
vacía:

```bash
docker compose down --volumes
```

Este último comando elimina los datos locales guardados en MySQL.

## Probar la API

Abre `api.http` en Visual Studio Code y ejecuta las peticiones con REST Client.
En el hito de autenticación también puedes probar el registro y el login.
Ejecuta primero las peticiones de registro y después las de login. El correo
debe ser único: si repites un registro ya realizado, la respuesta esperada es
`409 Conflict`. Puedes volver a empezar con una base de datos vacía mediante
`docker compose down --volumes` y arrancando de nuevo con
`docker compose up --build`.

El registro crea cuentas con rol `user`, valida el correo y almacena la
contraseña como hash bcrypt. Ni el hash ni la contraseña aparecen en la
respuesta. El login responde `200` con el usuario público; credenciales
incorrectas responden `401` con el mismo mensaje tanto para un correo existente
como para uno inexistente.

El login también devuelve `accessToken` y `tokenType: "Bearer"`. La petición
`GET /auth/me` comprueba la firma, el algoritmo, la caducidad, el emisor y la
audiencia del token y responde con los datos actuales del usuario. En el hito
final, esta verificación se realiza mediante el middleware `authenticate`.

Las rutas `/tasks` necesitan un Bearer token. El middleware incorpora el usuario
actual a `req.user`, y cada operación consulta o modifica tareas usando
`req.user.id`. Por eso una cuenta no puede listar, consultar, modificar o
eliminar tareas de otra cuenta; los recursos ajenos responden `404`.

La ruta `GET /admin/stats` requiere autenticación y rol `admin`. Para probarla,
promociona Ana desde MySQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'ana@example.com';
```

El middleware consulta el rol vigente en MySQL al autenticar cada petición, así
que Ana puede volver a probar con el token que ya tenía. Luis, con rol `user`,
debe recibir `403`. Las consultas administrativas están separadas en
repositorio, servicio y controlador, siguiendo la arquitectura del proyecto.

En `api.http` se puede ejecutar el flujo de dos cuentas: iniciar sesión como
Ana y Luis, crear una tarea de Ana y comprobar que Luis no puede acceder a ella.

El archivo `api.http` mantiene también ejemplos de las operaciones CRUD del
hito actual.

En el hito inicial del CRUD se esperan estas respuestas:

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
| Ruta de tareas sin autenticación | `401` |
| Tarea de otra cuenta | `404` |
| Ruta admin con rol `user` | `403` |

Las tareas quedan almacenadas en MySQL y permanecen después de reiniciar Node.js.

## Estructura de las versiones

Las versiones avanzan sobre `main` de forma incremental. Al final de cada tema
se publica una etiqueta para que puedas regresar a ese estado y comparar los
cambios con el siguiente:

1. CRUD persistente con MySQL.
2. Registro y login con contraseñas almacenadas como hash bcrypt.
3. Emisión y comprobación de JWT en `/auth/me`.
4. Middleware de autenticación, autorización por roles y tareas aisladas por usuario.

El código incluye comentarios orientados a explicar el recorrido de las
peticiones y la responsabilidad de las funciones y capas.
