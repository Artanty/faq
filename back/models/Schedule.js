const createPool = require('../core/db_connection')

class Schedule {
    static async create(schedule) {
        const pool = createPool();
        const connection = await pool.getConnection();
        const query = `
          INSERT INTO schedules 
          (userId, folderId, topicId, ticketId, dateFrom, dateTo, frequency, weekdays, active) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
          schedule.userId,
          schedule.folderId,
          schedule.topicId,
          schedule.ticketId,
          schedule.dateFrom,
          schedule.dateTo,
          schedule.frequency,
          schedule.weekdays,
          schedule.active,
        ];
        const [result] = await connection.query(query, values);
        connection.release();
        return result.insertId; // Return the ID of the newly created schedule
    }

    static async update(schedule) {
      const pool = createPool();
      const connection = await pool.getConnection();
      const query = `
        UPDATE schedules 
        SET 
          userId = ?, 
          folderId = ?, 
          topicId = ?, 
          ticketId = ?, 
          dateFrom = ?, 
          dateTo = ?, 
          frequency = ?, 
          weekdays = ?, 
          active = ? 
        WHERE id = ?
      `;
      const values = [
        schedule.userId,
        schedule.folderId,
        schedule.topicId,
        schedule.ticketId,
        schedule.dateFrom,
        schedule.dateTo,
        schedule.frequency,
        schedule.weekdays,
        schedule.active,
        schedule.id,
      ];
      const [result] = await connection.query(query, values);
      connection.release();
      return result.affectedRows; // Return the number of affected rows
    }

    static async delete(id) {
      const pool = createPool();
      const connection = await pool.getConnection();
      const query = 'DELETE FROM schedules WHERE id = ?';
      const [result] = await connection.query(query, [id]);
      connection.release();
      return result.affectedRows; // Return the number of affected rows
    }

    static async findById(id) {
      const pool = createPool();
      const connection = await pool.getConnection();
      const [rows] = await connection.query('SELECT * FROM schedules WHERE id = ?', [id]);
      console.log(rows)
      connection.release();
      return rows[0]; // todo return error?
    }

    static async findByUserId(userId) {
      const pool = createPool();
      const connection = await pool.getConnection();
      const [rows] = await connection.query('SELECT * FROM schedules WHERE userId = ?', [userId]);
      connection.release();
      return rows; // Return an array of schedules for the user
    }
}

module.exports = Schedule;


/**
 * userId:

References the users table.

Each schedule belongs to a specific user.

folderId, topicId, ticketId:

References the folders, topics, and tickets tables, respectively.

These fields are optional (DEFAULT NULL) because a schedule can be associated with a folder, topic, or ticket, or none of them.

dateFrom and dateTo:

Store the start and end dates as strings (e.g., '2023-10-01').

These fields are optional (DEFAULT NULL).

frequency:

Represents the frequency of the schedule in minutes (e.g., 60 for hourly).

weekdays:

A string of 7 characters (e.g., '1001001'), where each character represents a weekday (starting from Monday).

1 means the schedule is active on that day, and 0 means it’s inactive.

active:

A boolean flag to indicate whether the schedule is active (TRUE) or inactive (FALSE).

createdAt:

A timestamp to track when the schedule was created.
 */