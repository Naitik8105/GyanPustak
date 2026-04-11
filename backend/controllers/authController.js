const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authModel = require('../models/authModel');

async function register(req, res) {
  try {
    const {
      first_name, last_name, email, phone_number, address,
      password,
      date_of_birth, university_affiliation, major, student_status, current_year_of_study
    } = req.body;

    const role = 'student';

    const existing = await authModel.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const personId = await authModel.createPerson({
      first_name, last_name, email, phone_number, address
    });

    const passwordHash = await bcrypt.hash(password, 10);

    await authModel.createAccount({
      personId,
      email,
      passwordHash,
      role
    });

    await authModel.createStudentProfile({
      personId,
      date_of_birth,
      university_affiliation,
      major,
      student_status,
      current_year_of_study
    });

    return res.status(201).json({ message: 'Student registered successfully' });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function createEmployee(req, res) {
  try {
    if (!req.user || req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Only super admin can create employees' });
    }

    const {
      first_name, last_name, email, phone_number, address,
      password,
      gender, salary, aadhaar_number,
      role 
    } = req.body;

    if (!['customer_support', 'administrator'].includes(role)) {
      return res.status(400).json({ message: 'Invalid employee role' });
    }

    const existing = await authModel.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const personId = await authModel.createPerson({
      first_name, last_name, email, phone_number, address
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
    return res.status(500).json({ message: error.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await authModel.getUserByEmail(email);

    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      {
        accountId: user.account_id,
        id: user.person_id,
        role: user.role,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.person_id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function me(req, res) {
  try {
    const user = await authModel.getMeByAccountId(req.user.accountId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { register, login, me, createEmployee };