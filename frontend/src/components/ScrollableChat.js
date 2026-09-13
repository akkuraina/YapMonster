import React, { useState, useRef, useEffect } from "react";
import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import { Box, Text, Flex } from "@chakra-ui/layout";
import { Menu, MenuButton, MenuList, MenuItem, IconButton } from "@chakra-ui/react";
import { FiMoreVertical } from "react-icons/fi";
import axios from "axios";
import { ChatState } from "../Context/ChatProvider";
import config from "../config/config";

// Helper function to format timestamp
const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  const now = new Date();

  // If message is from today, show only time
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  // If message is from yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`;
  }

  // Older messages
  return `${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} ${date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })}`;
};

const ScrollableChat = ({ messages, socket }) => {
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
        localMessages.map((m) => {
          // Hide if deleted for me
          if (m.deletedFor && m.deletedFor.includes(user._id)) return null;

          const isSentByMe = m.sender._id === user._id;

          return (
            <Flex
              key={m._id}
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
                    color="purple.700"
                    ml={1}
                    mb={0.5}
                  >
                    {m.sender?.name || "User"}
                  </Text>
                )}

                <Flex align="center" gap={1}>
                  {/* Left Menu for Sent Messages */}
                  {isSentByMe && !m.deletedForEveryone && (
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
                        _hover={{ bg: "rgba(0, 0, 0, 0.08)", color: "gray.700" }}
                        borderRadius="full"
                        transition="opacity 0.2s ease"
                      />
                      <MenuList zIndex={2000} minW="150px" p={1.5} borderRadius="xl" boxShadow="0 8px 30px rgba(0,0,0,0.15)">
                        <MenuItem
                          borderRadius="lg"
                          fontSize="xs"
                          fontWeight="600"
                          onClick={() => handleDeleteForMe(m._id)}
                        >
                          Delete for Me
                        </MenuItem>
                        <MenuItem
                          borderRadius="lg"
                          fontSize="xs"
                          fontWeight="600"
                          color="red.500"
                          onClick={() => handleDeleteForEveryone(m._id)}
                        >
                          Delete for Everyone
                        </MenuItem>
                      </MenuList>
                    </Menu>
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
                    {m.deletedForEveryone ? (
                      <Text fontStyle="italic" color={isSentByMe ? "whiteAlpha.700" : "gray.400"} fontSize="xs">
                        🚫 This message was deleted
                      </Text>
                    ) : (
                      m.content
                    )}

                    {/* Timestamp inside or under bubble */}
                    <Text
                      fontSize="2xs"
                      color={isSentByMe ? "rgba(255, 255, 255, 0.7)" : "gray.400"}
                      textAlign="right"
                      mt={1}
                      fontWeight="500"
                    >
                      {formatTimestamp(m.createdAt)}
                    </Text>
                  </Box>

                  {/* Right Menu for Received Messages */}
                  {!isSentByMe && !m.deletedForEveryone && (
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
                        _hover={{ bg: "rgba(0, 0, 0, 0.08)", color: "gray.700" }}
                        borderRadius="full"
                        transition="opacity 0.2s ease"
                      />
                      <MenuList zIndex={2000} minW="140px" p={1.5} borderRadius="xl" boxShadow="0 8px 30px rgba(0,0,0,0.15)">
                        <MenuItem
                          borderRadius="lg"
                          fontSize="xs"
                          fontWeight="600"
                          onClick={() => handleDeleteForMe(m._id)}
                        >
                          Delete for Me
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  )}
                </Flex>
              </Box>
            </Flex>
          );
        })}
    </Box>
  );
};

export default ScrollableChat;
