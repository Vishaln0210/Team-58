import pool from './config/db';
import bcrypt from 'bcryptjs';

export const seedData = async () => {
    try {
        console.log('🌱 Seeding database with demo data...');
    
        const [existingTables]: any = await pool.query(
          'SELECT COUNT(*) as count FROM restaurant_tables'
        );
    
        if (existingTables[0].count > 0) {
          console.log('✅ Tables already seeded, skipping...');
          return;
        }

    // Create demo users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Insert customers
    await pool.query(
      'INSERT INTO users (name, email, password, role, contact_info) VALUES (?, ?, ?, ?, ?)',
      ['John Doe', 'customer@test.com', hashedPassword, 'customer', '+1234567890']
    );

    await pool.query(
      'INSERT INTO users (name, email, password, role, contact_info) VALUES (?, ?, ?, ?, ?)',
      ['Jane Smith', 'customer2@test.com', hashedPassword, 'customer', '+1234567891']
    );

    await pool.query(
      'INSERT INTO users (name, email, password, role, contact_info) VALUES (?, ?, ?, ?, ?)',
      ['Bob Johnson', 'customer3@test.com', hashedPassword, 'customer', '+1234567892']
    );

    // Insert manager
    await pool.query(
      'INSERT INTO users (name, email, password, role, contact_info) VALUES (?, ?, ?, ?, ?)',
      ['Restaurant Manager', 'manager@test.com', hashedPassword, 'manager', '+1987654321']
    );

    // Insert sample tables
    const tables = [
      { table_number: '1', capacity: 2, type: 'regular', status: 'available' },
      { table_number: '2', capacity: 4, type: 'regular', status: 'occupied' },
      { table_number: '3', capacity: 4, type: 'regular', status: 'available' },
      { table_number: '4', capacity: 6, type: 'vip', status: 'reserved' },
      { table_number: '5', capacity: 2, type: 'regular', status: 'available' },
      { table_number: '6', capacity: 4, type: 'regular', status: 'available' },
      { table_number: '7', capacity: 6, type: 'vip', status: 'available' },
      { table_number: '8', capacity: 8, type: 'vip', status: 'occupied' },
      { table_number: '9', capacity: 2, type: 'regular', status: 'available' },
      { table_number: '10', capacity: 4, type: 'regular', status: 'available' },
    ];

    for (const table of tables) {
      await pool.query(
        'INSERT INTO restaurant_tables (table_number, capacity, type, status) VALUES (?, ?, ?, ?)',
        [table.table_number, table.capacity, table.type, table.status]
      );
    }

    // Add some occupied tables with customer names
    await pool.query(
      `UPDATE restaurant_tables SET current_customer_name = 'Alice Brown' WHERE table_number = '2'`
    );

    await pool.query(
      `UPDATE restaurant_tables SET current_customer_name = 'Charlie Wilson' WHERE table_number = '8'`
    );

    // Add a reservation
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(19, 0, 0, 0);

    await pool.query(
      `UPDATE restaurant_tables 
       SET current_customer_name = 'Emma Davis', 
           reservation_time = ?,
           current_customer_id = 1
       WHERE table_number = '4'`,
      [tomorrow]
    );

    // Add people to queue
    await pool.query(
      `UPDATE restaurant_tables 
       SET queue_position = 1, 
           current_customer_name = 'Michael Lee',
           current_customer_id = 2
       WHERE table_number = '5'`
    );

    await pool.query(
      `UPDATE restaurant_tables 
       SET queue_position = 2, 
           current_customer_name = 'Sarah Martinez',
           current_customer_id = 3
       WHERE table_number = '6'`
    );

    console.log('✅ Demo data seeded successfully!');
    console.log('');
    console.log('📝 Demo Accounts:');
    console.log('   Customer: customer@test.com / password123');
    console.log('   Manager:  manager@test.com / password123');
    console.log('');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
};