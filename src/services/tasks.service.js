import { AppError } from "../errors/AppError.js";
import * as tasksRepository from "../repositories/tasks.repository.js";
import {
  normalizeTaskInput,
  validateTask
} from "../validators/tasks.validator.js";

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

function parseTaskId(value) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, "El identificador de tarea no es válido");
  }

  return id;
}

function validateFilters({ status, priority }) {
  if (status !== undefined && !VALID_STATUSES.has(status)) {
    throw new AppError(400, "El filtro status no es válido");
  }

  if (priority !== undefined && !VALID_PRIORITIES.has(priority)) {
    throw new AppError(400, "El filtro priority no es válido");
  }
}

export async function listTasks(userId, filters = {}) {
  validateFilters(filters);

  return tasksRepository.findAllByUser(userId, filters);
}

export async function getTask(idValue, userId) {
  const id = parseTaskId(idValue);
  const task = await tasksRepository.findById(id, userId);

  if (!task) {
    throw new AppError(404, "Tarea no encontrada");
  }

  return task;
}

export async function createTask(data, userId) {
  const errors = validateTask(data);

  if (errors.length > 0) {
    throw new AppError(422, "Datos de tarea no válidos", errors);
  }

  const task = normalizeTaskInput(data);

  return tasksRepository.create(task, userId);
}

export async function replaceTask(idValue, data, userId) {
  const id = parseTaskId(idValue);
  const errors = validateTask(data);

  if (errors.length > 0) {
    throw new AppError(422, "Datos de tarea no válidos", errors);
  }

  const task = normalizeTaskInput(data);
  const updated = await tasksRepository.replace(id, task, userId);

  if (!updated) {
    throw new AppError(404, "Tarea no encontrada");
  }

  return updated;
}

export async function updateTask(idValue, data, userId) {
  const id = parseTaskId(idValue);
  const errors = validateTask(data, { partial: true });

  if (errors.length > 0) {
    throw new AppError(422, "Datos de tarea no válidos", errors);
  }

  const changes = normalizeTaskInput(data);
  const updated = await tasksRepository.update(id, changes, userId);

  if (!updated) {
    throw new AppError(404, "Tarea no encontrada");
  }

  return updated;
}

export async function deleteTask(idValue, userId) {
  const id = parseTaskId(idValue);
  const deleted = await tasksRepository.remove(id, userId);

  if (!deleted) {
    throw new AppError(404, "Tarea no encontrada");
  }
}
