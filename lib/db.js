import { query, getClient } from './database/aurora';

export async function createUser(email, name, hashedPassword, role) {
  try {
    const result = await query(
      `INSERT INTO users (email, name, password, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, email, name, role, created_at`,
      [email, name, hashedPassword, role]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function findUserByEmail(email) {
  try {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }
}

export async function findUserById(id) {
  try {
    const result = await query(
      'SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error finding user by id:', error);
    throw error;
  }
}

export async function logActivity(userId, action, entityType, entityId, changes = {}) {
  try {
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, changes, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [userId, action, entityType, entityId, JSON.stringify(changes)]
    );
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

export async function createNotification(userId, message, type, entityType, entityId) {
  try {
    await query(
      `INSERT INTO notifications (user_id, message, type, read, entity_type, entity_id, created_at)
       VALUES ($1, $2, $3, false, $4, $5, NOW())`,
      [userId, message, type, entityType, entityId]
    );
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

export { query, getClient };