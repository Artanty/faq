const createPool = require('../core/db_connection')

class Dictionary {
  static async getAll() {
    const pool = createPool();
    const connection = await pool.getConnection();
  
    try {
      // Query to get all folders
      const [folders] = await connection.query('SELECT * FROM folders');
  
      // Query to get all topics
      const [topics] = await connection.query('SELECT * FROM topics');
  
      // Combine results into the desired format
      const result = {
        folders,
        topics,
      };
  
      return result;
    } finally {
      // Release the connection back to the pool
      connection.release();
    }
  }
}

module.exports = Dictionary;