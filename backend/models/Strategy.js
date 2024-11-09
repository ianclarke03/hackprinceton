const mongoose = require("mongoose");

const StrategySchema = new mongoose.Schema({
  title: String,
  type: String,
  description: String,
  youtubeVideos: [String],
  historicalData: [Number],
  riskLevel: String,
  returns: {
    oneYear: Number,
    fiveYear: Number,
    tenYear: Number,
  },
});

module.exports = mongoose.model("Strategy", StrategySchema);
