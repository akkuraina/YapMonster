import React, { useEffect, useState } from "react";
import { AddIcon, SearchIcon } from "@chakra-ui/icons";
import {
  Box,
  Stack,
  Text,
  Button,
  useToast,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Avatar,
  IconButton,
  Menu as ChakraMenu,
  MenuButton as ChakraMenuButton,
  MenuList as ChakraMenuList,
  MenuItem as ChakraMenuItem,
} from "@chakra-ui/react";
import { FiMoreVertical } from "react-icons/fi";
import axios from "axios";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { ChatState } from "../Context/ChatProvider";
import config from "../config/config";

const formatChatListTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const [chatFilter, setChatFilter] = useState("");

  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();
  const toast = useToast();

  const fetchChats = async () => {
    try {
      const config_headers = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`${config.BACKEND_URL}/api/chat`, config_headers);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Loading Chats",
        description: "Failed to fetch conversations",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const deleteChatHandler = async (chatId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this chat? This cannot be undone.")) {
      return;
    }

    try {
      await axios.delete(`${config.BACKEND_URL}/api/chat/${chatId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      if (selectedChat && selectedChat._id === chatId) setSelectedChat(null);
      toast({ title: "Chat deleted", status: "success", duration: 2000, isClosable: true, position: "bottom" });
    } catch (err) {
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      if (selectedChat && selectedChat._id === chatId) setSelectedChat(null);
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  const filteredChats = chats
    ? chats.filter((chat) => {
        const name = chat.isGroupChat
          ? chat.chatName
          : (chat.users && chat.users.length > 0 ? getSender(loggedUser, chat.users) : "");
        return name.toLowerCase().includes(chatFilter.toLowerCase());
      })
    : [];

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      p={{ base: 3, md: 4 }}
      bg="rgba(5, 11, 28, 0.88)"
      backdropFilter="blur(24px)"
      w="100%"
      h="100%"
      borderRadius="24px"
      overflow="hidden"
      boxShadow="0 16px 45px rgba(0, 0, 0, 0.6)"
      border="1px solid rgba(255, 255, 255, 0.08)"
      position="relative"
    >
      {/* Header Bar */}
      <Flex justify="space-between" align="center" mb={3} px={1}>
        <Text
          fontSize={{ base: "xl", md: "2xl" }}
          fontWeight="800"
          color="white"
          fontFamily="'Plus Jakarta Sans', sans-serif"
          letterSpacing="-0.02em"
        >
          Conversations
        </Text>

        <Flex gap={2}>
          <GroupChatModal>
            <Button
              size="sm"
              leftIcon={<AddIcon />}
              bg="rgba(255, 255, 255, 0.2)"
              color="white"
              borderRadius="full"
              px={3.5}
              h="34px"
              fontWeight="700"
              fontSize="xs"
              backdropFilter="blur(10px)"
              border="1px solid rgba(255, 255, 255, 0.3)"
              _hover={{
                bg: "rgba(255, 255, 255, 0.32)",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
              }}
              _active={{ transform: "translateY(0)" }}
              transition="all 0.2s ease"
            >
              New Group
            </Button>
          </GroupChatModal>
        </Flex>
      </Flex>

      {/* Filter / Search Conversations Input */}
      <InputGroup size="sm" mb={3}>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="rgba(255, 255, 255, 0.6)" />
        </InputLeftElement>
        <Input
          placeholder="Filter chats..."
          value={chatFilter}
          onChange={(e) => setChatFilter(e.target.value)}
          bg="rgba(255, 255, 255, 0.12)"
          border="1px solid rgba(255, 255, 255, 0.18)"
          color="white"
          borderRadius="xl"
          fontSize="xs"
          _placeholder={{ color: "rgba(255, 255, 255, 0.55)" }}
          _focus={{
            borderColor: "#63B3ED",
            bg: "rgba(255, 255, 255, 0.18)",
            boxShadow: "0 0 0 1px #63B3ED",
          }}
        />
      </InputGroup>

      {/* Chat List Container */}
      <Box
        flex="1"
        minH="0"
        bg="rgba(255, 255, 255, 0.08)"
        backdropFilter="blur(12px)"
        w="100%"
        borderRadius="20px"
        overflow="hidden"
        p={2.5}
        border="1px solid rgba(255, 255, 255, 0.15)"
      >
        {chats ? (
          <Stack
            overflowY="auto"
            spacing={2}
            h="100%"
            pr={1}
            css={{
              "&::-webkit-scrollbar": { width: "0px !important" },
              scrollbarWidth: "none !important",
            }}
          >
            {filteredChats.map((chat) => {
              const isSelected = selectedChat?._id === chat._id;
              const chatTitle = !chat.isGroupChat
                ? (chat.users && chat.users.length > 0 ? getSender(loggedUser, chat.users) : "Unknown User")
                : (chat.chatName || "Unnamed Group");

              const avatarPic = chat.isGroupChat
                ? chat.groupPic
                : (chat.users && chat.users.length > 0 ? getSenderFull(loggedUser, chat.users)?.pic : "");

              return (
                <Box
                  key={chat._id}
                  onClick={() => setSelectedChat(chat)}
                  cursor="pointer"
                  bg={isSelected ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.12)"}
                  color={isSelected ? "purple.900" : "white"}
                  px={3}
                  py={2.5}
                  borderRadius="16px"
                  border="1px solid"
                  borderColor={isSelected ? "white" : "rgba(255, 255, 255, 0.12)"}
                  boxShadow={isSelected ? "0 8px 24px rgba(0, 0, 0, 0.15)" : "none"}
                  position="relative"
                  transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                  _hover={{
                    bg: isSelected ? "white" : "rgba(255, 255, 255, 0.22)",
                    transform: "translateX(3px)",
                  }}
                >
                  {/* Left Active Accent Pill */}
                  {isSelected && (
                    <Box
                      position="absolute"
                      left="0"
                      top="15%"
                      bottom="15%"
                      w="4px"
                      bg="linear-gradient(180deg, #5A67D8 0%, #6B46C1 100%)"
                      borderRadius="0 4px 4px 0"
                    />
                  )}

                  <Flex align="center" gap={3}>
                    <Avatar
                      size="sm"
                      name={chatTitle}
                      src={avatarPic}
                      border="2px solid"
                      borderColor={isSelected ? "purple.400" : "rgba(255, 255, 255, 0.3)"}
                      bg={chat.isGroupChat ? "purple.600" : "blue.600"}
                      flexShrink={0}
                    />

                    <Box flex="1" minW="0" overflow="hidden">
                      <Flex justify="space-between" align="center">
                        <Text
                          fontWeight="700"
                          fontSize="sm"
                          noOfLines={1}
                          color={isSelected ? "gray.900" : "white"}
                          flex="1"
                          mr={2}
                        >
                          {chatTitle}
                        </Text>
                        {chat.latestMessage && (
                          <Text
                            fontSize="2xs"
                            color={isSelected ? "gray.500" : "rgba(255, 255, 255, 0.5)"}
                            fontWeight="500"
                            flexShrink={0}
                          >
                            {formatChatListTime(chat.latestMessage.createdAt)}
                          </Text>
                        )}
                      </Flex>

                      {chat.latestMessage ? (
                        <Text
                          fontSize="xs"
                          color={isSelected ? "gray.600" : "rgba(255, 255, 255, 0.75)"}
                          noOfLines={1}
                        >
                          {chat.latestMessage.messageType === "call" ? (
                            <Text
                              as="span"
                              color={
                                chat.latestMessage.callInfo?.status === "missed"
                                  ? "red.400"
                                  : isSelected
                                  ? "purple.600"
                                  : "purple.300"
                              }
                              fontWeight="600"
                            >
                              📹 {chat.latestMessage.content}
                            </Text>
                          ) : chat.latestMessage.messageType === "audio" ? (
                            <>
                              <Text as="span" fontWeight="600">
                                {chat.latestMessage.sender?._id === user._id
                                  ? "You: "
                                  : `${chat.latestMessage.sender?.name?.split(" ")[0] || "User"}: `}
                              </Text>
                              {chat.latestMessage.deletedForEveryone
                                ? "This message was deleted"
                                : "Voice message"}
                            </>
                          ) : (
                            <>
                              <Text as="span" fontWeight="600">
                                {chat.latestMessage.sender?._id === user._id
                                  ? "You: "
                                  : `${chat.latestMessage.sender?.name?.split(" ")[0] || "User"}: `}
                              </Text>
                              {chat.latestMessage.deletedForEveryone
                                ? "This message was deleted"
                                : chat.latestMessage.content}
                            </>
                          )}
                        </Text>
                      ) : (
                        <Text fontSize="2xs" color={isSelected ? "gray.400" : "rgba(255, 255, 255, 0.5)"}>
                          No messages yet. Start chatting!
                        </Text>
                      )}
                    </Box>

                    {/* Chat Options Menu */}
                    <ChakraMenu placement="bottom-end">
                      <ChakraMenuButton
                        as={IconButton}
                        aria-label="Chat options"
                        icon={<FiMoreVertical />}
                        size="xs"
                        variant="ghost"
                        color={isSelected ? "gray.600" : "whiteAlpha.800"}
                        _hover={{ bg: isSelected ? "gray.100" : "rgba(255, 255, 255, 0.2)" }}
                        onClick={(e) => e.stopPropagation()}
                        borderRadius="full"
                      />
                      <ChakraMenuList
                        bg="white"
                        borderRadius="xl"
                        boxShadow="0 8px 30px rgba(0, 0, 0, 0.15)"
                        p={1.5}
                        zIndex={2000}
                      >
                        <ChakraMenuItem
                          color="red.500"
                          borderRadius="lg"
                          fontWeight="600"
                          fontSize="xs"
                          onClick={(e) => deleteChatHandler(chat._id, e)}
                        >
                          Delete Chat
                        </ChakraMenuItem>
                      </ChakraMenuList>
                    </ChakraMenu>
                  </Flex>
                </Box>
              );
            })}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
