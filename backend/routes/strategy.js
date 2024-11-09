const express = require("express");
const axios = require("axios");
const Strategy = require("../models/Strategy");
const router = express.Router();

// Get all strategies
router.get("/", async (req, res) => {
  try {
    const strategies = await Strategy.find();
    res.json(strategies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get strategy details
router.get("/:id", async (req, res) => {
  try {
    const strategy = await Strategy.findById(req.params.id);
    if (!strategy) return res.status(404).json({ message: "Strategy not found" });
    res.json(strategy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get educational videos
router.get("/:id/videos", async (req, res) => {
  try {
    const strategy = await Strategy.findById(req.params.id);
    const query = `${strategy.title} investment strategy`;
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&key=${process.env.YOUTUBE_API_KEY}&maxResults=3`);
    const videos = response.data.items.map(item => ({
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
