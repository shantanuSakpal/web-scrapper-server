import express, { Router, Request, Response } from "express";
const router: Router = Router();
import getAllText from "../controllers/getAllText";

// Route for sending invoice email
//@ts-ignore
router.post("/scrap-link", async (req, res) => {
  const { link } = req.body;
  console.log(req.body);

  if (!link) {
    return res.status(400).json({
      success: false,
      error: "Link is required",
    });
  }

  try {
    const data = await getAllText(link);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

export default router; // instead of module.exports = router
