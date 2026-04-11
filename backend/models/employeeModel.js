const pool = require('../config/db');

async function listEmployees() {
  const [rows] = await pool.query(
    `SELECT 
        p.person_id, 
        p.first_name, 
        p.last_name, 
        p.email, 
        p.phone_number, 
        p.address,
        e.gender, 
        e.salary, 
        e.aadhaar_number,
        ua.role
     FROM person p
     JOIN employee e ON e.person_id = p.person_id
     JOIN user_account ua ON ua.person_id = p.person_id
     ORDER BY p.person_id DESC`
  );
  return rows;
}

async function searchEmployees(search = '') {
  const q = `%${search}%`;
  const [rows] = await pool.execute(
    `SELECT 
        p.person_id, 
        p.first_name, 
        p.last_name, 
        p.email, 
        p.phone_number, 
        p.address,
        e.gender, 
        e.salary, 
        e.aadhaar_number,
        ua.role
     FROM person p
     JOIN employee e ON e.person_id = p.person_id
     JOIN user_account ua ON ua.person_id = p.person_id
     WHERE 
        p.first_name LIKE ? OR 
        p.last_name LIKE ? OR 
        p.email LIKE ? OR 
        e.aadhaar_number LIKE ?
     ORDER BY p.person_id DESC`,
    [q, q, q, q]
  );
  return rows;
}

async function createEmployee(data) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const {
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
    } = data;

    const [personResult] = await conn.execute(
      `INSERT INTO person (first_name, last_name, email, phone_number, address)
       VALUES (?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone_number, address]
    );

    const personId = personResult.insertId;

    await conn.execute(
      `INSERT INTO employee (person_id, gender, salary, aadhaar_number)
       VALUES (?, ?, ?, ?)`,
      [personId, gender, salary, aadhaar_number]
    );

    if (role === 'customer_support') {
      await conn.execute(
        `INSERT INTO customer_support (person_id) VALUES (?)`,
        [personId]
      );
    }

    if (role === 'administrator') {
      await conn.execute(
        `INSERT INTO administrator (person_id) VALUES (?)`,
        [personId]
      );
    }

    await conn.execute(
      `INSERT INTO user_account (person_id, email, password_hash, role)
       VALUES (?, ?, ?, ?)`,
      [personId, email, passwordHash, role]
    );

    await conn.commit();

    return { person_id: personId, role };

  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

module.exports = {
  listEmployees,
  searchEmployees,
  createEmployee
};