const express = require("express");
const router = express.Router();

const CreateDonation = require("../controller/Donee_CreateDonationController.js");
const ViewDonation = require("../controller/Donee_ViewDonationHistoryController.js");
const SearchDonation = require("../controller/Donee_SearchDonationHistoryController.js");

// CREATE
router.post("/", async (req, res) => {
  res.json(await CreateDonation.createDonation(req.body));
});

// VIEW HISTORY
router.get("/:user_id", async (req, res) => {
  res.json(await ViewDonation.viewHistory(req.params.user_id));
});

// SEARCH HISTORY
router.get("/:user_id/search/:keyword", async (req, res) => {
  res.json(await SearchDonation.searchHistory(req.params.user_id, req.params.keyword));
});

module.exports = router;