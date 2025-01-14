const express = require('express');
const Ticket = require('../models/Ticket');
const router = express.Router();

// Create a new ticket
router.post('/create', async (req, res) => {
  try {
    console.log(req.body)
    const { title, question, rightAnswer, folderId, topicId, userId } = req.body;
    const ticketId = await Ticket.create({ title, question, rightAnswer, folderId, topicId, userId });
    res.status(201).json({ id: ticketId, title, question, rightAnswer, folderId, topicId, userId });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all tickets of user
router.post('/all', async (req, res) => {
  // console.log(req)
  try {
    const tickets = await Ticket.findAll(req.body.userId);
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific ticket by ID
router.post('/one', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.body.ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/oldest', async (req, res) => {
  // console.log(req)
  try {
    const ticket = await Ticket.findOldest({
      userId: req.body.userId, 
      folderId: req.body.folderId, 
      topicId: req.body.topicId,
      dateFrom: req.body.dateFrom, 
      dateTo: req.body.dateTo,
      quantity: req.body.quantity
    });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/deleteWithAnswers', async (req, res) => {
  // console.log(req)
  try {
    const result = await Ticket.deleteTicketAndAnswers(req.body.ticketId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;