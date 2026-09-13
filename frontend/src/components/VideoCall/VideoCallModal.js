import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  IconButton,
  Flex,
  Text,
  Spinner,
  Box,
  useToast,
  Button,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import axios from "axios";
import config from "../../config/config";

const VideoCallModal = ({ isOpen, onClose, chatId, chatName, isGroupChat, user, socketRef }) => {
  const [token, setToken] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const toast = useToast();

  useEffect(() => {
    if (isOpen && chatId && user) {
      fetchToken();
    } else {
      setToken("");
      setServerUrl("");
      setErrorMsg("");
    }
    // eslint-disable-next-line
  }, [isOpen, chatId]);

  const fetchToken = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const authConfig = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        `${config.BACKEND_URL}/api/livekit/token`,
        { chatId },
        authConfig
      );

      setToken(data.token);
      setServerUrl(data.serverUrl);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching LiveKit token:", error);
      const message =
        error.response?.data?.message ||
        "Failed to initiate video call. Ensure LiveKit is configured.";
      setErrorMsg(message);
      setLoading(false);
      toast({
        title: "Video Call Error",
        description: message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleDisconnected = () => {
    if (socketRef?.current && chatId) {
      socketRef.current.emit("end call", { chatId, userId: user._id });
    }
    setToken("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleDisconnected}
      size="full"
      closeOnOverlayClick={false}
      isCentered
    >
      <ModalOverlay bg="rgba(0, 0, 0, 0.85)" backdropFilter="blur(12px)" />
      <ModalContent bg="#0f172a" color="white" m={0} p={0} borderRadius={0} overflow="hidden">
        {/* Custom Modern Header */}
        <ModalHeader
          bg="rgba(15, 23, 42, 0.95)"
          borderBottom="1px solid rgba(255, 255, 255, 0.1)"
          py={3}
          px={6}
        >
          <Flex justify="space-between" align="center" w="100%">
            <Flex align="center" gap={3}>
              <Box
                w="12px"
                h="12px"
                borderRadius="full"
                bg="green.400"
                boxShadow="0 0 10px #48BB78"
              />
              <Text fontSize="lg" fontWeight="bold" fontFamily="'Poppins', sans-serif">
                {chatName || (isGroupChat ? "Group Video Call" : "Video Call")}
              </Text>
            </Flex>

            <IconButton
              icon={<CloseIcon />}
              onClick={handleDisconnected}
              size="sm"
              bg="rgba(255, 255, 255, 0.1)"
              color="white"
              _hover={{ bg: "red.500", transform: "scale(1.05)" }}
              borderRadius="full"
              aria-label="Close Video Call"
            />
          </Flex>
        </ModalHeader>

        <ModalBody p={0} position="relative" h="calc(100vh - 65px)" display="flex" flexDirection="column">
          {loading && (
            <Flex justify="center" align="center" h="100%" flexDir="column" gap={4}>
              <Spinner size="xl" color="purple.400" thickness="4px" />
              <Text fontSize="md" color="gray.300">
                Connecting to video room...
              </Text>
            </Flex>
          )}

          {errorMsg && !loading && (
            <Flex justify="center" align="center" h="100%" flexDir="column" gap={4} p={6} textAlign="center">
              <Text fontSize="xl" fontWeight="bold" color="red.400">
                Connection Failed
              </Text>
              <Text fontSize="md" color="gray.300" maxW="500px">
                {errorMsg}
              </Text>
              <Flex gap={4}>
                <Button colorScheme="purple" onClick={fetchToken}>
                  Retry
                </Button>
                <Button variant="outline" colorScheme="whiteAlpha" onClick={handleDisconnected}>
                  Close
                </Button>
              </Flex>
            </Flex>
          )}

          {token && serverUrl && !loading && (
            <Box w="100%" h="100%" position="relative">
              <LiveKitRoom
                video={true}
                audio={true}
                token={token}
                serverUrl={serverUrl}
                data-lk-theme="default"
                style={{ height: "100%", width: "100%" }}
                onDisconnected={handleDisconnected}
              >
                <VideoConference />
              </LiveKitRoom>
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default VideoCallModal;
