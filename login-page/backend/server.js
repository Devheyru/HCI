const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const pool = require('./db');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/api/status', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    return res.status(200).json({
      success: true,
      status: 'online',
      message: 'Student Authentication API is running',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 'offline',
      message: 'Database connection failed'
    });
  }
});

app.get('/api/students/:student_id', async (req, res) => {
  try {
    const { student_id } = req.params;
    const queryText = 'SELECT id, student_id, full_name FROM students WHERE student_id = $1';
    const result = await pool.query(queryText, [student_id.trim()]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    return res.status(200).json({
      success: true,
      student: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching student:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { student_id, password } = req.body;

    if (!student_id || !password || student_id.trim() === '' || password.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Student ID and password are required'
      });
    }

    const cleanStudentId = student_id.trim();

    const queryText = 'SELECT id, student_id, password, full_name FROM students WHERE student_id = $1';
    const queryParams = [cleanStudentId];

    const result = await pool.query(queryText, queryParams);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Student ID or Password'
      });
    }

    const student = result.rows[0];

    const isPasswordValid = await bcrypt.compare(password, student.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Student ID or Password'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      student: {
        student_id: student.student_id,
        full_name: student.full_name
      }
    });

  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`Student Authentication Server is running on port ${PORT}`);
});
