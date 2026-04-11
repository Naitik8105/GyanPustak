const router = require('express').Router();
const pool = require('../config/db');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

router.post('/', protect, restrictTo('administrator', 'super_admin'), async (req, res) => {
  try {
    const { course_name, university_id } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO course (course_name, university_id) VALUES (?, ?)',
      [course_name, university_id]
    );
    res.status(201).json({ message: 'Course created', courseId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/offering', protect, restrictTo('administrator', 'super_admin'), async (req, res) => {
  try {
    const { course_id, department_id, instructor_id, academic_year, semester } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO course_offering (course_id, department_id, instructor_id, academic_year, semester)
       VALUES (?, ?, ?, ?, ?)`,
      [course_id, department_id, instructor_id, academic_year, semester]
    );
    res.status(201).json({ message: 'Course offering created', offeringId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/offering', protect, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT co.*, c.course_name, i.first_name AS instructor_first_name, i.last_name AS instructor_last_name
       FROM course_offering co
       JOIN course c ON c.course_id = co.course_id
       JOIN instructor i ON i.instructor_id = co.instructor_id
       ORDER BY co.offering_id DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
