import * as tasksService from "../services/tasks.service.js";

// El router ejecuta authenticate antes de este controlador, por lo que req.user
// contiene el usuario público comprobado y no un id recibido desde el cliente.

/** Lista solo las tareas de la cuenta autenticada, aplicando sus filtros. */
export async function listTasks(req, res) {
  const tasks = await tasksService.listTasks(req.user.id, {
    status: req.query.status,
    priority: req.query.priority
  });

  return res.status(200).json(tasks);
}

/** Busca una tarea dentro del conjunto que pertenece al usuario autenticado. */
export async function getTask(req, res) {
  const task = await tasksService.getTask(req.params.id, req.user.id);

  return res.status(200).json(task);
}

/** Crea una tarea y toma su propietario desde req.user, nunca del cuerpo JSON. */
export async function createTask(req, res) {
  const task = await tasksService.createTask(req.body, req.user.id);

  return res
    .status(201)
    .location(`/tasks/${task.id}`)
    .json(task);
}

/** Sustituye todos los campos editables de una tarea propia. */
export async function replaceTask(req, res) {
  const task = await tasksService.replaceTask(
    req.params.id,
    req.body,
    req.user.id
  );

  return res.status(200).json(task);
}

/** Modifica parcialmente una tarea propia. */
export async function updateTask(req, res) {
  const task = await tasksService.updateTask(
    req.params.id,
    req.body,
    req.user.id
  );

  return res.status(200).json(task);
}

/** Elimina una tarea propia; una tarea ajena se comporta como inexistente. */
export async function deleteTask(req, res) {
  await tasksService.deleteTask(req.params.id, req.user.id);

  return res.status(204).send();
}
