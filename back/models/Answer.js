const createPool = require('../core/db_connection')

class Answer {
  static async create({ ticketId, body, rate, userId }) {
    const pool = createPool()
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO answers (ticketId, body, rate, userId) VALUES (?, ?, ?, ?)',
      [ticketId, body, rate, userId]
    );
    connection.release();
    return result.insertId;
  }

  static async findByTicketId(ticketId) {
    const pool = createPool()
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM answers WHERE ticketId = ?', [ticketId]);
    connection.release();
    return rows;
  }
}

module.exports = Answer;