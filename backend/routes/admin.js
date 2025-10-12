const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Admin route, accessible only by admin role" });
});

module.exports = router;
