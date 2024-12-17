const express = require("express");
const router = express.Router();
const scrapperService = require("../controllers/ScrapperService");

// Route for sending invoice email
router.post("/scrap-link", (req, res) => {
  const { link } = req.body; // Extract link from the request body
  console.log(req.body);
  if (!link) {
    return res.status(400).json({ error: "Link is required" });
  }

  scrapperService
    .getAllText(link)
    .then((data) => res.json({ success: true, data }))
    .catch((error) =>
      res.status(500).json({ success: false, error: error.message })
    );
});

module.exports = router;
