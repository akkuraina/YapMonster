import React, { useState } from "react";
import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import { Box, Text } from "@chakra-ui/layout";
import { Menu, MenuButton, MenuList, MenuItem, IconButton } from "@chakra-ui/react";
import { FiMoreVertical } from "react-icons/fi";
import axios from "axios";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import config from "../config/config";

// Helper function to format timestamp
const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);
  
  // If message is from today, show only time
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }
  
  // If message is from yesterday, show "Yesterday" and time
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday ${date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })}`;
  }
  
  // If message is older, show date and time
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  }) + ' ' + date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();
  const [localMessages, setLocalMessages] = useState(messages);

  // Update localMessages if messages prop changes
  React.useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  const handleDeleteForMe = async (messageId) => {
    try {
      await axios.put(
        `${config.BACKEND_URL}/api/message/delete-for-me`,
        { messageId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setLocalMessages((prev) => prev.filter((m) => m._id !== messageId));
    } catch (err) {
      alert("Failed to delete message for you");
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
    } catch (err) {
      alert("Failed to delete message for everyone");
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="8px"
      padding="10px"
      height="100%"
      flex="1"
      overflowY="auto"
      overflowX="hidden"
      css={{
        '&::-webkit-scrollbar': {
          width: '0px !important',
          background: 'transparent !important',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent !important',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'transparent !important',
        },
        scrollbarWidth: 'none !important',
        msOverflowStyle: 'none !important',
        scrollBehavior: 'smooth',
      }}
    >
      {localMessages &&
        localMessages.map((m, i) => {
          // Hide if deleted for me
          if (m.deletedFor && m.deletedFor.includes(user._id)) return null;
          return (
            <Box
              key={m._id}
              display="flex"
              alignItems="flex-start"
              justifyContent={m.sender._id === user._id ? "flex-end" : "flex-start"}
              width="100%"
              position="relative"
            >
              {m.sender._id !== user._id && (
                <Tooltip
                  label={m.sender?.name || "Unknown User"}
                  placement="bottom-start"
                  hasArrow
                  bg="purple.700"
                  color="white"
                >
                  <Avatar
                    mt="7px"
                    mr={2}
                    size="sm"
                    cursor="pointer"
                    name={m.sender?.name || "Unknown"}
                    src={m.sender?.pic}
                    bg="purple.600"
                  />
                </Tooltip>
              )}
              <Box
                display="flex"
                flexDirection="column"
                alignItems={m.sender._id === user._id ? "flex-end" : "flex-start"}
                maxWidth="70%"
                position="relative"
              >
                <Box display="flex" alignItems="center">
                  <Box
                    backgroundColor={m.sender._id === user._id ? "#5A67D8" : "#6B46C1"}
                    color="white"
                    padding="8px 16px"
                    borderRadius="18px"
                    fontSize="14px"
                    boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
                    wordBreak="break-word"
                    overflowWrap="break-word"
                    mb="2px"
                    minWidth="40px"
                  >
                    {m.deletedForEveryone ? (
                      <Text fontStyle="italic" color="gray.300">This message was deleted</Text>
                    ) : (
                      m.content || "Empty message"
                    )}
                  </Box>
                  {/* Three dots menu */}
                  {!m.deletedForEveryone && (
                    <Menu placement="bottom-end">
                      <MenuButton
                        as={IconButton}
                        aria-label="Options"
                        icon={<FiMoreVertical />}
                        size="xs"
                        variant="ghost"
                        ml={1}
                        _hover={{ bg: "purple.100" }}
                        _active={{ bg: "purple.200" }}
                      />
                      <MenuList zIndex={2000} minW="140px">
                        <MenuItem onClick={() => handleDeleteForMe(m._id)}>
                          Delete for me
                        </MenuItem>
                        {(m.sender._id === user._id || user.isAdmin) && (
                          <MenuItem color="red.500" onClick={() => handleDeleteForEveryone(m._id)}>
                            Delete for everyone
                          </MenuItem>
                        )}
                      </MenuList>
                    </Menu>
                  )}
                </Box>
                <Text
                  fontSize="10px"
                  color="gray.500"
                  opacity="0.8"
                  mt="1px"
                  mb="2px"
                  fontStyle="italic"
                >
                  {formatTimestamp(m.createdAt)}
                </Text>
              </Box>
              {m.sender._id === user._id && (
                <Tooltip
                  label={m.sender?.name || "Unknown User"}
                  placement="bottom-end"
                  hasArrow
                  bg="purple.700"
                  color="white"
                >
                  <Avatar
                    mt="7px"
                    ml={2}
                    size="sm"
                    cursor="pointer"
                    name={m.sender?.name || "Unknown"}
                    src={m.sender?.pic}
                    bg="purple.600"
                  />
                </Tooltip>
              )}
            </Box>
          );
        })}
    </Box>
  );
};

export default ScrollableChat;
