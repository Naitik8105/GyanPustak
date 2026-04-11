const pool = require('../config/db');

async function getUserByEmail(email) {
  const [rows] = await pool.execute(
    `SELECT ua.account_id, ua.person_id, ua.email, ua.password_hash, ua.role, ua.is_active,
            p.first_name, p.last_name
     FROM user_account ua
     JOIN person p ON p.person_id = ua.person_id
     WHERE ua.email = ?`,
    [email]
  );
  return rows[0] || null;
}

async function createPerson({ first_name, last_name, email, phone_number, address }) {
  const [result] = await pool.execute(
    `INSERT INTO person (first_name, last_name, email, phone_number, address)
     VALUES (?, ?, ?, ?, ?)`,
    [first_name, last_name, email, phone_number || null, address || null]
  );
  return result.insertId;
}

async function createAccount({ personId, email, passwordHash, role }) {
  const [result] = await pool.execute(
    `INSERT INTO user_account (person_id, email, password_hash, role)
     VALUES (?, ?, ?, ?)`,
    [personId, email, passwordHash, role]
  );
  return result.insertId;
}

async function createStudentProfile({ personId, university_affiliation, major, student_status, current_year_of_study, date_of_birth }) {
  await pool.execute(
    `INSERT INTO student (person_id, date_of_birth, university_affiliation, major, student_status, current_year_of_study)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [personId, date_of_birth || null, university_affiliation || null, major || null, student_status || null, current_year_of_study || null]
  );
}

async function createEmployeeProfile({ personId, gender, salary, aadhaar_number }) {
  await pool.execute(
    `INSERT INTO employee (person_id, gender, salary, aadhaar_number)
     VALUES (?, ?, ?, ?)`,
    [personId, gender || null, salary || null, aadhaar_number || null]
  );
}

async function createCustomerSupportProfile(personId) {
  await pool.execute(`INSERT INTO customer_support (person_id) VALUES (?)`, [personId]);
}

async function createAdministratorProfile(personId) {
  await pool.execute(`INSERT INTO administrator (person_id) VALUES (?)`, [personId]);
}

async function createSuperAdminProfile(personId) {
  await pool.execute(`INSERT INTO super_admin (person_id) VALUES (?)`, [personId]);
}

async function getMeByAccountId(accountId) {
  const [rows] = await pool.execute(
    `SELECT ua.account_id, ua.person_id, ua.email, ua.role, p.first_name, p.last_name, p.phone_number, p.address
     FROM user_account ua
     JOIN person p ON p.person_id = ua.person_id
     WHERE ua.account_id = ?`,
    [accountId]
  );
  return rows[0] || null;
}

module.exports = {
  getUserByEmail,
  createPerson,
  createAccount,
  createStudentProfile,
  createEmployeeProfile,
  createCustomerSupportProfile,
  createAdministratorProfile,
  createSuperAdminProfile,
  getMeByAccountId,
};
