const createPool = require('../core/db_connection')

class Ticket {
//   -- Define variables
// SET @folder = 'Math';
// SET @topic = 'Algebra';
// SET @quantity = 5;

// -- Insert a new ticket
// INSERT INTO tickets (title, question, rightAnswer, folder, topic, answersQuantity)
// VALUES ('Sample Title', 'What is 2 + 2?', '4', @folder, @topic, @quantity);
  static async create({ title, question, rightAnswer, folderId, topicId, userId }) {
    console.log({ title, question, rightAnswer, folderId, topicId, userId })
    const pool = createPool()
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO tickets (title, question, rightAnswer, folderId, topicId, userId) VALUES (?, ?, ?, ?, ?, ?)',
      [title, question, rightAnswer, folderId, topicId, userId]
    );
    connection.release();
    return result.insertId;
  }

  static async findAll(userId) {
    const pool = createPool();
    const connection = await pool.getConnection();
  
    try {
      // Define the query with JOINs and a WHERE clause for userId
      const query = `
        SELECT 
          t.id AS ticketId,
          t.title,
          t.question,
          t.rightAnswer,
          f.name AS folderName,
          tp.name AS topicName,
          u.username AS user
        FROM tickets t
        JOIN folders f ON t.folderId = f.id
        JOIN topics tp ON t.topicId = tp.id
        JOIN users u ON t.userId = u.id
        WHERE u.id = ?;
      `;
  
      // Execute the query with userId as a parameter
      const [rows] = await connection.query(query, [userId]);
      return rows;
    } catch (error) {
      // Handle any errors
      throw new Error(`Error in models/Ticket.findAll(): ${error.message}`);
    } finally {
      // Always release the connection
      connection.release();
    }
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
  // data:
  // userId: number
  // folderId: number
  // topicId: number
  // quantity: number
  static async findOldest(data) {
    const { userId, folderId, topicId, quantity } = data;
  
    // Validate required fields
    if (!userId || !quantity) {
      throw new Error('Missing required input params: userId and quantity in models/Ticket.findOldest()');
    }
  
    // Build the query dynamically based on provided parameters
    let query = `
      SELECT * 
      FROM tickets 
      WHERE userId = ?
    `;
  
    const queryVars = [userId];
  
    // Add folderId to the query if provided
    if (folderId) {
      query += ' AND folderId = ?';
      queryVars.push(folderId);
    }
  
    // Add topicId to the query if provided
    if (topicId) {
      query += ' AND topicId = ?';
      queryVars.push(topicId);
    }
  
    // Add sorting and limit
    query += ' ORDER BY lastShownDate ASC, answersQuantity ASC LIMIT ?';
    queryVars.push(+quantity);
  
    const pool = createPool();
    const connection = await pool.getConnection();
    try {
      // Execute the query
      const [rows] = await connection.query(query, queryVars);
      return rows;
    } catch (error) {
      // Handle any errors
      throw new Error(`db Error in models/Ticket.findOldest(): ${error.message}`);
    } finally {
      // Always release the connection
      connection.release();
    }
  }
}

module.exports = Ticket;