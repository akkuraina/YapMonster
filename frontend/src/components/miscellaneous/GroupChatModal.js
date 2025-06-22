import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  FormControl,
  Input,
  useToast,
  Box,
} from "@chakra-ui/react";
import { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";
import axios from "axios";
import config from "../../config/config";

const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { user, chats, setChats } = ChatState();

  const [groupChatName, setGroupChatName] = useState();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      toast({
        title: "User already added",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      return;
    }

    try {
      setLoading(true);
      const config_headers = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`${config.BACKEND_URL}/api/user?search=${search}`, config_headers);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers) {
      toast({
        title: "Please fill all the fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      const config_headers = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        `${config.BACKEND_URL}/api/chat/group`,
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config_headers
      );
      setChats([data, ...chats]);
      onClose();
      toast({
        title: "New Group Chat Created!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: "Failed to Create the Chat!",
        description: error.response?.data || "Error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal onClose={onClose} isOpen={isOpen} isCentered size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
            bg="linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)"
            color="white"
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody
            display="flex"
            flexDirection="column"
            alignItems="center"
            bg="#E6E6FA"
            p={4}
            overflowY="auto"
            maxH="60vh"
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
            <FormControl>
              <Input
                placeholder="Chat Name"
                mb={3}
                onChange={(e) => setGroupChatName(e.target.value)}
                bg="white"
                focusBorderColor="purple.500"
                borderColor="purple.300"
              />
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add Users e.g., John, Piyush, Jane"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
                bg="white"
                focusBorderColor="purple.500"
                borderColor="purple.300"
              />
            </FormControl>
            <Box
              w="100%"
              display="flex"
              flexWrap="wrap"
              bg="purple.200"
              p={2}
              borderRadius="lg"
              mb={3}
            >
              {selectedUsers.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  handleFunction={() => handleDelete(u)}
                />
              ))}
            </Box>
            {loading ? (
              <div>Loading...</div>
            ) : (
              searchResult
                ?.slice(0, 4)
                .map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleGroup(user)}
                  />
                ))
            )}
          </ModalBody>
          <ModalFooter bg="linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)">
            <Button onClick={handleSubmit} bg="linear-gradient(135deg, #6B46C1 0%, #7C3AED 100%)" color="white" _hover={{ bg: "linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)" }}>
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;
