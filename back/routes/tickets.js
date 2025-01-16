const express = require('express');
const Ticket = require('../models/Ticket');
const Schedule = require('../models/Schedule');
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

router.post('/isTicketsToAnswer', async (req, res) => {
  // console.log(req)
  try {
    // schedule FIND_BY_USR_ID
    const schedules = await Schedule.findByUserId(req.body.userId);

    const filtered = _filterSchedules(schedules, new Date())

    const result = await processSchedules(filtered)
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Function to process array of objects and make database requests
async function processSchedules(arrayOfSchedules) {
  try {
      const results = await Promise.all(
        arrayOfSchedules.map(async (schedule) => {
              
            const req = { userId: schedule.userId, quantity: 10 }

              if (schedule.topicId) {
                  req.topicId = schedule.topicId
              }
              if (schedule.folderId){
                  req.folderId = schedule.folderId
              }
              if (schedule.dateFrom && schedule.dateTo){
                  req.dateFrom = schedule.dateFrom
                  req.dateTo = schedule.dateTo
              }
              const res = await Ticket.findOldest(req);

              const filtered = _filterAnswered(res, schedule.frequency)

              return filtered
          })
      );

      const flattenedResults = results.flat();

      return flattenedResults;

  } catch (error) {
      console.error('Error in processObjects:', error);
      throw error; // Re-throw the error for further handling
  }
}

/**
     * Нужно отфильтровать билеты, которые были отвечены за период (шаг частоты, frequency)
     * то есть не показываем если:
     * now - lastShownDate < frequency
     * то есть показываем если:
     * now - lastShownDate > frequency
     */
function _filterAnswered (res, scheduleFrequency) {
  return res.filter(el => {
      const now = new Date()
      const ticketLastDate = new Date(el.lastShownDate)
      const diffInMs = (now.getTime() - ticketLastDate.getTime())
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const isAnswered = diffInMinutes < scheduleFrequency
      
      return !isAnswered
  })
}


/**
     * Отбираем все расписания, что в принципе могут быть сейчас сработать.
     */
function _filterSchedules (schedules, currentTime) {
  // schedules = schedules.map(el => {
  //     el.frequency = currentTime.getMinutes()
  //     return el
  // })
  return schedules.filter(schedule => {
      return schedule.active && 
      _isDayActive(schedule.weekdays, currentTime) === true &&
      _isFrequencyStep(schedule.frequency, currentTime) === true
  })
}

// Check if the current day is active in the weekdays pattern
function _isDayActive (scheduleWeekdays, currentTime) {
  const currentDay = currentTime.getDay(); // 0 (Sunday) to 6 (Saturday)
  const dayIndex = currentDay === 0 ? 6 : currentDay - 1
  return scheduleWeekdays.charAt(dayIndex) === '1';
}

function _isFrequencyStep(frequency, currentTime) {
  // Cap frequency at 4 months (approximately 4 * 30 * 24 * 60 = 172,800 minutes)
  const maxFrequency = 172800; // 4 months in minutes
  if (frequency > maxFrequency) {
      throw new Error("Frequency cannot exceed 4 months.");
  }
  if (currentTime.getMinutes() === 0) {
      return frequency === 60;
  }   
  return currentTime.getMinutes() % frequency === 0;
}

module.exports = router;