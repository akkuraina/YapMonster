const asyncHandler = require("express-async-handler");
const { AccessToken } = require("livekit-server-sdk");
const Chat = require("../models/chatModel");

/**
 * @description Generate a LiveKit room access token for a specific chat
 * @route POST /api/livekit/token
 * @access Protected
 */
const getToken = asyncHandler(async (req, res) => {
  const { chatId } = req.body;

  if (!chatId) {
    res.status(400);
    throw new Error("Chat ID is required to generate a video token");
  }

  // Verify that the user is a participant in the chat
  const chat = await Chat.findOne({
    _id: chatId,
    users: req.user._id,
  }).populate("users", "-password");

  if (!chat) {
    res.status(404);
    throw new Error("Chat not found or you are not authorized to join this call");
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const livekitUrl = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !livekitUrl) {
    res.status(500);
    throw new Error(
      "LiveKit is not properly configured on the server. Please set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET in backend/.env"
    );
  }

  const identity = req.user._id.toString();
  const participantName = req.user.name || "User";

  // Create an AccessToken with the user's identity
  const at = new AccessToken(apiKey, apiSecret, {
    identity: identity,
    name: participantName,
    metadata: JSON.stringify({
      userId: req.user._id,
      name: req.user.name,
      pic: req.user.pic,
      email: req.user.email,
    }),
    ttl: "4h", // 4 hours call duration
  });

  // Grant permissions to join the room and publish/subscribe
  at.addGrant({
    roomJoin: true,
    room: chatId.toString(),
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  const token = await at.toJwt();

  res.status(200).json({
    token,
    serverUrl: livekitUrl,
    chatId,
    roomName: chat.isGroupChat ? chat.chatName : "Direct Video Call",
    isGroupChat: chat.isGroupChat,
  });
});

module.exports = { getToken };
