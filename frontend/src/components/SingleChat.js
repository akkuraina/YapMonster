import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text, Flex, VStack } from "@chakra-ui/layout";
import "./styles.css";
import { IconButton, Spinner, useToast, Icon } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowBackIcon, ChatIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";

import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";
const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const toast = useToast();

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

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
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
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat,
          },
          config
        );
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error Occurred!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message received", (newMessageReceived) => {
      if (
        !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        if (!notification.includes(newMessageReceived)) {
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageReceived]);
      }
    });
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
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
              <Text
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
                      <Text>{getSender(user, selectedChat.users)}</Text>
                      <ProfileModal
                        user={getSenderFull(user, selectedChat.users)}
                      />
                    </Flex>
                  ) : (
                    <Flex alignItems="center" justifyContent="center" gap={3}>
                      <Text>{selectedChat.chatName.toUpperCase()}</Text>
                      <UpdateGroupChatModal
                        fetchMessages={fetchMessages}
                        fetchAgain={fetchAgain}
                        setFetchAgain={setFetchAgain}
                      />
                    </Flex>
                  ))}
              </Text>
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
              />
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
