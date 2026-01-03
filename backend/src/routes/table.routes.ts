import express from 'express';
import pool from '../config/db';
import { authenticate, authorizeRole, AuthRequest } from '../middleware/auth.middleware';

const router = express.Router();

// Get all tables (public)
router.get('/', authenticate, async (req, res) => {
  try {
    const [tables] = await pool.query(`
      SELECT id, table_number, capacity, type, status, 
             current_customer_name, reservation_time, queue_position
      FROM restaurant_tables 
      ORDER BY CAST(table_number AS UNSIGNED)
    `);
    res.json({ success: true, data: tables });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get available tables
router.get('/available', authenticate, async (req, res) => {
  try {
    const [tables] = await pool.query(`
      SELECT id, table_number, capacity, type 
      FROM restaurant_tables 
      WHERE status = 'available'
      ORDER BY CAST(table_number AS UNSIGNED)
    `);
    res.json({ success: true, data: tables });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create table (manager only)
router.post('/', authenticate, authorizeRole('manager'), async (req, res) => {
  try {
    const { table_number, capacity, type } = req.body;

    if (!table_number || !capacity) {
      return res.status(400).json({ success: false, message: 'Table number and capacity required' });
    }

    const [result]: any = await pool.query(
      'INSERT INTO restaurant_tables (table_number, capacity, type) VALUES (?, ?, ?)',
      [table_number, capacity, type || 'regular']
    );

    res.status(201).json({
      success: true,
      message: 'Table created successfully',
      tableId: result.insertId
    });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Table number already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update table (manager only)
router.put('/:id', authenticate, authorizeRole('manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const { table_number, capacity, type, status } = req.body;

    const updates: string[] = [];
    const values: any[] = [];

    if (table_number) {
      updates.push('table_number = ?');
      values.push(table_number);
    }
    if (capacity) {
      updates.push('capacity = ?');
      values.push(capacity);
    }
    if (type) {
      updates.push('type = ?');
      values.push(type);
    }
    if (status) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(id);
    await pool.query(
      `UPDATE restaurant_tables SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({ success: true, message: 'Table updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete table (manager only)
router.delete('/:id', authenticate, authorizeRole('manager'), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM restaurant_tables WHERE id = ?', [id]);
    res.json({ success: true, message: 'Table deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Seat customer (manager only)
router.post('/:id/seat', authenticate, authorizeRole('manager'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { customer_name } = req.body;

    if (!customer_name) {
      return res.status(400).json({ success: false, message: 'Customer name required' });
    }

    await pool.query(
      `UPDATE restaurant_tables 
       SET status = 'occupied', 
           current_customer_id = ?, 
           current_customer_name = ?,
           queue_position = NULL,
           reservation_time = NULL
       WHERE id = ?`,
      [req.userId, customer_name, id]
    );

    res.json({ success: true, message: 'Customer seated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Vacate table (manager only)
router.post('/:id/vacate', authenticate, authorizeRole('manager'), async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `UPDATE restaurant_tables 
       SET status = 'available', 
           current_customer_id = NULL,
           current_customer_name = NULL,
           queue_position = NULL,
           reservation_time = NULL
       WHERE id = ?`,
      [id]
    );

    res.json({ success: true, message: 'Table vacated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;