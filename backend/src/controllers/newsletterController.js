const Newsletter = require('../models/Newsletter');
const asyncHandler = require('express-async-handler');

const subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const existing = await Newsletter.findOne({ email });
  if (existing) {
    if (existing.isActive) return res.status(400).json({ success: false, message: 'Already subscribed' });
    existing.isActive = true;
    await existing.save();
    return res.status(200).json({ success: true, message: 'Resubscribed successfully' });
  }
  await Newsletter.create({ email });
  res.status(201).json({ success: true, message: 'Subscribed successfully! Welcome to ShahVerse.' });
});

const unsubscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const subscriber = await Newsletter.findOne({ email });
  if (!subscriber) return res.status(404).json({ success: false, message: 'Email not found' });
  subscriber.isActive = false;
  await subscriber.save();
  res.status(200).json({ success: true, message: 'Unsubscribed successfully' });
});

const getSubscribers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const total = await Newsletter.countDocuments({ isActive: true });
  const subscribers = await Newsletter.find({ isActive: true })
    .sort('-subscribedAt')
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.status(200).json({ success: true, subscribers, total });
});

module.exports = { subscribe, unsubscribe, getSubscribers };
