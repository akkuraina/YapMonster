import React, { useState, useRef, useEffect } from "react";
import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import { Box, Text, Flex } from "@chakra-ui/layout";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Icon,
  Button,
} from "@chakra-ui/react";
import { FiMoreVertical } from "react-icons/fi";
import { FaReply, FaVideo, FaVideoSlash, FaPhoneSlash } from "react-icons/fa";
import axios from "axios";
import { ChatState } from "../Context/ChatProvider";
import config from "../config/config";

// ─── Format Time (e.g., "8:45 PM") ───────────────────────────────────────────
const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// ─── Format Date Divider (e.g., "Today", "Yesterday", "Sep 13, 2026") ────────
const formatDateDivider = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return "Today";
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  // Same year: e.g. "Sat, Sep 13"
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  // Different year: e.g. "Sep 13, 2025"
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// ─── Format Call Duration (e.g., "2m 15s" or "45s") ─────────────────────────
const formatCallDuration = (seconds) => {
  if (!seconds || seconds <= 0) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0 && secs > 0) return `${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m`;
  return `${secs}s`;
};

const ScrollableChat = ({ messages, socket, setReplyingTo, onStartVideoCall }) => {
  const { user, selectedChat } = ChatState();
  const [localMessages, setLocalMessages] = useState(messages);
  const chatContainerRef = useRef(null);

  // Update localMessages when messages prop changes
  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [localMessages]);

  const handleDeleteForMe = async (messageId) => {
    try {
      await axios.put(
        `${config.BACKEND_URL}/api/message/delete-for-me`,
        { messageId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setLocalMessages((prev) => prev.filter((m) => m._id !== messageId));
    } catch (err) {
      console.error("Failed to delete message for me", err);
    }
  };

  const handleDeleteForEveryone = async (messageId) => {
    try {
      await axios.delete(
        `${config.BACKEND_URL}/api/message/${messageId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setLocalMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, deletedForEveryone: true } : m
        )
      );
      if (socket && selectedChat) {
        socket.emit("delete message", {
          chatId: selectedChat._id,
          messageId,
          forEveryone: true,
        });
      }
    } catch (err) {
      console.error("Failed to delete message for everyone", err);
    }
  };

  return (
    <Box
      ref={chatContainerRef}
      display="flex"
      flexDirection="column"
      gap="10px"
      px={{ base: 1, sm: 2 }}
      py={2}
      height="100%"
      flex="1"
      minH="0"
      overflowY="auto"
      overflowX="hidden"
      css={{
        "&::-webkit-scrollbar": { width: "0px !important" },
        scrollbarWidth: "none !important",
      }}
    >
      {localMessages &&
        localMessages.map((m, index) => {
          // Hide if deleted for me
          if (m.deletedFor && m.deletedFor.includes(user._id)) return null;

          const isSentByMe = m.sender?._id === user._id;

          // Check if we need to show a date divider
          const prevMessage = index > 0 ? localMessages[index - 1] : null;
          const showDateDivider =
            !prevMessage ||
            new Date(m.createdAt).toDateString() !==
              new Date(prevMessage.createdAt).toDateString();

          // ─── Call History Card ───────────────────────────────────────────────
          if (m.messageType === "call") {
            const callInfo = m.callInfo || {};
            const isMissed = callInfo.status === "missed";
            const isDeclined = callInfo.status === "declined";
            const isCompleted = callInfo.status === "completed";
            const durationStr = formatCallDuration(callInfo.duration);

            let statusLabel = "Video Call";
            let callIcon = FaVideo;
            let iconBg = "rgba(139, 92, 246, 0.2)";
            let iconColor = "#A78BFA";

            if (isMissed) {
              statusLabel = isSentByMe ? "Outgoing Call (No Answer)" : "Missed Video Call";
              callIcon = FaVideoSlash;
              iconBg = "rgba(239, 68, 68, 0.2)";
              iconColor = "#F87171";
            } else if (isDeclined) {
              statusLabel = isSentByMe ? "Call Declined" : "Declined Video Call";
              callIcon = FaPhoneSlash;
              iconBg = "rgba(249, 115, 22, 0.2)";
              iconColor = "#FB923C";
            } else if (isCompleted) {
              statusLabel = durationStr ? `Video Call • ${durationStr}` : "Video Call";
              callIcon = FaVideo;
              iconBg = "rgba(16, 185, 129, 0.2)";
              iconColor = "#34D399";
            }

            return (
              <React.Fragment key={m._id}>
                {showDateDivider && (
                  <Flex justify="center" my={2.5} w="100%">
                    <Box
                      bg="rgba(15, 23, 42, 0.75)"
                      color="rgba(255, 255, 255, 0.85)"
                      backdropFilter="blur(12px)"
                      border="1px solid rgba(255, 255, 255, 0.1)"
                      px={3.5}
                      py={1}
                      borderRadius="full"
                      fontSize="2xs"
                      fontWeight="700"
                      letterSpacing="0.03em"
                      boxShadow="0 4px 12px rgba(0,0,0,0.25)"
                    >
                      {formatDateDivider(m.createdAt)}
                    </Box>
                  </Flex>
                )}

                <Flex justify="center" w="100%" my={1.5} role="group">
                  <Flex
                    align="center"
                    justify="space-between"
                    gap={4}
                    bg="rgba(15, 23, 42, 0.85)"
                    border="1px solid"
                    borderColor={
                      isMissed
                        ? "rgba(239, 68, 68, 0.3)"
                        : isDeclined
                        ? "rgba(249, 115, 22, 0.3)"
                        : "rgba(139, 92, 246, 0.25)"
                    }
                    backdropFilter="blur(16px)"
                    px={4}
                    py={2.5}
                    borderRadius="16px"
                    boxShadow="0 8px 24px rgba(0, 0, 0, 0.3)"
                    maxW={{ base: "92%", sm: "400px" }}
                    w="100%"
                    transition="all 0.2s ease"
                    _hover={{ transform: "translateY(-1px)", boxShadow: "0 10px 28px rgba(0, 0, 0, 0.4)" }}
                  >
                    <Flex align="center" gap={3} minW="0">
                      <Flex
                        align="center"
                        justify="center"
                        w="36px"
                        h="36px"
                        borderRadius="full"
                        bg={iconBg}
                        flexShrink={0}
                      >
                        <Icon as={callIcon} color={iconColor} boxSize={4} />
                      </Flex>

                      <Box minW="0">
                        <Flex align="center" gap={2}>
                          <Text
                            fontSize="xs"
                            fontWeight="700"
                            color="white"
                            noOfLines={1}
                          >
                            {statusLabel}
                          </Text>
                        </Flex>
                        <Flex align="center" gap={2} mt={0.5}>
                          <Text fontSize="2xs" color="gray.400" fontWeight="500">
                            {isSentByMe ? "Outgoing" : "Incoming"}
                          </Text>
                          <Text fontSize="2xs" color="gray.500">•</Text>
                          <Text fontSize="2xs" color="gray.400" fontWeight="500">
                            {formatTime(m.createdAt)}
                          </Text>
                        </Flex>
                      </Box>
                    </Flex>

                    <Flex align="center" gap={1.5}>
                      {onStartVideoCall && (
                        <Button
                          size="xs"
                          leftIcon={<FaVideo />}
                          colorScheme="purple"
                          variant="solid"
                          borderRadius="full"
                          fontSize="2xs"
                          fontWeight="700"
                          px={3}
                          onClick={onStartVideoCall}
                          _hover={{ transform: "scale(1.05)" }}
                        >
                          Call Back
                        </Button>
                      )}

                      <Menu placement="bottom-end">
                        <MenuButton
                          as={IconButton}
                          aria-label="Call options"
                          icon={<FiMoreVertical />}
                          size="xs"
                          variant="ghost"
                          color="gray.400"
                          borderRadius="full"
                          _hover={{ bg: "rgba(255, 255, 255, 0.1)", color: "white" }}
                        />
                        <MenuList
                          zIndex={2000}
                          minW="140px"
                          p={1.5}
                          borderRadius="xl"
                          bg="#1e293b"
                          color="white"
                          border="1px solid rgba(255, 255, 255, 0.15)"
                          boxShadow="0 10px 30px rgba(0,0,0,0.6)"
                        >
                          <MenuItem
                            borderRadius="lg"
                            fontSize="xs"
                            fontWeight="600"
                            color="whiteAlpha.900"
                            bg="transparent"
                            _hover={{ bg: "rgba(255, 255, 255, 0.12)", color: "white" }}
                            _focus={{ bg: "rgba(255, 255, 255, 0.12)", color: "white" }}
                            onClick={() => handleDeleteForMe(m._id)}
                          >
                            Delete for Me
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Flex>
                  </Flex>
                </Flex>
              </React.Fragment>
            );
          }

          // ─── Standard Text Message Bubble ────────────────────────────────────
          return (
            <React.Fragment key={m._id}>
              {showDateDivider && (
                <Flex justify="center" my={2.5} w="100%">
                  <Box
                    bg="rgba(15, 23, 42, 0.75)"
                    color="rgba(255, 255, 255, 0.85)"
                    backdropFilter="blur(12px)"
                    border="1px solid rgba(255, 255, 255, 0.1)"
                    px={3.5}
                    py={1}
                    borderRadius="full"
                    fontSize="2xs"
                    fontWeight="700"
                    letterSpacing="0.03em"
                    boxShadow="0 4px 12px rgba(0,0,0,0.25)"
                  >
                    {formatDateDivider(m.createdAt)}
                  </Box>
                </Flex>
              )}

              <Flex
                align="flex-end"
                justify={isSentByMe ? "flex-end" : "flex-start"}
                w="100%"
                gap={2}
                role="group"
                position="relative"
              >
                {/* Receiver Avatar (in group or 1-on-1) */}
                {!isSentByMe && (
                  <Tooltip
                    label={m.sender?.name || "User"}
                    placement="bottom-start"
                    hasArrow
                    bg="purple.700"
                    color="white"
                  >
                    <Avatar
                      size="xs"
                      mb={1}
                      cursor="pointer"
                      name={m.sender?.name || "User"}
                      src={m.sender?.pic}
                      bg="purple.600"
                      border="1.5px solid white"
                    />
                  </Tooltip>
                )}

                {/* Message Bubble Container */}
                <Box
                  maxW={{ base: "82%", md: "72%" }}
                  position="relative"
                  display="flex"
                  flexDirection="column"
                  alignItems={isSentByMe ? "flex-end" : "flex-start"}
                >
                  {/* Sender Name for group chats if received */}
                  {!isSentByMe && selectedChat?.isGroupChat && (
                    <Text
                      fontSize="2xs"
                      fontWeight="700"
                      color="#60A5FA"
                      ml={1}
                      mb={0.5}
                    >
                      {m.sender?.name || "User"}
                    </Text>
                  )}

                  <Flex align="center" gap={1}>
                    {/* Left Actions for Sent Messages */}
                    {isSentByMe && !m.deletedForEveryone && (
                      <Flex align="center" gap={0.5}>
                        <IconButton
                          aria-label="Reply"
                          icon={<Icon as={FaReply} />}
                          size="xs"
                          variant="ghost"
                          color="gray.400"
                          opacity={0}
                          _groupHover={{ opacity: 1 }}
                          _hover={{ bg: "rgba(255, 255, 255, 0.12)", color: "#BAE6FD" }}
                          borderRadius="full"
                          onClick={() => setReplyingTo && setReplyingTo(m)}
                          transition="opacity 0.2s ease"
                        />

                        <Menu placement="left-start">
                          <MenuButton
                            as={IconButton}
                            aria-label="Options"
                            icon={<FiMoreVertical />}
                            size="xs"
                            variant="ghost"
                            color="gray.400"
                            opacity={0}
                            _groupHover={{ opacity: 1 }}
                            _hover={{ bg: "rgba(255, 255, 255, 0.12)", color: "white" }}
                            borderRadius="full"
                            transition="opacity 0.2s ease"
                          />
                          <MenuList
                            zIndex={2000}
                            minW="160px"
                            p={1.5}
                            borderRadius="xl"
                            bg="#1e293b"
                            color="white"
                            border="1px solid rgba(255, 255, 255, 0.15)"
                            boxShadow="0 10px 30px rgba(0,0,0,0.6)"
                          >
                            <MenuItem
                              borderRadius="lg"
                              fontSize="xs"
                              fontWeight="600"
                              color="whiteAlpha.900"
                              icon={<Icon as={FaReply} color="#60A5FA" boxSize={3.5} />}
                              bg="transparent"
                              _hover={{ bg: "rgba(255, 255, 255, 0.12)", color: "white" }}
                              _focus={{ bg: "rgba(255, 255, 255, 0.12)", color: "white" }}
                              onClick={() => setReplyingTo && setReplyingTo(m)}
                            >
                              Reply
                            </MenuItem>
                            <MenuItem
                              borderRadius="lg"
                              fontSize="xs"
                              fontWeight="600"
                              color="whiteAlpha.900"
                              bg="transparent"
                              _hover={{ bg: "rgba(255, 255, 255, 0.12)", color: "white" }}
                              _focus={{ bg: "rgba(255, 255, 255, 0.12)", color: "white" }}
                              onClick={() => handleDeleteForMe(m._id)}
                            >
                              Delete for Me
                            </MenuItem>
                            <MenuItem
                              borderRadius="lg"
                              fontSize="xs"
                              fontWeight="600"
                              color="#F87171"
                              bg="transparent"
                              _hover={{ bg: "rgba(239, 68, 68, 0.18)", color: "#FCA5A5" }}
                              _focus={{ bg: "rgba(239, 68, 68, 0.18)", color: "#FCA5A5" }}
                              onClick={() => handleDeleteForEveryone(m._id)}
                            >
                              Delete for Everyone
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Flex>
                    )}

                    {/* Bubble Content */}
                    <Box
                      bg={
                        isSentByMe
                          ? "linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)"
                          : "rgba(255, 255, 255, 0.98)"
                      }
                      color={isSentByMe ? "white" : "gray.800"}
                      px={4}
                      py={2.5}
                      borderRadius={
                        isSentByMe
                          ? "18px 18px 4px 18px"
                          : "18px 18px 18px 4px"
                      }
                      boxShadow={
                        isSentByMe
                          ? "0 4px 14px rgba(90, 103, 216, 0.3)"
                          : "0 2px 10px rgba(0, 0, 0, 0.08)"
                      }
                      fontSize="sm"
                      fontWeight="500"
                      lineHeight="1.5"
                      wordBreak="break-word"
                      position="relative"
                    >
                      {/* Quoted Message Preview */}
                      {m.replyTo && (
                        <Box
                          mb={2}
                          p={2}
                          bg={isSentByMe ? "rgba(0, 0, 0, 0.24)" : "rgba(90, 103, 216, 0.08)"}
                          borderLeft="3px solid"
                          borderLeftColor={isSentByMe ? "#BAE6FD" : "#5A67D8"}
                          borderRadius="md"
                          fontSize="xs"
                        >
                          <Text
                            fontWeight="700"
                            fontSize="2xs"
                            color={isSentByMe ? "#BAE6FD" : "#5A67D8"}
                            letterSpacing="0.02em"
                            mb={0.5}
                          >
                            {m.replyTo.sender?._id === user._id ? "You" : m.replyTo.sender?.name || "User"}
                          </Text>
                          <Text
                            color={isSentByMe ? "whiteAlpha.800" : "gray.600"}
                            fontSize="xs"
                            noOfLines={2}
                            fontStyle={m.replyTo.deletedForEveryone ? "italic" : "normal"}
                          >
                            {m.replyTo.deletedForEveryone ? "🚫 This message was deleted" : m.replyTo.content}
                          </Text>
                        </Box>
                      )}

                      {m.deletedForEveryone ? (
                        <Text fontStyle="italic" color={isSentByMe ? "whiteAlpha.700" : "gray.400"} fontSize="xs">
                          🚫 This message was deleted
                        </Text>
                      ) : (
                        m.content
                      )}

                      {/* Clean 12-hour timestamp */}
                      <Text
                        fontSize="2xs"
                        color={isSentByMe ? "rgba(255, 255, 255, 0.75)" : "gray.500"}
                        textAlign="right"
                        mt={1}
                        fontWeight="600"
                        userSelect="none"
                      >
                        {formatTime(m.createdAt)}
                      </Text>
                    </Box>

                    {/* Right Actions for Received Messages */}
                    {!isSentByMe && !m.deletedForEveryone && (
                      <Flex align="center" gap={0.5}>
                        <IconButton
                          aria-label="Reply"
                          icon={<Icon as={FaReply} />}
                          size="xs"
                          variant="ghost"
                          color="gray.400"
                          opacity={0}
                          _groupHover={{ opacity: 1 }}
                          _hover={{ bg: "rgba(255, 255, 255, 0.12)", color: "#BAE6FD" }}
                          borderRadius="full"
                          onClick={() => setReplyingTo && setReplyingTo(m)}
                          transition="opacity 0.2s ease"
                        />

                        <Menu placement="right-start">
                          <MenuButton
                            as={IconButton}
                            aria-label="Options"
                            icon={<FiMoreVertical />}
                            size="xs"
                            variant="ghost"
                            color="gray.400"
                            opacity={0}
                            _groupHover={{ opacity: 1 }}
                            _hover={{ bg: "rgba(255, 255, 255, 0.12)", color: "white" }}
                            borderRadius="full"
                            transition="opacity 0.2s ease"
                          />
                          <MenuList
                            zIndex={2000}
                            minW="150px"
                            p={1.5}
                            borderRadius="xl"
                            bg="#1e293b"
                            color="white"
                            border="1px solid rgba(255, 255, 255, 0.15)"
                            boxShadow="0 10px 30px rgba(0,0,0,0.6)"
                          >
                            <MenuItem
                              borderRadius="lg"
                              fontSize="xs"
                              fontWeight="600"
                              color="whiteAlpha.900"
                              icon={<Icon as={FaReply} color="#60A5FA" boxSize={3.5} />}
                              bg="transparent"
                              _hover={{ bg: "rgba(255, 255, 255, 0.12)", color: "white" }}
                              _focus={{ bg: "rgba(255, 255, 255, 0.12)", color: "white" }}
                              onClick={() => setReplyingTo && setReplyingTo(m)}
                            >
                              Reply
                            </MenuItem>
                            <MenuItem
                              borderRadius="lg"
                              fontSize="xs"
                              fontWeight="600"
                              color="whiteAlpha.900"
                              bg="transparent"
                              _hover={{ bg: "rgba(255, 255, 255, 0.12)", color: "white" }}
                              _focus={{ bg: "rgba(255, 255, 255, 0.12)", color: "white" }}
                              onClick={() => handleDeleteForMe(m._id)}
                            >
                              Delete for Me
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Flex>
                    )}
                  </Flex>
                </Box>
              </Flex>
            </React.Fragment>
          );
        })}
    </Box>
  );
};

export default ScrollableChat;
