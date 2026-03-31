import pool from '../config/database';
export interface Notification {
  id: number;
  user_id: number;
  type: 'review' | 'reply' | 'like' | 'follow' | 'book' | 'achievement' | 'system';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  metadata: any;
  created_at: Date;
}

export interface CreateNotificationInput {
  user_id: number;
  type: Notification['type'];
  title: string;
  message: string;
  link?: string;
  metadata?: any;
}

export class NotificationModel {
  static async create(data: CreateNotificationInput): Promise<Notification> {
    const query = `
      INSERT INTO notifications (user_id, type, title, message, link, metadata, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;
    const values = [data.user_id, data.type, data.title, data.message, data.link, data.metadata];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUser(userId: number, limit: number = 50): Promise<Notification[]> {
    const query = `
      SELECT * FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }

  static async markAsRead(notificationId: number): Promise<void> {
    const query = `UPDATE notifications SET read = true WHERE id = $1`;
    await pool.query(query, [notificationId]);
  }

  static async markAllAsRead(userId: number): Promise<void> {
    const query = `UPDATE notifications SET read = true WHERE user_id = $1 AND read = false`;
    await pool.query(query, [userId]);
  }

  static async getUnreadCount(userId: number): Promise<number> {
    const query = `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read = false`;
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }
}