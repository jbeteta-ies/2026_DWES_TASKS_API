import { pool } from "../config/database.js";

// El login necesita el hash; las respuestas públicas nunca deben seleccionarlo.
const PUBLIC_USER_SELECT = `
  SELECT
    id,
    name,
    email,
    role,
    created_at AS createdAt,
    updated_at AS updatedAt
  FROM users
`;

const PRIVATE_USER_SELECT = `
  SELECT
    id,
    name,
    email,
    password_hash AS passwordHash,
    role,
    created_at AS createdAt,
    updated_at AS updatedAt
  FROM users
`;

/** Busca la representación pública de una cuenta por su identificador. */
export async function findPublicById(id) {
  const [rows] = await pool.execute(
    `${PUBLIC_USER_SELECT} WHERE id = ? LIMIT 1`,
    [id]
  );

  return rows[0] ?? null;
}

/** Busca por correo incluyendo el hash, solo para verificar el login. */
export async function findPrivateByEmail(email) {
  const [rows] = await pool.execute(
    `${PRIVATE_USER_SELECT} WHERE email = ? LIMIT 1`,
    [email]
  );

  return rows[0] ?? null;
}

/** Comprueba si el correo ya está registrado antes de calcular el hash. */
export async function existsByEmail(email) {
  const [rows] = await pool.execute(
    `
      SELECT EXISTS(
        SELECT 1
        FROM users
        WHERE email = ?
      ) AS userExists
    `,
    [email]
  );

  return Boolean(rows[0].userExists);
}

/**
 * Crea una cuenta asignándole siempre el rol público `user`.
 * @param {{name: string, email: string, passwordHash: string}} user Datos para insertar.
 * @returns {Promise<object>} Representación pública de la cuenta creada.
 */
export async function create({ name, email, passwordHash }) {
  const [result] = await pool.execute(
    `
      INSERT INTO users (name, email, password_hash, role)
      VALUES (?, ?, ?, 'user')
    `,
    [name, email, passwordHash]
  );

  return findPublicById(result.insertId);
}
