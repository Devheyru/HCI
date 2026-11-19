const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const pool = require('./db');
const supabase = require('./supabase');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/api/status', async (req, res) => {
  let dbStatus = 'disconnected';
  let provider = 'none';

  if (supabase) {
    try {
      const { error } = await supabase.from('students').select('id').limit(1);
      if (!error) {
        dbStatus = 'connected';
        provider = 'supabase';
      }
    } catch (e) {
      dbStatus = 'error';
    }
  }

  if (dbStatus !== 'connected') {
    try {
      await pool.query('SELECT 1');
      dbStatus = 'connected';
      provider = 'postgresql';
    } catch (e) {
      dbStatus = 'disconnected';
    }
  }

  return res.status(200).json({
    success: dbStatus === 'connected',
    status: dbStatus === 'connected' ? 'online' : 'degraded',
    provider: provider,
    message: dbStatus === 'connected' ? `Connected to ${provider}` : 'Database unavailable'
  });
});

app.get('/api/students/:student_id', async (req, res) => {
  try {
    const { student_id } = req.params;
    const cleanStudentId = student_id.trim();

    if (supabase) {
      const { data, error } = await supabase
        .from('students')
        .select('id, student_id, full_name')
        .eq('student_id', cleanStudentId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      return res.status(200).json({
        success: true,
        student: data
      });
    }

    const queryText = 'SELECT id, student_id, full_name FROM students WHERE student_id = $1';
    const result = await pool.query(queryText, [cleanStudentId]);

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

app.post('/api/register', async (req, res) => {
  try {
    const { student_id, full_name, password } = req.body;

    if (!student_id || !full_name || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const cleanStudentId = student_id.trim();
    const cleanFullName = full_name.trim();

    if (cleanStudentId === '' || cleanFullName === '' || password.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    if (supabase) {
      const { data: existing } = await supabase
        .from('students')
        .select('id')
        .eq('student_id', cleanStudentId)
        .maybeSingle();

      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Student ID is already registered'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const { data: inserted, error: insertError } = await supabase
        .from('students')
        .insert([
          {
            student_id: cleanStudentId,
            full_name: cleanFullName,
            password: hashedPassword
          }
        ])
        .select('id, student_id, full_name')
        .single();

      if (insertError) {
        throw insertError;
      }

      return res.status(201).json({
        success: true,
        message: 'Registration successful! You can now log in.',
        student: inserted
      });
    }

    const checkResult = await pool.query('SELECT id FROM students WHERE student_id = $1', [cleanStudentId]);
    if (checkResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Student ID is already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertQuery = 'INSERT INTO students (student_id, password, full_name) VALUES ($1, $2, $3) RETURNING id, student_id, full_name';
    const insertResult = await pool.query(insertQuery, [cleanStudentId, hashedPassword, cleanFullName]);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! You can now log in.',
      student: insertResult.rows[0]
    });

  } catch (error) {
    console.error('Registration error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.'
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

    let student = null;

    if (supabase) {
      const { data, error } = await supabase
        .from('students')
        .select('id, student_id, password, full_name')
        .eq('student_id', cleanStudentId)
        .maybeSingle();

      if (!error && data) {
        student = data;
      }
    }

    if (!student) {
      const queryText = 'SELECT id, student_id, password, full_name FROM students WHERE student_id = $1';
      const result = await pool.query(queryText, [cleanStudentId]);
      if (result.rows.length > 0) {
        student = result.rows[0];
      }
    }

    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Student ID or Password'
      });
    }

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

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/register.html'));
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`Student Authentication Server is running on port ${PORT}`);
});
