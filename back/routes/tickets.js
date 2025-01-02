const express = require('express');
const Ticket = require('../models/Ticket');
const router = express.Router();

// Create a new ticket
router.post('/', async (req, res) => {
  try {
    const { title, question, rightAnswer } = req.body;
    const ticketId = await Ticket.create({ title, question, rightAnswer });
    res.status(201).json({ id: ticketId, title, question, rightAnswer });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all tickets of user
router.get('/all', async (req, res) => {
  console.log(req)
  try {
    const tickets = await Ticket.findAll(req.query.userId);
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific ticket by ID
router.get('/one', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.query.userId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// folder
// topic
router.get('/oldest', async (req, res) => {
  // console.log(req)
  try {
    const ticket = await Ticket.findOldest({
      userId: req.query.userId, 
      folderId: req.query.folderId, 
      topicId: req.query.topicId,
      quantity: req.query.quantity || 1
    });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;