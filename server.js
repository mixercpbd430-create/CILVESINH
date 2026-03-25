const express = require('express');
const path = require('path');
const cors = require('cors');
const { pool, initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Get all cleaning records for today (status overview)
app.get('/api/status', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await pool.query(
      `SELECT DISTINCT ON (equipment_id) 
        equipment_id, worker_name, cleaned_at 
      FROM cleaning_records 
      WHERE cleaned_at >= $1 
      ORDER BY equipment_id, cleaned_at DESC`,
      [today.toISOString()]
    );
    
    const statusMap = {};
    result.rows.forEach(row => {
      statusMap[row.equipment_id] = {
        workerName: row.worker_name,
        cleanedAt: row.cleaned_at
      };
    });
    
    res.json(statusMap);
  } catch (err) {
    console.error('Error fetching status:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get cleaning records for a specific equipment
app.get('/api/records/:equipmentId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, equipment_id, worker_name, photo_data, notes, cleaned_at 
      FROM cleaning_records 
      WHERE equipment_id = $1 
      ORDER BY cleaned_at DESC 
      LIMIT 20`,
      [req.params.equipmentId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching records:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new cleaning record
app.post('/api/records', async (req, res) => {
  try {
    const { equipmentId, workerName, photoData, notes } = req.body;
    
    if (!equipmentId || !workerName) {
      return res.status(400).json({ error: 'equipmentId and workerName are required' });
    }
    
    const result = await pool.query(
      `INSERT INTO cleaning_records (equipment_id, worker_name, photo_data, notes, cleaned_at) 
      VALUES ($1, $2, $3, $4, NOW()) 
      RETURNING *`,
      [equipmentId, workerName, photoData || null, notes || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a cleaning record
app.delete('/api/records/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM cleaning_records WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all custom equipment
app.get('/api/equipment', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM custom_equipment ORDER BY created_at ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching equipment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new custom equipment
app.post('/api/equipment', async (req, res) => {
  try {
    const { name, code, category, instructions } = req.body;
    
    if (!name || !code || !category) {
      return res.status(400).json({ error: 'name, code, and category are required' });
    }
    
    const equipmentId = name.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + code.replace(/[^0-9.]/g, '');
    
    const result = await pool.query(
      `INSERT INTO custom_equipment (equipment_id, name, code, category, instructions)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [equipmentId, name, code, category, JSON.stringify(instructions || [])]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Equipment already exists' });
    }
    console.error('Error adding equipment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete custom equipment
app.delete('/api/equipment/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM custom_equipment WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting equipment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Catch-all: serve index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
