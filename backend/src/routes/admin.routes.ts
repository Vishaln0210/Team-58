import express from 'express';
import pool from '../config/db';
import { authenticate, authorizeRole, AuthRequest } from '../middleware/auth.middleware';

const router = express.Router();

// Get all users (Admin only)
router.get('/users', authenticate, authorizeRole('admin'), async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT id, name, email, role, contact_info, created_at
      FROM users
      ORDER BY created_at DESC
    `);
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete user (Admin only)
router.delete('/users/:id', authenticate, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Don't allow deleting yourself
if (parseInt(id, 10) === (req as AuthRequest).userId) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get analytics data (Admin only)
router.get('/analytics', authenticate, authorizeRole('admin'), async (req, res) => {
  try {
    // Total users by role
    const [userStats]: any = await pool.query(`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
    `);

    // Table statistics
    const [tableStats]: any = await pool.query(`
      SELECT 
        COUNT(*) as total_tables,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied,
        SUM(CASE WHEN status = 'reserved' THEN 1 ELSE 0 END) as reserved,
        SUM(CASE WHEN type = 'vip' THEN 1 ELSE 0 END) as vip_tables,
        SUM(CASE WHEN type = 'regular' THEN 1 ELSE 0 END) as regular_tables
      FROM restaurant_tables
    `);

    // Queue statistics
    const [queueStats]: any = await pool.query(`
      SELECT COUNT(*) as queue_count
      FROM restaurant_tables
      WHERE queue_position IS NOT NULL
    `);

    // Reservation statistics
    const [reservationStats]: any = await pool.query(`
      SELECT COUNT(*) as reservation_count
      FROM restaurant_tables
      WHERE reservation_time IS NOT NULL
    `);

    // Recent activity
    const [recentTables]: any = await pool.query(`
      SELECT table_number, status, current_customer_name, updated_at
      FROM restaurant_tables
      ORDER BY updated_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        users: userStats,
        tables: tableStats[0],
        queue: queueStats[0],
        reservations: reservationStats[0],
        recentActivity: recentTables
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all reservations (Admin can see all)
router.get('/reservations', authenticate, authorizeRole('admin'), async (req, res) => {
  try {
    const [reservations] = await pool.query(`
      SELECT 
        rt.id,
        rt.table_number,
        rt.capacity,
        rt.type,
        rt.current_customer_name,
        rt.reservation_time,
        u.name as customer_name,
        u.email as customer_email,
        u.contact_info
      FROM restaurant_tables rt
      LEFT JOIN users u ON rt.current_customer_id = u.id
      WHERE rt.reservation_time IS NOT NULL
      ORDER BY rt.reservation_time ASC
    `);
    res.json({ success: true, data: reservations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all queue entries (Admin can see all)
router.get('/queue', authenticate, authorizeRole('admin'), async (req, res) => {
  try {
    const [queue] = await pool.query(`
      SELECT 
        rt.id,
        rt.table_number,
        rt.capacity,
        rt.type,
        rt.current_customer_name,
        rt.queue_position,
        u.email as customer_email,
        u.contact_info
      FROM restaurant_tables rt
      LEFT JOIN users u ON rt.current_customer_id = u.id
      WHERE rt.queue_position IS NOT NULL
      ORDER BY rt.queue_position ASC
    `);
    res.json({ success: true, data: queue });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;