import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text, Flex, VStack } from "@chakra-ui/layout";
import { Avatar } from "@chakra-ui/avatar";
import "./styles.css";
import { IconButton, Spinner, useToast, Icon, Tooltip } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import { FaVideo, FaComments } from "react-icons/fa";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import VideoCallModal from "./VideoCall/VideoCallModal";
import IncomingCallModal from "./VideoCall/IncomingCallModal";
import YapMonsterWordmark from "./common/YapMonsterWordmark";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";

import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";
import config from "../config/config";

const ENDPOINT = config.BACKEND_URL;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [videoCallOpen, setVideoCallOpen] = useState(false);
  const [videoCallData, setVideoCallData] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const toast = useToast();
  const socketRef = useRef();
  const selectedChatCompareRef = useRef();
  const [chatBg, setChatBg] = useState({ type: "color", value: "#f8fafc" });

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const { selectedChat, setSelectedChat, user, setNotification } =
    ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config_headers = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `${ENDPOINT}/api/message/${selectedChat._id}`,
        config_headers
      );
      setMessages(data);
      setLoading(false);

      if (socketRef.current) {
        socketRef.current.emit("join chat", selectedChat._id);
      }
    } catch (error) {
      toast({
        title: "Error Occurred",
        description: "Failed to load messages",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (event) => {
    if ((event.type === "keydown" && event.key !== "Enter") || !newMessage.trim()) {
      return;
    }

    if (!selectedChat || !selectedChat._id) return;

    if (socketRef.current) {
      socketRef.current.emit("stop typing", selectedChat._id);
    }
    const messageToSend = newMessage.trim();
    setNewMessage("");

    try {
      const config_headers = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        `${config.BACKEND_URL}/api/message`,
        {
          content: messageToSend,
          chatId: selectedChat._id,
        },
        config_headers
      );

      if (socketRef.current) {
        socketRef.current.emit("new message", data);
      }
      setMessages((prev) => [...prev, data]);
    } catch (error) {
      toast({
        title: "Message Failed",
        description: "Could not send message",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      setNewMessage(messageToSend);
    }
  };

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(ENDPOINT, {
        transports: ["websocket", "polling"],
        timeout: 20000,
        forceNew: false,
      });
    }

    socketRef.current.emit("setup", user);
    socketRef.current.on("connected", () => {
      setSocketConnected(true);
    });
    socketRef.current.on("typing", () => {
      setIsTyping(true);
    });
    socketRef.current.on("stop typing", () => {
      setIsTyping(false);
    });
    socketRef.current.on("connect_error", () => {
      setSocketConnected(false);
    });

    socketRef.current.on("message received", (newMessageReceived) => {
      const currentSelected = selectedChatCompareRef.current;
      const isFromDifferentChat = !currentSelected || currentSelected._id !== newMessageReceived.chat._id;

      if (isFromDifferentChat) {
        setNotification((prev) => {
          if (!prev.some((notif) => notif._id === newMessageReceived._id)) {
            return [newMessageReceived, ...prev];
          }
          return prev;
        });
        setFetchAgain((prev) => !prev);
      } else {
        setMessages((prev) => {
          if (!prev.some((msg) => msg._id === newMessageReceived._id)) {
            return [...prev, newMessageReceived];
          }
          return prev;
        });
      }
    });

    socketRef.current.on("message deleted", (data) => {
      if (!data || !data.messageId) return;
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId ? { ...msg, deletedForEveryone: true } : msg
        )
      );
    });

    socketRef.current.on("incoming call", (data) => {
      setIncomingCall(data);
    });

    socketRef.current.on("call rejected", (data) => {
      toast({
        title: "Call Declined",
        description: `${data.rejecter?.name || "User"} declined the call.`,
        status: "info",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
      setVideoCallOpen(false);
    });

    socketRef.current.on("call ended", () => {
      toast({
        title: "Call Ended",
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      setVideoCallOpen(false);
    });

    return () => {
      socketRef.current.off("connected");
      socketRef.current.off("typing");
      socketRef.current.off("stop typing");
      socketRef.current.off("message received");
      socketRef.current.off("message deleted");
      socketRef.current.off("incoming call");
      socketRef.current.off("call rejected");
      socketRef.current.off("call ended");
      socketRef.current.off("connect_error");
    };
    // eslint-disable-next-line
  }, []);

  const startVideoCall = () => {
    if (!selectedChat) return;

    const callPayload = {
      chatId: selectedChat._id,
      chatName: selectedChat.isGroupChat
        ? selectedChat.chatName
        : getSender(user, selectedChat.users),
      isGroupChat: selectedChat.isGroupChat,
    };

    setVideoCallData(callPayload);
    setVideoCallOpen(true);

    if (socketRef.current) {
      socketRef.current.emit("call user", {
        chatId: selectedChat._id,
        caller: user,
        isGroupChat: selectedChat.isGroupChat,
        chatName: selectedChat.isGroupChat ? selectedChat.chatName : user.name,
        users: selectedChat.users,
      });
    }
  };

  const handleAcceptIncomingCall = () => {
    if (!incomingCall) return;

    const callPayload = {
      chatId: incomingCall.chatId,
      chatName: incomingCall.chatName,
      isGroupChat: incomingCall.isGroupChat,
    };

    if (socketRef.current) {
      socketRef.current.emit("answer call", {
        chatId: incomingCall.chatId,
        callerId: incomingCall.caller._id,
        answerer: user,
      });
    }

    setVideoCallData(callPayload);
    setIncomingCall(null);
    setVideoCallOpen(true);
  };

  const handleDeclineIncomingCall = () => {
    if (!incomingCall) return;

    if (socketRef.current) {
      socketRef.current.emit("reject call", {
        chatId: incomingCall.chatId,
        callerId: incomingCall.caller._id,
        rejecter: user,
      });
    }

    setIncomingCall(null);
  };

  useEffect(() => {
    fetchMessages();
    selectedChatCompareRef.current = selectedChat;

    if (selectedChat) {
      setNotification((prev) => prev.filter((notif) => notif.chat._id !== selectedChat._id));
    }
    // eslint-disable-next-line
  }, [selectedChat]);

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

  const fetchChatBg = async () => {
    if (!selectedChat) return;
    try {
      const config_headers = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${config.BACKEND_URL}/api/user/chat-background/${selectedChat._id}`, config_headers);
      if (data) setChatBg(data);
      else setChatBg({ type: "color", value: "#f8fafc" });
    } catch {
      setChatBg({ type: "color", value: "#f8fafc" });
    }
  };

  useEffect(() => {
    fetchChatBg();
    // eslint-disable-next-line
  }, [selectedChat]);

  return (
    <Box w="100%" h="100%" display="flex" flexDirection="column" position="relative">
      {selectedChat ? (
        <>
          {/* Top Chat Header */}
          <Box
            bg="rgba(4, 9, 24, 0.95)"
            backdropFilter="blur(20px)"
            px={{ base: 3, md: 5 }}
            py={3}
            borderRadius="18px 18px 0 0"
            borderBottom="1px solid rgba(255, 255, 255, 0.08)"
            boxShadow="0 4px 20px rgba(0, 0, 0, 0.4)"
            position="relative"
            zIndex={10}
          >
            <Flex alignItems="center" justifyContent="space-between" w="100%">
              {/* Left: Back Button + Avatar + Name */}
              <Flex alignItems="center" gap={3}>
                <IconButton
                  icon={<ArrowBackIcon />}
                  onClick={() => setSelectedChat(null)}
                  display={{ base: "flex", md: "none" }}
                  bg="rgba(255, 255, 255, 0.2)"
                  color="white"
                  borderRadius="full"
                  size="sm"
                  _hover={{ bg: "rgba(255, 255, 255, 0.3)" }}
                  aria-label="Back to chats"
                />

                {!selectedChat.isGroupChat ? (
                  <Flex align="center" gap={3}>
                    <Avatar
                      size="sm"
                      name={selectedChat.users && selectedChat.users.length > 0 ? getSenderFull(user, selectedChat.users)?.name || "User" : "User"}
                      src={selectedChat.users && selectedChat.users.length > 0 ? getSenderFull(user, selectedChat.users)?.pic || "" : ""}
                      border="2px solid white"
                      bg="blue.600"
                    />
                    <Box>
                      <Text color="white" fontWeight="700" fontSize={{ base: "sm", md: "md" }} fontFamily="'Plus Jakarta Sans', sans-serif">
                        {selectedChat.users && selectedChat.users.length > 0 ? getSender(user, selectedChat.users) : "Unknown User"}
                      </Text>
                      <Text color="green.300" fontSize="2xs" fontWeight="600">
                        ● Active Direct Chat
                      </Text>
                    </Box>
                  </Flex>
                ) : (
                  <Flex align="center" gap={3}>
                    <Avatar
                      size="sm"
                      name={selectedChat.chatName || "Group"}
                      src={selectedChat.groupPic}
                      border="2px solid white"
                      bg="purple.600"
                    />
                    <Box>
                      <Text color="white" fontWeight="700" fontSize={{ base: "sm", md: "md" }} fontFamily="'Plus Jakarta Sans', sans-serif">
                        {selectedChat.chatName?.toUpperCase() || "UNNAMED GROUP"}
                      </Text>
                      <Text color="purple.200" fontSize="2xs" fontWeight="600">
                        👥 {selectedChat.users?.length || 0} participants
                      </Text>
                    </Box>
                  </Flex>
                )}
              </Flex>

              {/* Right: Circular / Pill Action Controls */}
              <Flex align="center" gap={2}>
                <Tooltip label={selectedChat.isGroupChat ? "Start Group Video Call" : "Start Video Call"} placement="bottom">
                  <IconButton
                    icon={<FaVideo />}
                    onClick={startVideoCall}
                    bg="rgba(72, 187, 120, 0.25)"
                    border="1px solid rgba(72, 187, 120, 0.5)"
                    color="green.300"
                    borderRadius="full"
                    size="sm"
                    _hover={{
                      bg: "green.500",
                      color: "white",
                      transform: "scale(1.08)",
                      boxShadow: "0 0 16px rgba(72, 187, 120, 0.6)",
                    }}
                    transition="all 0.2s ease"
                    aria-label="Start Video Call"
                  />
                </Tooltip>

                {!selectedChat.isGroupChat ? (
                  <ProfileModal
                    user={selectedChat.users && selectedChat.users.length > 0 ? getSenderFull(user, selectedChat.users) : user}
                    chatId={selectedChat._id}
                    onBackgroundChange={fetchChatBg}
                  />
                ) : (
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                    onBackgroundChange={fetchChatBg}
                  />
                )}
              </Flex>
            </Flex>
          </Box>

          {/* Chat Body & Message Stream */}
          <Box
            display="flex"
            flexDir="column"
            justifyContent="space-between"
            p={{ base: 3, md: 4 }}
            bg={chatBg.type === "image" ? "transparent" : chatBg.value}
            backgroundImage={chatBg.type === "image" ? `url(${chatBg.value})` : undefined}
            backgroundSize={chatBg.type === "image" ? "cover" : undefined}
            backgroundPosition={chatBg.type === "image" ? "center" : undefined}
            w="100%"
            flex="1"
            minH="0"
            borderRadius="0 0 18px 18px"
            position="relative"
            overflow="hidden"
          >
            {loading ? (
              <Flex justify="center" align="center" h="100%">
                <Spinner size="xl" color="purple.500" thickness="4px" speed="0.65s" />
              </Flex>
            ) : (
              <Box flex="1" minH="0" overflow="hidden" display="flex" flexDirection="column" mb={3}>
                <ScrollableChat messages={messages} socket={socketRef.current} />
              </Box>
            )}

            {/* Typing indicator & Message Input Bar */}
            <FormControl onKeyDown={sendMessage} id="message-input-form" isRequired flexShrink={0}>
              {istyping && (
                <Box mb={2} p={1.5} bg="rgba(255, 255, 255, 0.85)" backdropFilter="blur(8px)" borderRadius="lg" w="fit-content">
                  <Lottie options={defaultOptions} width={36} style={{ marginLeft: 0 }} />
                </Box>
              )}

              <Flex
                position="relative"
                alignItems="center"
                bg="white"
                borderRadius="full"
                boxShadow="0 4px 20px rgba(0, 0, 0, 0.12)"
                border="1px solid rgba(107, 70, 193, 0.25)"
                p="3px"
              >
                <Input
                  variant="unstyled"
                  placeholder="Type your message in YapMonster..."
                  value={newMessage}
                  onChange={typingHandler}
                  _placeholder={{ color: "gray.400", fontSize: "sm" }}
                  color="gray.800"
                  px={5}
                  py={2.5}
                  fontSize="sm"
                  fontWeight="500"
                />
                <IconButton
                  icon={<Icon as={ArrowForwardIcon} />}
                  onClick={sendMessage}
                  bg="linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)"
                  color="white"
                  borderRadius="full"
                  size="sm"
                  isDisabled={!newMessage.trim()}
                  _hover={{
                    transform: "scale(1.08)",
                    boxShadow: "0 4px 14px rgba(90, 103, 216, 0.5)",
                  }}
                  _active={{ transform: "scale(0.96)" }}
                  transition="all 0.2s ease-in-out"
                  aria-label="Send message"
                />
              </Flex>
            </FormControl>
          </Box>
        </>
      ) : (
        /* Empty State */
        <Flex
          direction="column"
          alignItems="center"
          justifyContent="center"
          h="100%"
          w="100%"
          bg="rgba(5, 11, 28, 0.75)"
          backdropFilter="blur(20px)"
          borderRadius="24px"
          border="1px solid rgba(255, 255, 255, 0.06)"
          p={8}
          textAlign="center"
        >
          <VStack spacing={5} maxW="440px">
            <Box
              p={6}
              bg="rgba(255, 255, 255, 0.08)"
              backdropFilter="blur(10px)"
              borderRadius="3xl"
              boxShadow="0 12px 36px rgba(0, 0, 0, 0.5)"
              border="1px solid rgba(255, 255, 255, 0.12)"
            >
              <Icon as={FaComments} w={12} h={12} color="#BAE6FD" />
            </Box>

            <Box>
              <YapMonsterWordmark size="xl" color="lightBlue" glow={true} />
              <Text fontSize="md" color="white" fontWeight="700" mt={2}>
                Where Conversations Come Alive
              </Text>
            </Box>

            <Text fontSize="sm" color="rgba(255, 255, 255, 0.7)" lineHeight={1.6}>
              Select a conversation from the sidebar or click <b>Find User</b> to start a private chat or multi-person group room.
            </Text>
          </VStack>
        </Flex>
      )}

      {/* Video Call Modal */}
      {videoCallData && (
        <VideoCallModal
          isOpen={videoCallOpen}
          onClose={() => setVideoCallOpen(false)}
          chatId={videoCallData.chatId}
          chatName={videoCallData.chatName}
          isGroupChat={videoCallData.isGroupChat}
          user={user}
          socketRef={socketRef}
        />
      )}

      {/* Incoming Call Ringing Alert */}
      {incomingCall && (
        <IncomingCallModal
          isOpen={!!incomingCall}
          caller={incomingCall.caller}
          chatName={incomingCall.chatName}
          isGroupChat={incomingCall.isGroupChat}
          onAccept={handleAcceptIncomingCall}
          onDecline={handleDeclineIncomingCall}
        />
      )}
    </Box>
  );
};

export default SingleChat;
