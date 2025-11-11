const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Reports route, admin-only" });
});

module.exports = router;


