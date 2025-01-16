const express = require('express');
const Schedule = require('../models/Schedule');
const router = express.Router();

router.post('/create', async (req, res) => {
  try {
    const scheduleId = await Schedule.create(req.body);
    res.json(scheduleId);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/update', async (req, res) => {
  try {
    const scheduleId = await Schedule.update(req.body);
    res.json(scheduleId);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/delete', async (req, res) => {
  try {
    const scheduleId = await Schedule.delete(req.body.id);
    res.json(scheduleId);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/findById', async (req, res) => {
  try {
    const scheduleId = await Schedule.findById(req.body.id);
    res.json(scheduleId);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/findByUserId', async (req, res) => {
  try {
    const schedules = await Schedule.findByUserId(req.body.userId);
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
