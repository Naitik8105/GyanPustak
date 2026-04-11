const bcrypt = require('bcrypt');
const employeeModel = require('../models/employeeModel');

async function listEmployees(req, res) {
  try {
    if (!['administrator', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const employees = await employeeModel.listEmployees();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function searchEmployees(req, res) {
  try {
    if (!['administrator', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const employees = await employeeModel.searchEmployees(req.query.q || '');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function createEmployee(req, res) {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Only super admin can create employees' });
    }

    const {
      first_name,
      last_name,
      email,
      phone_number,
      address,
      password,
      gender,
      salary,
      aadhaar_number,
      role
    } = req.body;

    if (!['customer_support', 'administrator'].includes(role)) {
      return res.status(400).json({ message: 'Role must be customer_support or administrator' });
    }

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const created = await employeeModel.createEmployee({
      first_name,
      last_name,
      email,
      phone_number,
      address,
      passwordHash,
      gender,
      salary,
      aadhaar_number,
      role
    });

    res.status(201).json({
      message: 'Employee created successfully',
      data: created
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { listEmployees, searchEmployees, createEmployee };