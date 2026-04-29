const Donation = require("../entity/Donation");

const createDonation = async (req, res) => {
  const { user_id, activity_id, amount } = req.body;

  try {
    if (!user_id || !activity_id || !amount) {
      return res.status(400).json({
        message: "User ID, activity ID and amount are required.",
      });
    }

    const donation = await Donation.create({
      user_id,
      activity_id,
      amount,
    });

    res.status(201).json({
      message: "Donation successful.",
      donation,
    });
  } catch (error) {
    console.error("Create donation error:", error);

    res.status(400).json({
      message: error.message || "Server error while creating donation.",
    });
  }
};

const getDonationsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const donations = await Donation.getByUser(userId);

    res.status(200).json({
      message: "Donations retrieved successfully.",
      donations,
    });
  } catch (error) {
    console.error("Get user donations error:", error);

    res.status(500).json({
      message: "Server error while retrieving donations.",
      error: error.message,
    });
  }
};

const getDonationsByActivity = async (req, res) => {
  const { activityId } = req.params;

  try {
    const donations = await Donation.getByActivity(activityId);

    res.status(200).json({
      message: "Activity donations retrieved successfully.",
      donations,
    });
  } catch (error) {
    console.error("Get activity donations error:", error);

    res.status(500).json({
      message: "Server error while retrieving activity donations.",
      error: error.message,
    });
  }
};

module.exports = {
  createDonation,
  getDonationsByUser,
  getDonationsByActivity,
};