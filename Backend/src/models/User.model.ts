import { query } from './index';
import bcrypt from 'bcrypt';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  roleId: number;
  created_at?: Date;
  updated_at?: Date;
}
export interface UserWithRole extends User {
  review_count?: number;
  role_name?: string;
}

export class UserModel {
  static async findAll(): Promise<UserWithRole[]> {
    const result = await query(`
      SELECT u.id, u.name, u.email, u."roleId", u.created_at, u.updated_at,
             r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u."roleId" = r.id
      ORDER BY u.id
    `);
    return result.rows;
  }

  static async findById(id: number): Promise<UserWithRole | null> {
    const result = await query(`
      SELECT u.id, u.name, u.email, u."roleId", u.created_at, u.updated_at,
             r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u."roleId" = r.id
      WHERE u.id = $1
    `, [id]);
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      `SELECT id, name, email, password, "roleId", created_at, updated_at
       FROM users WHERE email = $1`,
      [email]
    );
    return result.rows[0] || null;
  }

  static async create(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const result = await query(
      `INSERT INTO users (name, email, password, "roleId", created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, name, email, "roleId", created_at, updated_at`,
      [user.name, user.email, hashedPassword, user.roleId || 2]
    );
    return result.rows[0];
  }

  static async update(id: number, updates: Partial<User>): Promise<User | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.email !== undefined) {
      fields.push(`email = $${paramCount++}`);
      values.push(updates.email);
    }
    if (updates.password !== undefined) {
      fields.push(`password = $${paramCount++}`);
      values.push(await bcrypt.hash(updates.password, 10));
    }
    if (updates.roleId !== undefined) {
      fields.push(`"roleId" = $${paramCount++}`);
      values.push(updates.roleId);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount}
       RETURNING id, name, email, "roleId", created_at, updated_at`,
      values
    );
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM users WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  static async getUsersWithReviewCounts(): Promise<any[]> {
    const result = await query(`
      SELECT u.id, u.name, u.email, r.name as role, COUNT(rev.id) as review_count
      FROM users u
      LEFT JOIN roles r ON u."roleId" = r.id
      LEFT JOIN reviews rev ON u.id = rev.user_id
      GROUP BY u.id, u.name, u.email, r.name
    `);
    return result.rows;
  }
}