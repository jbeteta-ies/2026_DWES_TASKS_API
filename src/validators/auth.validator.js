// Solo se admiten estos campos para evitar que el cliente asigne, por ejemplo,
// su propio rol durante el registro.
const REGISTER_FIELDS = new Set(["name", "email", "password"]);
const LOGIN_FIELDS = new Set(["email", "password"]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function findUnknownFields(data, allowedFields) {
  return Object.keys(data).filter((field) => !allowedFields.has(field));
}

function validateEmail(email, errors) {
  if (typeof email !== "string" || email.trim() === "") {
    errors.push("El correo es obligatorio");
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail.length > 255) {
    errors.push("El correo no puede superar 255 caracteres");
  }

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    errors.push("El formato del correo no es válido");
  }
}

function validatePassword(password, errors, { checkLength = false } = {}) {
  if (typeof password !== "string" || password === "") {
    errors.push("La contraseña es obligatoria");
    return;
  }

  // bcrypt solo procesa de forma segura los primeros 72 bytes.
  if (Buffer.byteLength(password, "utf8") > 72) {
    errors.push("La contraseña no puede superar 72 bytes");
  }

  if (checkLength && password.length < 10) {
    errors.push("La contraseña debe tener al menos 10 caracteres");
  }
}

/**
 * Valida la forma de los datos de registro y devuelve una lista de errores.
 * El servicio decide cómo convertir esos errores en una respuesta HTTP.
 * @param {unknown} data Cuerpo JSON enviado por el cliente.
 * @returns {string[]} Errores encontrados; una lista vacía indica que es válido.
 */
export function validateRegister(data) {
  const errors = [];

  if (!isObject(data)) {
    return ["El cuerpo debe ser un objeto JSON"];
  }

  const unknownFields = findUnknownFields(data, REGISTER_FIELDS);

  if (unknownFields.length > 0) {
    errors.push(`Campos no admitidos: ${unknownFields.join(", ")}`);
  }

  if (typeof data.name !== "string" || data.name.trim() === "") {
    errors.push("El nombre es obligatorio");
  } else if (data.name.trim().length > 100) {
    errors.push("El nombre no puede superar 100 caracteres");
  }

  validateEmail(data.email, errors);
  validatePassword(data.password, errors, { checkLength: true });

  return errors;
}

/**
 * Valida las credenciales recibidas durante el login.
 * No aplica las reglas nuevas de longitud mínima a cuentas existentes.
 * @param {unknown} data Cuerpo JSON enviado por el cliente.
 * @returns {string[]} Errores encontrados; una lista vacía indica que es válido.
 */
export function validateLogin(data) {
  const errors = [];

  if (!isObject(data)) {
    return ["El cuerpo debe ser un objeto JSON"];
  }

  const unknownFields = findUnknownFields(data, LOGIN_FIELDS);

  if (unknownFields.length > 0) {
    errors.push(`Campos no admitidos: ${unknownFields.join(", ")}`);
  }

  validateEmail(data.email, errors);
  validatePassword(data.password, errors);

  return errors;
}

/**
 * Normaliza nombre y correo, pero conserva exactamente la contraseña.
 * @param {{name: string, email: string, password: string}} data Datos validados.
 * @returns {{name: string, email: string, password: string}} Entrada normalizada.
 */
export function normalizeRegisterInput(data) {
  return {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    password: data.password
  };
}

/**
 * Normaliza el correo de acceso sin modificar la contraseña.
 * @param {{email: string, password: string}} data Credenciales validadas.
 * @returns {{email: string, password: string}} Credenciales normalizadas.
 */
export function normalizeLoginInput(data) {
  return {
    email: data.email.trim().toLowerCase(),
    password: data.password
  };
}
