const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getToken } = require("../controllers/livekitControllers");

const router = express.Router();

router.route("/token").post(protect, getToken);

module.exports = router;
