import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text, Button, useToast, useDisclosure, Flex, Input, Spinner } from "@chakra-ui/react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/modal";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import UserListItem from "./userAvatar/UserListItem";
import { ChatState } from "../Context/ChatProvider";
import config from "../config/config";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

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
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please Enter something to search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`${config.BACKEND_URL}/api/user?search=${search}`, config);

      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`${config.BACKEND_URL}/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  return (
    <Box
      d={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={6}
      bg="linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)"
      w={{ base: "100%", md: "100%" }}
      borderRadius="20px"
      border="2px solid"
      borderColor="purple.700"
      overflow="hidden"
      boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
      h="100%"
    >
      <Box
        pb={4}
        px={4}
        fontSize={{ base: "2xl", md: "3xl" }}
        fontFamily="'Poppins', sans-serif"
        fontWeight="700"
        d="flex"
        w="100%"
        overflow="hidden"
        justifyContent="space-between"
        alignItems="center"
        color="white"
        mb={4}
      >
        <Text
          sx={{
            background: "linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)"
          }}
        >
          My Chats
        </Text>
        <Flex gap={2} alignItems="center">
          <Button
            d="flex"
            fontSize={{ base: "sm", md: "md" }}
            rightIcon={<AddIcon />}
            bg="linear-gradient(135deg, #E6E6FA 0%, #D8BFD8 100%)"
            backdropFilter="blur(10px)"
            border="2px solid rgba(230, 230, 250, 0.5)"
            color="#4A148C"
            borderRadius="full"
            px={4}
            py={2}
            h="40px"
            mt={1}
            fontWeight="600"
            onClick={onOpen}
            _hover={{ 
              bg: "linear-gradient(135deg, #D8BFD8 0%, #DDA0DD 100%)",
              transform: "translateY(-2px)",
              boxShadow: "0 8px 25px rgba(230, 230, 250, 0.4)",
              transition: "all 0.3s ease-in-out"
            }}
            transition="all 0.3s ease-in-out"
          >
            New Chat
          </Button>
          <GroupChatModal>
            <Button
              d="flex"
              fontSize={{ base: "sm", md: "md" }}
              rightIcon={<AddIcon />}
              bg="linear-gradient(135deg, #4A148C 0%, #6A0DAD 100%)"
              backdropFilter="blur(10px)"
              border="2px solid rgba(74, 20, 140, 0.5)"
              color="white"
              borderRadius="full"
              px={4}
              py={2}
              h="40px"
              fontWeight="600"
              _hover={{ 
                bg: "linear-gradient(135deg, #6A0DAD 0%, #8B008B 100%)",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 25px rgba(74, 20, 140, 0.4)",
                transition: "all 0.3s ease-in-out"
              }}
              transition="all 0.3s ease-in-out"
            >
              New Group
            </Button>
          </GroupChatModal>
        </Flex>
      </Box>
      <Box
        d="flex"
        flexDir="column"
        p={4}
        bg="rgba(255, 255, 255, 0.1)"
        backdropFilter="blur(10px)"
        w="100%"
        h="calc(100% - 120px)"
        borderRadius="16px"
        overflow="hidden"
        border="1px solid rgba(255, 255, 255, 0.2)"
        boxShadow="inset 0 2px 8px rgba(0, 0, 0, 0.1)"
      >
        {chats ? (
          <Stack 
            overflowY="auto" 
            spacing={3}
            h="100%"
            pr={2}
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
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.1)"}
                color="white"
                px={4}
                py={3}
                borderRadius="12px"
                key={chat._id}
                border="1px solid"
                borderColor={selectedChat === chat ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0.2)"}
                _hover={{
                  bg: "rgba(255, 255, 255, 0.2)",
                  transform: "translateX(5px)",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
                  transition: "all 0.3s ease-in-out"
                }}
                transition="all 0.3s ease-in-out"
                position="relative"
                minH="60px"
                _before={{
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: selectedChat === chat 
                    ? "linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)"
                    : "transparent",
                  borderRadius: "12px",
                  zIndex: -1
                }}
              >
                <Text
                  fontWeight="600"
                  fontSize="md"
                  mb={1}
                  textShadow="0 1px 2px rgba(0, 0, 0, 0.3)"
                  wordBreak="break-word"
                  overflowWrap="break-word"
                  color={chat.isGroupChat ? "#4A148C" : "#E6E6FA"}
                >
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </Text>
                {chat.latestMessage && (
                  <Text 
                    fontSize="sm" 
                    opacity="0.8"
                    lineHeight="1.4"
                    wordBreak="break-word"
                    overflowWrap="break-word"
                  >
                    <Text as="span" fontWeight="600">
                      {chat.latestMessage.sender.name}:
                    </Text>{" "}
                    {chat.latestMessage.content.length > 50
                      ? chat.latestMessage.content.substring(0, 51) + "..."
                      : chat.latestMessage.content}
                  </Text>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>

      {/* New Chat Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay bg="rgba(0, 0, 0, 0.4)" backdropFilter="blur(4px)" />
        <ModalContent 
          bg="#E6E6FA"
          borderRadius="20px"
          boxShadow="0 20px 40px rgba(0, 0, 0, 0.15)"
        >
          <ModalHeader 
            borderBottomWidth="2px" 
            borderColor="purple.300"
            bg="linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)"
            color="white"
            fontSize="xl"
            fontWeight="700"
            fontFamily="'Poppins', sans-serif"
            borderRadius="20px 20px 0 0"
          >
            New Chat
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody 
            bg="#E6E6FA"
            overflowY="auto"
            maxH="400px"
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
            <Box d="flex" pb={4} gap={3}>
              <Input
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                focusBorderColor="purple.500"
                borderColor="purple.300"
                borderRadius="lg"
                bg="white"
                boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
                _focus={{
                  boxShadow: "0 4px 16px rgba(90, 103, 216, 0.3)",
                  transform: "translateY(-1px)",
                  transition: "all 0.2s ease-in-out"
                }}
                transition="all 0.2s ease-in-out"
              />
              <Button 
                onClick={handleSearch} 
                bg="linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)"
                color="white"
                borderRadius="lg"
                px={6}
                fontWeight="600"
                _hover={{
                  bg: "linear-gradient(135deg, #6B46C1 0%, #7C3AED 100%)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 8px 25px rgba(90, 103, 216, 0.4)",
                  transition: "all 0.2s ease-in-out"
                }}
                transition="all 0.2s ease-in-out"
              >
                Search
              </Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" d="flex" color="purple.600" />}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MyChats;
