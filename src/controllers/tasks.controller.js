import * as tasksService from "../services/tasks.service.js";

const TEMP_USER_ID = 1;

export async function listTasks(req, res) {
  const tasks = await tasksService.listTasks(TEMP_USER_ID, {
    status: req.query.status,
    priority: req.query.priority
  });

  return res.status(200).json(tasks);
}

export async function getTask(req, res) {
  const task = await tasksService.getTask(req.params.id, TEMP_USER_ID);

  return res.status(200).json(task);
}

export async function createTask(req, res) {
  const task = await tasksService.createTask(req.body, TEMP_USER_ID);

  return res
    .status(201)
    .location(`/tasks/${task.id}`)
    .json(task);
}

export async function replaceTask(req, res) {
  const task = await tasksService.replaceTask(
    req.params.id,
    req.body,
    TEMP_USER_ID
  );

  return res.status(200).json(task);
}

export async function updateTask(req, res) {
  const task = await tasksService.updateTask(
    req.params.id,
    req.body,
    TEMP_USER_ID
  );

  return res.status(200).json(task);
}

export async function deleteTask(req, res) {
  await tasksService.deleteTask(req.params.id, TEMP_USER_ID);

  return res.status(204).send();
}
