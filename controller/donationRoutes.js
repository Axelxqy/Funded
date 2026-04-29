const express = require("express");
const router = express.Router();

const {
  createDonation,
  getDonationsByUser,
  getDonationsByActivity,
} = require("./donationController");

router.post("/", createDonation);
router.get("/user/:userId", getDonationsByUser);
router.get("/activity/:activityId", getDonationsByActivity);

module.exports = router;