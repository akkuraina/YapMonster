const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
  updateUserProfile,
  getChatBackground,
  setChatBackground,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(protect, allUsers);
router.route("/").post(registerUser);
router.post("/login", authUser);
router.route("/profile").put(protect, updateUserProfile);
router.route("/chat-background/:chatId").get(protect, getChatBackground);
router.route("/chat-background/:chatId").put(protect, setChatBackground);

module.exports = router;