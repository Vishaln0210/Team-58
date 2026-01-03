import express from 'express';
import pool from '../config/db';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = express.Router();

// Get all reservations
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    let query = `
      SELECT id, table_number, capacity, type, current_customer_name, 
             reservation_time, current_customer_id
      FROM restaurant_tables 
      WHERE reservation_time IS NOT NULL
      ORDER BY reservation_time ASC
    `;
    
    const params: any[] = [];
    
    // Customers see only their reservations
    if (req.userRole === 'customer') {
      query = `
        SELECT id, table_number, capacity, type, reservation_time
        FROM restaurant_tables 
        WHERE current_customer_id = ? AND reservation_time IS NOT NULL
        ORDER BY reservation_time ASC
      `;
      params.push(req.userId);
    }

    const [reservations] = await pool.query(query, params);
    res.json({ success: true, data: reservations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create reservation
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { table_id, customer_name, reservation_time, capacity } = req.body;

    if (!customer_name || !reservation_time) {
      return res.status(400).json({ 
        success: false, 
        message: 'Customer name and reservation time required' 
      });
    }

    // Validate future time
    const resTime = new Date(reservation_time);
    if (resTime <= new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Reservation must be in the future' 
      });
    }

    let targetTableId = table_id;

    // If no specific table, find available one
    if (!targetTableId) {
      const [tables]: any = await pool.query(
        `SELECT id FROM restaurant_tables 
         WHERE status = 'available' 
         AND capacity >= ? 
         AND reservation_time IS NULL
         ORDER BY capacity ASC 
         LIMIT 1`,
        [capacity || 2]
      );

      if (tables.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'No available tables for reservation' 
        });
      }
      targetTableId = tables[0].id;
    }

    // Check if table is already reserved at that time
    const [existing]: any = await pool.query(
      `SELECT id FROM restaurant_tables 
       WHERE id = ? 
       AND reservation_time IS NOT NULL 
       AND ABS(TIMESTAMPDIFF(HOUR, reservation_time, ?)) < 2`,
      [targetTableId, reservation_time]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Table already reserved at that time' 
      });
    }

    // Create reservation
    await pool.query(
      `UPDATE restaurant_tables 
       SET status = 'reserved',
           current_customer_id = ?,
           current_customer_name = ?,
           reservation_time = ?
       WHERE id = ?`,
      [req.userId, customer_name, reservation_time, targetTableId]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Reservation created successfully' 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cancel reservation
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Managers can cancel any, customers only their own
    let query = 'UPDATE restaurant_tables SET status = ?, reservation_time = NULL, current_customer_id = NULL, current_customer_name = NULL WHERE id = ?';
    const params: any[] = ['available', id];

    if (req.userRole === 'customer') {
      query += ' AND current_customer_id = ?';
      params.push(req.userId);
    }

    const [result]: any = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reservation not found or access denied' 
      });
    }

    res.json({ success: true, message: 'Reservation cancelled successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;