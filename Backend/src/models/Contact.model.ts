import pool from '../config/database';

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export class ContactModel {
  static async create(messageData: CreateContactInput): Promise<ContactMessage> {
    try {
      const { name, email, subject, message } = messageData;
      
      const query = `
        INSERT INTO contact_messages (name, email, subject, message, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, 'pending', NOW(), NOW())
        RETURNING *
      `;
      
      const values = [name, email, subject, message];
      const result = await pool.query(query, values);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error in ContactModel.create:', error);
      throw error;
    }
  }
  
  static async findAll(limit: number = 100, offset: number = 0): Promise<ContactMessage[]> {
    try {
      const query = `
        SELECT * FROM contact_messages
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `;
      const result = await pool.query(query, [limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error in ContactModel.findAll:', error);
      throw error;
    }
  }
  
  static async findById(id: number): Promise<ContactMessage | null> {
    try {
      const query = 'SELECT * FROM contact_messages WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in ContactModel.findById:', error);
      throw error;
    }
  }
  
  static async updateStatus(id: number, status: string): Promise<ContactMessage | null> {
    try {
      const query = `
        UPDATE contact_messages
        SET status = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `;
      const result = await pool.query(query, [status, id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in ContactModel.updateStatus:', error);
      throw error;
    }
  }
  
  static async delete(id: number): Promise<boolean> {
    try {
      const query = 'DELETE FROM contact_messages WHERE id = $1';
      const result = await pool.query(query, [id]);
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Error in ContactModel.delete:', error);
      throw error;
    }
  }
}