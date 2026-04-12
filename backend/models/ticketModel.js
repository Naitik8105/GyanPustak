const pool = require('../config/db');

const ALLOWED_STATUSES = new Set(['new', 'assigned', 'in-process', 'closed']);

function normalizeStatus(status) {
  return String(status || '').trim().toLowerCase();
}

function validateStatus(status) {
  const normalized = normalizeStatus(status);
  if (!ALLOWED_STATUSES.has(normalized)) {
    throw new Error('Invalid status value');
  }
  return normalized;
}

async function createTicket(data) {
  const {
    category,
    title,
    problem_description,
    created_by_student_id,
    created_by_support_id,
    assigned_admin_id,
    resolved_admin_id,
    current_status,
  } = data;

  const normalizedStatus = current_status ? validateStatus(current_status) : 'new';

  const [result] = await pool.execute(
    `INSERT INTO trouble_ticket
     (category, title, problem_description, current_status,
      created_by_student_id, created_by_support_id,
      assigned_admin_id, resolved_admin_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      category || null,
      title,
      problem_description,
      normalizedStatus,
      created_by_student_id || null,
      created_by_support_id || null,
      assigned_admin_id || null,
      resolved_admin_id || null,
    ]
  );

  return result.insertId;
}

async function listTicketsForStudent(studentId) {
  const [rows] = await pool.execute(
    `SELECT *
     FROM trouble_ticket
     WHERE created_by_student_id = ?
     ORDER BY ticket_id DESC`,
    [studentId]
  );
  return rows;
}

async function listTicketsForEmployee() {
  const [rows] = await pool.query(
    `SELECT *
     FROM trouble_ticket
     ORDER BY ticket_id DESC`
  );
  return rows;
}

async function updateTicketStatus(ticketId, status, employeeId, solutionDescription = null, assignedAdminId = null) {
  const nextStatus = validateStatus(status);

  const [ticketRows] = await pool.execute(
    `SELECT current_status, assigned_admin_id
     FROM trouble_ticket
     WHERE ticket_id = ?`,
    [ticketId]
  );

  if (!ticketRows.length) {
    throw new Error('Ticket not found');
  }

  const oldStatus = normalizeStatus(ticketRows[0].current_status);

  const nextAssignedAdminId =
    assignedAdminId !== null && assignedAdminId !== undefined
      ? assignedAdminId
      : ticketRows[0].assigned_admin_id;

  await pool.execute(
    `UPDATE trouble_ticket
     SET current_status = ?,
         solution_description = COALESCE(?, solution_description),
         assigned_admin_id = COALESCE(?, assigned_admin_id),
         resolved_admin_id = CASE
             WHEN ? = 'closed' THEN ?
             ELSE resolved_admin_id
         END,
         completion_date = CASE
             WHEN ? = 'closed' THEN CURRENT_TIMESTAMP
             ELSE completion_date
         END
     WHERE ticket_id = ?`,
    [
      nextStatus,
      solutionDescription,
      nextAssignedAdminId,
      nextStatus,
      employeeId,
      nextStatus,
      ticketId,
    ]
  );

  await pool.execute(
    `INSERT INTO ticket_status_history
     (ticket_id, old_status, new_status, changed_by_employee_id)
     VALUES (?, ?, ?, ?)`,
    [ticketId, oldStatus, nextStatus, employeeId]
  );
}

async function getTicketHistory(ticketId) {
  const [rows] = await pool.execute(
    `SELECT *
     FROM ticket_status_history
     WHERE ticket_id = ?
     ORDER BY changed_at DESC`,
    [ticketId]
  );
  return rows;
}

module.exports = {
  createTicket,
  listTicketsForStudent,
  listTicketsForEmployee,
  updateTicketStatus,
  getTicketHistory,
};