const createPool = require('../core/db_connection')

class Ticket {
  static async create({ title, question, rightAnswer }) {
    const pool = createPool()
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO tickets (title, question, rightAnswer) VALUES (?, ?, ?)',
      [title, question, rightAnswer]
    );
    connection.release();
    return result.insertId;
  }

  static async findAll() {
    const pool = createPool()
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM tickets');
    connection.release();
    return rows;
  }

  static async findById(id) {
    const pool = createPool()
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM tickets WHERE id = ?', [id]);
    connection.release();
    return rows[0];
  }

  static async updateLastShownDate(id) {
    const pool = createPool()
    const connection = await pool.getConnection();
    await connection.query('UPDATE tickets SET lastShownDate = NOW() WHERE id = ?', [id]);
    connection.release();
  }

  static async incrementAnswersQuantity(id) {
    const pool = createPool()
    const connection = await pool.getConnection();
    await connection.query('UPDATE tickets SET answersQuantity = answersQuantity + 1 WHERE id = ?', [id]);
    connection.release();
  }
}

module.exports = Ticket;