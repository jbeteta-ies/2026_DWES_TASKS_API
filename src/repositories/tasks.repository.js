import { pool } from "../config/database.js";

const TASK_SELECT = `
  SELECT
    id,
    title,
    description,
    status,
    priority,
    due_date AS dueDate,
    user_id AS userId,
    created_at AS createdAt,
    updated_at AS updatedAt
  FROM tasks
`;

export async function findAllByUser(userId, { status, priority } = {}) {
  const conditions = ["user_id = ?"];
  const params = [userId];

  if (status !== undefined) {
    conditions.push("status = ?");
    params.push(status);
  }

  if (priority !== undefined) {
    conditions.push("priority = ?");
    params.push(priority);
  }

  const sql = `
    ${TASK_SELECT}
    WHERE ${conditions.join(" AND ")}
    ORDER BY created_at DESC, id DESC
  `;

  const [rows] = await pool.execute(sql, params);

  return rows;
}

export async function findById(id, userId) {
  const [rows] = await pool.execute(
    `
      ${TASK_SELECT}
      WHERE id = ? AND user_id = ?
      LIMIT 1
    `,
    [id, userId]
  );

  return rows[0] ?? null;
}

export async function create(task, userId) {
  const [result] = await pool.execute(
    `
      INSERT INTO tasks (
        title,
        description,
        status,
        priority,
        due_date,
        user_id
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      task.title,
      task.description ?? null,
      task.status ?? "pending",
      task.priority ?? "medium",
      task.dueDate ?? null,
      userId
    ]
  );

  return findById(result.insertId, userId);
}

export async function replace(id, task, userId) {
  const [result] = await pool.execute(
    `
      UPDATE tasks
      SET
        title = ?,
        description = ?,
        status = ?,
        priority = ?,
        due_date = ?
      WHERE id = ? AND user_id = ?
    `,
    [
      task.title,
      task.description ?? null,
      task.status ?? "pending",
      task.priority ?? "medium",
      task.dueDate ?? null,
      id,
      userId
    ]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return findById(id, userId);
}

export async function update(id, changes, userId) {
  const assignments = [];
  const params = [];

  const fieldMap = {
    title: "title",
    description: "description",
    status: "status",
    priority: "priority",
    dueDate: "due_date"
  };

  for (const [field, column] of Object.entries(fieldMap)) {
    if (field in changes) {
      assignments.push(`${column} = ?`);
      params.push(changes[field]);
    }
  }

  if (assignments.length === 0) {
    return findById(id, userId);
  }

  params.push(id, userId);

  const [result] = await pool.execute(
    `
      UPDATE tasks
      SET ${assignments.join(", ")}
      WHERE id = ? AND user_id = ?
    `,
    params
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return findById(id, userId);
}

export async function remove(id, userId) {
  const [result] = await pool.execute(
    `
      DELETE FROM tasks
      WHERE id = ? AND user_id = ?
    `,
    [id, userId]
  );

  return result.affectedRows > 0;
}
