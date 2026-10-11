import "dotenv/config";

function requireEnv(name) {
  const value = process.env[name];

  if (value === undefined || value.trim() === "") {
    throw new Error(`Falta la variable de entorno ${name}`);
  }

  return value;
}

function parsePositiveInteger(value, name) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} debe ser un entero positivo`);
  }

  return parsed;
}

export const env = Object.freeze({
  port: parsePositiveInteger(process.env.PORT ?? "3000", "PORT"),

  // Coste usado por bcrypt al crear y comprobar hashes de contraseña.
  passwordRounds: parsePositiveInteger(
    process.env.PASSWORD_ROUNDS ?? "12",
    "PASSWORD_ROUNDS"
  ),

  db: Object.freeze({
    host: requireEnv("DB_HOST"),
    port: parsePositiveInteger(
      process.env.DB_PORT ?? "3306",
      "DB_PORT"
    ),
    user: requireEnv("DB_USER"),
    password: requireEnv("DB_PASSWORD"),
    database: requireEnv("DB_NAME"),
    connectionLimit: parsePositiveInteger(
      process.env.DB_CONNECTION_LIMIT ?? "10",
      "DB_CONNECTION_LIMIT"
    )
  })
});
