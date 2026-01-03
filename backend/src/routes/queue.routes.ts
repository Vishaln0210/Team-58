import express from 'express';
import pool from '../config/db';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = express.Router();

// Get queue
router.get('/', authenticate, async (req, res) => {
  try {
    const [queue] = await pool.query(`
      SELECT id, table_number, capacity, type, current_customer_name, queue_position
      FROM restaurant_tables 
      WHERE queue_position IS NOT NULL
      ORDER BY queue_position ASC
    `);
    res.json({ success: true, data: queue });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Join queue
router.post('/join', authenticate, async (req: AuthRequest, res) => {
  try {
    const { table_id, customer_name, capacity } = req.body;

    if (!customer_name) {
      return res.status(400).json({ success: false, message: 'Customer name required' });
    }

    // Get max queue position
    const [maxPos]: any = await pool.query(
      'SELECT COALESCE(MAX(queue_position), 0) as max_pos FROM restaurant_tables'
    );
    const newPosition = maxPos[0].max_pos + 1;

    if (table_id) {
      // Join queue for specific table
      await pool.query(
        `UPDATE restaurant_tables 
         SET queue_position = ?, 
             current_customer_id = ?, 
             current_customer_name = ?
         WHERE id = ? AND status = 'available'`,
        [newPosition, req.userId, customer_name, table_id]
      );
    } else {
      // Join general queue - find available table with requested capacity
      const [tables]: any = await pool.query(
        `SELECT id FROM restaurant_tables 
         WHERE status = 'available' 
         AND capacity >= ? 
         AND queue_position IS NULL
         ORDER BY capacity ASC 
         LIMIT 1`,
        [capacity || 2]
      );

      if (tables.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'No available tables for requested capacity' 
        });
      }

      await pool.query(
        `UPDATE restaurant_tables 
         SET queue_position = ?, 
             current_customer_id = ?, 
             current_customer_name = ?
         WHERE id = ?`,
        [newPosition, req.userId, customer_name, tables[0].id]
      );
    }

    res.json({ 
      success: true, 
      message: 'Joined queue successfully',
      position: newPosition
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get my queue position
router.get('/my-position', authenticate, async (req: AuthRequest, res) => {
  try {
    const [result]: any = await pool.query(
      `SELECT id, table_number, capacity, queue_position, type
       FROM restaurant_tables 
       WHERE current_customer_id = ? AND queue_position IS NOT NULL`,
      [req.userId]
    );

    if (result.length === 0) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: result[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Leave queue
router.delete('/leave', authenticate, async (req: AuthRequest, res) => {
  try {
    await pool.query(
      `UPDATE restaurant_tables 
       SET queue_position = NULL, 
           current_customer_id = NULL,
           current_customer_name = NULL
       WHERE current_customer_id = ? AND queue_position IS NOT NULL`,
      [req.userId]
    );

    res.json({ success: true, message: 'Left queue successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;