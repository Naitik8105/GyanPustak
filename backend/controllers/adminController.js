const bcrypt = require('bcrypt');
const authModel = require('../models/authModel');

async function createEmployee(req, res) {
  try {
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
      return res.status(400).json({ message: 'Invalid role' });
    }

    const existing = await authModel.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const personId = await authModel.createPerson({
      first_name,
      last_name,
      email,
      phone_number,
      address
    });

    const passwordHash = await bcrypt.hash(password, 10);

    await authModel.createAccount({
      personId,
      email,
      passwordHash,
      role
    });

    await authModel.createEmployeeProfile({
      personId,
      gender,
      salary,
      aadhaar_number
    });

    if (role === 'customer_support') {
      await authModel.createCustomerSupportProfile(personId);
    }

    if (role === 'administrator') {
      await authModel.createAdministratorProfile(personId);
    }

    return res.status(201).json({ message: 'Employee created successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { createEmployee };