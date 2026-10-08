const VALID_STATUSES = new Set([
  "pending",
  "in_progress",
  "completed"
]);

const VALID_PRIORITIES = new Set([
  "low",
  "medium",
  "high"
]);

const ALLOWED_FIELDS = new Set([
  "title",
  "description",
  "status",
  "priority",
  "dueDate"
]);

function isValidDateString(value) {
  if (typeof value !== "string") {
    return false;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

export function validateTask(data, { partial = false } = {}) {
  const errors = [];

  if (
    data === null ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    return ["El cuerpo debe ser un objeto JSON"];
  }

  const unknownFields = Object.keys(data).filter(
    (field) => !ALLOWED_FIELDS.has(field)
  );

  if (unknownFields.length > 0) {
    errors.push(`Campos no admitidos: ${unknownFields.join(", ")}`);
  }

  if (partial && Object.keys(data).length === 0) {
    errors.push("Debe enviarse al menos un campo");
  }

  if (!partial || "title" in data) {
    if (
      typeof data.title !== "string" ||
      data.title.trim() === ""
    ) {
      errors.push("El título es obligatorio");
    } else if (data.title.trim().length > 150) {
      errors.push("El título no puede superar 150 caracteres");
    }
  }

  if ("description" in data) {
    if (
      data.description !== null &&
      typeof data.description !== "string"
    ) {
      errors.push("La descripción debe ser una cadena o null");
    }
  }

  if ("status" in data) {
    if (!VALID_STATUSES.has(data.status)) {
      errors.push("El estado debe ser pending, in_progress o completed");
    }
  }

  if ("priority" in data) {
    if (!VALID_PRIORITIES.has(data.priority)) {
      errors.push("La prioridad debe ser low, medium o high");
    }
  }

  if ("dueDate" in data) {
    if (data.dueDate !== null && !isValidDateString(data.dueDate)) {
      errors.push("La fecha límite debe tener formato YYYY-MM-DD o ser null");
    }
  }

  return errors;
}

export function normalizeTaskInput(data) {
  const normalized = {};

  if ("title" in data) {
    normalized.title = data.title.trim();
  }

  if ("description" in data) {
    normalized.description =
      data.description === null
        ? null
        : data.description.trim() || null;
  }

  if ("status" in data) {
    normalized.status = data.status;
  }

  if ("priority" in data) {
    normalized.priority = data.priority;
  }

  if ("dueDate" in data) {
    normalized.dueDate = data.dueDate;
  }

  return normalized;
}
