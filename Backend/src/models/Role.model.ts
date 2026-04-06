import { query } from './index';
export interface Role {
  id: number;
  name: string;
}

export class RoleModel {
  static async findAll(): Promise<Role[]> {
    const result = await query('SELECT * FROM roles ORDER BY id');
    return result.rows;
  }

  static async findById(id: number): Promise<Role | null> {
    const result = await query('SELECT * FROM roles WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByName(name: string): Promise<Role | null> {
    const result = await query('SELECT * FROM roles WHERE name = $1', [name]);
    return result.rows[0] || null;
  }
}