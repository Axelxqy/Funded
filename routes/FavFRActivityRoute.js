const express = require("express");
const router = express.Router();

const SaveFav = require("../controller/Donee_SaveFRActivityController.js");
const ViewFav = require("../controller/Donee_ViewFavFRActivityController.js");
const SearchFav = require("../controller/Donee_SearchFavFRActivityController.js");

// SAVE
router.post("/", async (req, res) => {
  res.json(await SaveFav.saveFRA(req.body));
});

// VIEW
router.get("/:user_id", async (req, res) => {
  res.json(await ViewFav.viewFav(req.params.user_id));
});

// SEARCH
router.get("/:user_id/search/:name", async (req, res) => {
  res.json(await SearchFav.searchFav(req.params.user_id, req.params.name));
});

module.exports = router;