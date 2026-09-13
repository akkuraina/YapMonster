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
        <ModalOverlay bg="rgba(0, 0, 0, 0.75)" backdropFilter="blur(8px)" />
        <ModalContent
          bg="linear-gradient(180deg, #050a1f 0%, #020617 100%)"
          color="white"
          borderRadius="24px"
          border="1px solid rgba(255, 255, 255, 0.1)"
          boxShadow="0 24px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(90, 103, 216, 0.2)"
          overflow="hidden"
        >
          <ModalHeader
            fontSize="xl"
            fontWeight="800"
            fontFamily="'Plus Jakarta Sans', sans-serif"
            display="flex"
            justifyContent="center"
            bg="rgba(10, 18, 42, 0.95)"
            color="white"
            borderBottom="1px solid rgba(255, 255, 255, 0.08)"
            py={4}
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton color="white" borderRadius="full" _hover={{ bg: "rgba(255, 255, 255, 0.1)" }} />
          <ModalBody
            display="flex"
            flexDirection="column"
            alignItems="center"
            bg="transparent"
            p={6}
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
            <VStack spacing={5} w="100%">
              {/* Group Profile Picture Section */}
              <Box position="relative">
                <Avatar
                  size="xl"
                  cursor="pointer"
                  name={groupChatName || "Group"}
                  src={groupPic}
                  border="3px solid #60A5FA"
                  boxShadow="0 0 20px rgba(96, 165, 250, 0.35)"
                  onClick={triggerFileInput}
                  _hover={{ opacity: 0.85, transform: "scale(1.02)" }}
                  transition="all 0.2s ease"
                  bg={groupPic ? "transparent" : "rgba(90, 103, 216, 0.4)"}
                />
                <IconButton
                  icon={<EditIcon />}
                  size="sm"
                  bg="linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)"
                  color="white"
                  position="absolute"
                  bottom="0"
                  right="0"
                  borderRadius="full"
                  border="2px solid #020617"
                  onClick={triggerFileInput}
                  _hover={{ transform: "scale(1.1)", filter: "brightness(1.15)" }}
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
              <FormControl isRequired>
                <FormLabel color="rgba(255, 255, 255, 0.85)" fontSize="xs" fontWeight="700" letterSpacing="0.04em" textTransform="uppercase">
                  Group Name
                </FormLabel>
                <Input
                  placeholder="e.g. Design Team, Study Group"
                  value={groupChatName || ""}
                  onChange={(e) => setGroupChatName(e.target.value)}
                  bg="rgba(255, 255, 255, 0.06)"
                  border="1px solid rgba(255, 255, 255, 0.12)"
                  color="white"
                  borderRadius="xl"
                  fontSize="sm"
                  h="44px"
                  _placeholder={{ color: "rgba(255, 255, 255, 0.45)" }}
                  _focus={{
                    borderColor: "#60A5FA",
                    bg: "rgba(255, 255, 255, 0.09)",
                    boxShadow: "0 0 0 1px #60A5FA",
                  }}
                />
              </FormControl>

              {/* Add Users Section */}
              <FormControl>
                <FormLabel color="rgba(255, 255, 255, 0.85)" fontSize="xs" fontWeight="700" letterSpacing="0.04em" textTransform="uppercase">
                  Add Members
                </FormLabel>
                <Input
                  placeholder="Search users by name or email..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  bg="rgba(255, 255, 255, 0.06)"
                  border="1px solid rgba(255, 255, 255, 0.12)"
                  color="white"
                  borderRadius="xl"
                  fontSize="sm"
                  h="44px"
                  _placeholder={{ color: "rgba(255, 255, 255, 0.45)" }}
                  _focus={{
                    borderColor: "#60A5FA",
                    bg: "rgba(255, 255, 255, 0.09)",
                    boxShadow: "0 0 0 1px #60A5FA",
                  }}
                />
              </FormControl>

              {/* Selected Users Display */}
              {selectedUsers.length > 0 && (
                <Box
                  w="100%"
                  display="flex"
                  flexWrap="wrap"
                  bg="rgba(255, 255, 255, 0.04)"
                  border="1px solid rgba(255, 255, 255, 0.08)"
                  p={2.5}
                  borderRadius="xl"
                  gap={1}
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
                <Text color="#BAE6FD" fontSize="xs" fontWeight="600">Searching users...</Text>
              ) : (
                <VStack spacing={1.5} w="100%" align="stretch">
                  {searchResult
                    ?.slice(0, 4)
                    .map((u) => (
                      <UserListItem
                        key={u._id}
                        user={u}
                        handleFunction={() => handleGroup(u)}
                      />
                    ))}
                </VStack>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter bg="rgba(4, 9, 24, 0.95)" borderTop="1px solid rgba(255, 255, 255, 0.08)" py={3.5} px={6}>
            <Button
              onClick={handleSubmit}
              bg="linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)"
              color="white"
              borderRadius="xl"
              px={6}
              h="42px"
              fontWeight="700"
              fontSize="sm"
              _hover={{ transform: "translateY(-1px)", boxShadow: "0 6px 20px rgba(90, 103, 216, 0.5)" }}
              _active={{ transform: "translateY(0)" }}
              transition="all 0.2s ease"
            >
              Create Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;
