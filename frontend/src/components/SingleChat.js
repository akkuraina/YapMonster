import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text, Flex, VStack } from "@chakra-ui/layout";
import { Avatar } from "@chakra-ui/avatar";
import "./styles.css";
import { IconButton, Spinner, useToast, Icon } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ArrowBackIcon, ChatIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";

import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";
import config from "../config/config";

// Use the same config as other components
const ENDPOINT = config.BACKEND_URL;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const toast = useToast();
  const socketRef = useRef();
  const selectedChatCompareRef = useRef();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const { selectedChat, setSelectedChat, user, notification, setNotification } =
    ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;

    console.log("Fetching messages for chat:", selectedChat._id);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `${ENDPOINT}/api/message/${selectedChat._id}`,
        config
      );
      console.log("Fetched messages:", data);
      setMessages(data);
      setLoading(false);

      if (socketRef.current) {
        socketRef.current.emit("join chat", selectedChat._id);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error Occurred!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (event) => {
    // Check if it's a key event and not Enter, or if there's no message
    if ((event.type === 'keydown' && event.key !== 'Enter') || !newMessage.trim()) {
      return;
    }
    
    // Check if selectedChat and its _id exist
    if (!selectedChat || !selectedChat._id) {
      console.error("No selected chat or chat ID");
      toast({
        title: "Error",
        description: "No chat selected",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    
    if (socketRef.current) {
      socketRef.current.emit("stop typing", selectedChat._id);
    }
    const messageToSend = newMessage.trim();
    setNewMessage("");
    
    console.log("Sending message:", {
      content: messageToSend,
      chatId: selectedChat._id,
      selectedChat: selectedChat
    });
    
    console.log("Full request data:", {
      content: messageToSend,
      chatId: selectedChat._id,
      selectedChatId: selectedChat._id,
      selectedChatType: typeof selectedChat._id,
      selectedChatKeys: Object.keys(selectedChat || {})
    });
    
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      
      const { data } = await axios.post(
        `${ENDPOINT}/api/message`,
        {
          content: messageToSend,
          chatId: selectedChat._id,
        },
        config
      );
      
      console.log("Message sent successfully:", data);
      // Add message to local state immediately for better UX
      setMessages(prev => [...prev, data]);
      if (socketRef.current) {
        socketRef.current.emit("new message", data);
      }
    } catch (error) {
      console.error("Send message error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      // Only show error for actual network/server errors
      if (error.code === 'NETWORK_ERROR' || (error.response && error.response.status >= 500)) {
        toast({
          title: "Error Occurred!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
      // Restore the message if sending failed
      setNewMessage(messageToSend);
    }
  };

  useEffect(() => {
    console.log("Setting up socket connection to:", ENDPOINT);
    
    // Only create socket if it doesn't exist
    if (!socketRef.current) {
      socketRef.current = io(ENDPOINT, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: false,
      });
    }
    
    socketRef.current.emit("setup", user);
    socketRef.current.on("connected", () => {
      console.log("Socket connected successfully");
      setSocketConnected(true);
    });
    socketRef.current.on("typing", () => {
      console.log("Typing indicator received");
      setIsTyping(true);
    });
    socketRef.current.on("stop typing", () => {
      console.log("Stop typing indicator received");
      setIsTyping(false);
    });
    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setSocketConnected(false);
    });

    return () => {
      console.log("Cleaning up socket connection");
      socketRef.current.off("connected");
      socketRef.current.off("typing");
      socketRef.current.off("stop typing");
      socketRef.current.off("message received");
      socketRef.current.off("connect_error");
      // Don't disconnect here, let it persist
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchMessages();
    selectedChatCompareRef.current = selectedChat;
    
    // Debug: Log selectedChat object
    console.log("SelectedChat changed:", selectedChat);
    console.log("SelectedChat._id:", selectedChat?._id);
    console.log("SelectedChat keys:", selectedChat ? Object.keys(selectedChat) : "No chat selected");
    
    // Clear notifications for this chat when selected
    if (selectedChat) {
      setNotification(prev => prev.filter(notif => notif.chat._id !== selectedChat._id));
    }
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    console.log("Setting up message received listener");
    socketRef.current.on("message received", (newMessageReceived) => {
      console.log("Message received via socket:", newMessageReceived);
      console.log("Current selected chat:", selectedChatCompareRef.current);
      console.log("Current notifications count:", notification.length);
      console.log("Message sender ID:", newMessageReceived.sender._id);
      console.log("Current user ID:", user._id);
      
      // Check if this message is from a different chat than the currently selected one
      const isFromDifferentChat = !selectedChatCompareRef.current || selectedChatCompareRef.current._id !== newMessageReceived.chat._id;
      
      console.log("Is from different chat:", isFromDifferentChat);
      
      if (isFromDifferentChat) {
        // Add to notifications if not already present
        const isAlreadyNotified = notification.some(
          (notif) => notif._id === newMessageReceived._id
        );
        console.log("Is already notified:", isAlreadyNotified);
        
        if (!isAlreadyNotified) {
          console.log("Adding to notifications - message from different chat");
          setNotification(prev => {
            const newNotifications = [newMessageReceived, ...prev];
            console.log("New notifications array:", newNotifications.length);
            return newNotifications;
          });
          setFetchAgain(!fetchAgain);
        }
      } else {
        // Add to current chat messages if not already present
        const isAlreadyInMessages = messages.some(
          (msg) => msg._id === newMessageReceived._id
        );
        if (!isAlreadyInMessages) {
          console.log("Adding to current chat messages");
          setMessages(prev => [...prev, newMessageReceived]);
        }
      }
    });

    return () => {
      socketRef.current.off("message received");
    };
  }, [notification, messages, fetchAgain, user._id]);

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socketRef.current.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socketRef.current.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Box
            bg="linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)"
            p={4}
            borderRadius="0 0 20px 20px"
            boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)"
            mb={4}
          >
            <Flex
              alignItems="center"
              justifyContent="space-between"
              w="100%"
            >
              <IconButton
                icon={<ArrowBackIcon />}
                onClick={() => setSelectedChat("")}
                bg="rgba(255, 255, 255, 0.2)"
                backdropFilter="blur(10px)"
                border="2px solid rgba(255, 255, 255, 0.3)"
                color="white"
                borderRadius="full"
                _hover={{ 
                  bg: "rgba(255, 255, 255, 0.3)",
                  transform: "scale(1.05)",
                  transition: "all 0.2s ease-in-out"
                }}
                transition="all 0.2s ease-in-out"
              />
              <Box
                fontSize={{ base: "xl", md: "2xl" }}
                fontFamily="'Poppins', sans-serif"
                fontWeight="700"
                color="white"
                textAlign="center"
                flex="1"
                mx={4}
              >
                {messages &&
                  (!selectedChat.isGroupChat ? (
                    <Flex alignItems="center" justifyContent="center" gap={3}>
                      <Avatar
                        size="md"
                        name={selectedChat.users && selectedChat.users.length > 0 ? getSender(user, selectedChat.users) : "Unknown User"}
                        src={selectedChat.users && selectedChat.users.length > 0 ? getSender(user, selectedChat.users)?.pic : ""}
                        border="2px solid"
                        borderColor="rgba(255, 255, 255, 0.3)"
                        bg="blue.600"
                      />
                      <Text>{selectedChat.users && selectedChat.users.length > 0 ? getSender(user, selectedChat.users) : "Unknown User"}</Text>
                      <ProfileModal
                        user={selectedChat.users && selectedChat.users.length > 0 ? getSenderFull(user, selectedChat.users) : null}
                      />
                    </Flex>
                  ) : (
                    <Flex alignItems="center" justifyContent="center" gap={3}>
                      <Avatar
                        size="md"
                        name={selectedChat.chatName || "Group"}
                        src={selectedChat.groupPic}
                        border="2px solid"
                        borderColor="rgba(255, 255, 255, 0.3)"
                        bg="purple.600"
                      />
                      <Text>{selectedChat.chatName?.toUpperCase() || "UNNAMED GROUP"}</Text>
                      <UpdateGroupChatModal
                        fetchMessages={fetchMessages}
                        fetchAgain={fetchAgain}
                        setFetchAgain={setFetchAgain}
                      />
                    </Flex>
                  ))}
              </Box>
            </Flex>
          </Box>
          
          <Box
            display="flex"
            flexDir="column"
            justifyContent="space-between"
            p={6}
            bg="linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
            w="100%"
            h="100%"
            borderRadius="20px"
            boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
            border="1px solid rgba(102, 126, 234, 0.1)"
          >
            {loading ? (
              <Flex justify="center" align="center" h="100%">
                <Spinner
                  size="xl"
                  color="purple.500"
                  thickness="4px"
                  speed="0.65s"
                />
              </Flex>
            ) : (
              <Box 
                flex="1" 
                mb={6}
                pr={2}
                overflow="hidden"
                display="flex"
                flexDirection="column"
              >
                <ScrollableChat messages={messages} />
              </Box>
            )}

            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt="auto"
              flexShrink="0"
            >
              {istyping ? (
                <Box mb={3} p={2} bg="purple.50" borderRadius="lg">
                  <Lottie
                    options={defaultOptions}
                    width={40}
                    style={{ marginLeft: 0 }}
                  />
                </Box>
              ) : null}
              <Flex position="relative" alignItems="center">
                <Input
                  variant="filled"
                  bg="white"
                  placeholder="Type your message here..."
                  value={newMessage}
                  onChange={typingHandler}
                  _placeholder={{ color: "gray.500" }}
                  color="gray.800"
                  borderRadius="full"
                  border="2px solid"
                  borderColor="purple.200"
                  focusBorderColor="purple.400"
                  boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
                  _focus={{
                    boxShadow: "0 4px 16px rgba(102, 126, 234, 0.3)",
                    transform: "translateY(-1px)",
                    transition: "all 0.2s ease-in-out"
                  }}
                  transition="all 0.2s ease-in-out"
                  fontSize="md"
                  fontWeight="500"
                  pr="60px" // Make room for the send button
                />
                <IconButton
                  icon={<Icon as={ArrowForwardIcon} />}
                  onClick={sendMessage}
                  position="absolute"
                  right="4px"
                  colorScheme="purple"
                  borderRadius="full"
                  size="sm"
                  isDisabled={!newMessage.trim()}
                  _hover={{
                    transform: "scale(1.05)",
                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)"
                  }}
                  transition="all 0.2s ease-in-out"
                  aria-label="Send message"
                />
              </Flex>
            </FormControl>
          </Box>
        </>
      ) : (
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="center" 
          h="100%" 
          w="100%"
          bg="#E6E6FA"
          borderRadius="20px"
          boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
        >
          <VStack spacing={6}>
            <Box
              p={8}
              bg="white"
              borderRadius="full"
              boxShadow="0 8px 32px rgba(90, 103, 216, 0.2)"
            >
              <Icon as={ChatIcon} w={16} h={16} color="purple.600" />
            </Box>
            <Text 
              fontSize={{ base: "2xl", md: "3xl" }} 
              fontFamily="'Poppins', sans-serif" 
              fontWeight="700"
              color="purple.700"
              textAlign="center"
              maxW="400px"
            >
              Click on a user to start chatting
            </Text>
            <Text 
              fontSize="md" 
              color="gray.600"
              textAlign="center"
              maxW="300px"
            >
              Select a conversation from the sidebar to begin messaging
            </Text>
          </VStack>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
