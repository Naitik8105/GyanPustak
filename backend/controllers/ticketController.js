const ticketModel = require('../models/ticketModel');

const ALLOWED_STATUSES = ['new', 'assigned', 'in-process', 'closed'];

function normalizeStatus(status) {
  return String(status || '').trim().toLowerCase();
}

function canCustomerSupportChange(fromStatus, toStatus) {
  return fromStatus === 'new' && toStatus === 'assigned';
}

function canAdministratorChange(fromStatus, toStatus) {
  if (fromStatus === 'assigned') return toStatus === 'in-process';
  if (fromStatus === 'in-process') return toStatus === 'closed';
  return false;
}

async function createTicket(req, res) {
  try {
    const role = req.user.role;

    if (!['student', 'customer_support'].includes(role)) {
      return res.status(403).json({
        message: 'Only students or customer support users can create tickets',
      });
    }

    const {
      category,
      title,
      problem_description,
    } = req.body;

    if (!category || !title || !problem_description) {
      return res.status(400).json({
        message: 'Category, title and problem description are required',
      });
    }

    const ticketId = await ticketModel.createTicket({
      category,
      title,
      problem_description,
      solution_description: null,
      current_status: 'new',
      created_by_student_id: role === 'student' ? req.user.id : null,
      created_by_support_id: role === 'customer_support' ? req.user.id : null,
      assigned_admin_id: null,
      resolved_admin_id: null,
    });

    return res.status(201).json({ message: 'Ticket created', ticketId });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function listTickets(req, res) {
  try {
    const role = req.user.role;

    if (role === 'student') {
      const tickets = await ticketModel.listTicketsForStudent(req.user.id);
      return res.json(tickets);
    }

    const allTickets = await ticketModel.listTicketsForEmployee();

    if (role === 'customer_support' || role === 'super_admin') {
      return res.json(allTickets);
    }

    if (role === 'administrator') {
      const filtered = allTickets.filter((t) =>
        ['assigned', 'in-process', 'closed'].includes(normalizeStatus(t.current_status))
      );
      return res.json(filtered);
    }

    return res.status(403).json({ message: 'Access denied' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function changeStatus(req, res) {
  try {
    const role = req.user.role;
    const ticketId = req.params.id;
    const newStatus = normalizeStatus(req.body.status);
    const solutionDescription = req.body.solution_description || null;
    const assignedAdminId = req.body.assigned_admin_id || null;

    if (!ALLOWED_STATUSES.includes(newStatus)) {
      return res.status(400).json({
        message: 'Invalid status value',
      });
    }

    const allTickets = await ticketModel.listTicketsForEmployee();
    const ticket = allTickets.find((t) => String(t.ticket_id) === String(ticketId));

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const currentStatus = normalizeStatus(ticket.current_status);

    if (role === 'customer_support') {
  if (!canCustomerSupportChange(currentStatus, newStatus)) {
    return res.status(403).json({
      message: 'Customer support can only change new tickets to assigned',
    });
  }

  if (!assignedAdminId) {
    return res.status(400).json({
      message: 'Admin must be assigned when changing status to assigned',
    });
  }
}

    if (role === 'administrator' || role === 'super_admin') {
      if (!['assigned', 'in-process', 'closed'].includes(currentStatus)) {
        return res.status(403).json({
          message: 'Administrators cannot modify tickets in new state',
        });
      }

      if (!canAdministratorChange(currentStatus, newStatus)) {
        return res.status(403).json({
          message: 'Invalid status transition for administrator',
        });
      }
    }

    if (role === 'student') {
      return res.status(403).json({
        message: 'Students cannot change ticket status',
      });
    }

    await ticketModel.updateTicketStatus(
      ticketId,
      newStatus,
      req.user.id,
      solutionDescription,
      assignedAdminId
    );

    return res.json({ message: 'Ticket status updated' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function history(req, res) {
  try {
    const rows = await ticketModel.getTicketHistory(req.params.id);
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = { createTicket, listTickets, changeStatus, history };