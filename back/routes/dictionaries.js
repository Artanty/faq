const express = require('express');
const Dictionary = require('../models/Dictionary');
const router = express.Router();

router.post('/all', async (req, res) => {
  try {
    const dicts = await Dictionary.getAll();
    res.json(dicts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;