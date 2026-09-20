const express = require("express");
const User = require('../models/user');
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get(
  "/",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 });

      res.json({
        users
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Could not fetch users"
      });
    }
  }
);


router.patch(
  "/:id/role",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const { role } = req.body;

      if (!["user", "analyst", "admin"].includes(role)) {
        return res.status(400).json({
          message: "Invalid role"
        });
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        {
          new: true
        }
      ).select("-password");

      if (!user) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      res.json({
        message: "User role updated",
        user
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Could not update user role"
      });
    }
  }
);

module.exports = router;