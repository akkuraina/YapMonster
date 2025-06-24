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
  FormLabel,
  Input,
  useToast,
  Box,
  Avatar,
  VStack,
  HStack,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";
import { EditIcon } from "@chakra-ui/icons";
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
  const [groupPic, setGroupPic] = useState("");
  const fileInputRef = useRef();

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

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom",
        });
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        // Compress the image if it's too large
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions (max 300x300)
          let { width, height } = img;
          const maxSize = 300;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          
          console.log("Original size:", e.target.result.length);
          console.log("Compressed size:", compressedDataUrl.length);
          
          setGroupPic(compressedDataUrl);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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
          groupPic: groupPic,
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
            maxH="70vh"
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
            <VStack spacing={4} w="100%">
              {/* Group Profile Picture Section */}
              <Box position="relative">
                <Avatar
                  size="xl"
                  cursor="pointer"
                  name={groupChatName || "Group"}
                  src={groupPic}
                  border="4px solid"
                  borderColor="purple.500"
                  onClick={triggerFileInput}
                  _hover={{ opacity: 0.8 }}
                  bg={groupPic ? "transparent" : "purple.600"}
                />
                <IconButton
                  icon={<EditIcon />}
                  size="sm"
                  colorScheme="purple"
                  position="absolute"
                  bottom="0"
                  right="0"
                  borderRadius="full"
                  onClick={triggerFileInput}
                  aria-label="Upload group picture"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  style={{ display: "none" }}
                />
              </Box>

              {/* Group Name Input */}
              <FormControl>
                <FormLabel color="purple.700" fontWeight="600">
                  Group Name
                </FormLabel>
                <Input
                  placeholder="Enter group name"
                  value={groupChatName || ""}
                  onChange={(e) => setGroupChatName(e.target.value)}
                  bg="white"
                  focusBorderColor="purple.500"
                  borderColor="purple.300"
                />
              </FormControl>

              {/* Add Users Section */}
              <FormControl>
                <FormLabel color="purple.700" fontWeight="600">
                  Add Members
                </FormLabel>
                <Input
                  placeholder="Search users e.g., John, Piyush, Jane"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  bg="white"
                  focusBorderColor="purple.500"
                  borderColor="purple.300"
                />
              </FormControl>

              {/* Selected Users Display */}
              {selectedUsers.length > 0 && (
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
              )}

              {/* Search Results */}
              {loading ? (
                <Text color="purple.600">Loading...</Text>
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
            </VStack>
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
