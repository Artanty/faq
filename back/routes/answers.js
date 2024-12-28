const express = require('express');
const Answer = require('../models/Answer');
const Ticket = require('../models/Ticket');
const router = express.Router();

// Submit an answer for a ticket
router.post('/', async (req, res) => {
  try {
    const { ticketId, body, rate } = req.body;
    const answerId = await Answer.create({ ticketId, body, rate });

    // Update the ticket's answersQuantity and lastShownDate
    await Ticket.incrementAnswersQuantity(ticketId);
    await Ticket.updateLastShownDate(ticketId);

    res.status(201).json({ id: answerId, ticketId, body, rate });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all answers for a specific ticket
router.get('/ticket/:ticketId', async (req, res) => {
  try {
    const answers = await Answer.findByTicketId(req.params.ticketId);
    res.json(answers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;