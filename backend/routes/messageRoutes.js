const express = require("express");
const {
  allMessages,
  sendMessage,
  deleteMessageForEveryone,
  deleteMessageForMe,
  recordCallMessage,
} = require("../controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/delete-for-me").put(protect, deleteMessageForMe);
router.route("/call").post(protect, recordCallMessage);
router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);
router.route("/:messageId").delete(protect, deleteMessageForEveryone);

module.exports = router;