import React, { useState, useRef } from "react";
import { ViewIcon, EditIcon } from "@chakra-ui/icons";
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
  IconButton,
  Spinner,
  Avatar,
  VStack,
  HStack,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";
import config from "../../config/config";
import { SketchPicker } from "react-color";

const UpdateGroupChatModal = ({ fetchMessages, fetchAgain, setFetchAgain, onBackgroundChange }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameloading, setRenameLoading] = useState(false);
  const [groupPic, setGroupPic] = useState("");
  const [picLoading, setPicLoading] = useState(false);
  const fileInputRef = useRef();
  const toast = useToast();
  const [bgType, setBgType] = useState("color");
  const [bgColor, setBgColor] = useState("#f8fafc");
  const [bgImage, setBgImage] = useState("");
  const [bgLoading, setBgLoading] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);

  const { selectedChat, setSelectedChat, user } = ChatState();

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
      console.log(data);
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
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!groupChatName) return;

    try {
      setRenameLoading(true);
      const config_headers = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `${config.BACKEND_URL}/api/chat/rename`,
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config_headers
      );

      console.log(data._id);
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response?.data?.message || "Error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setRenameLoading(false);
    }
    setGroupChatName("");
  };

  const handleUpdateGroupPic = async () => {
    if (!groupPic) {
      toast({
        title: "Error",
        description: "Please select an image first",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    console.log("Updating group picture for chat:", selectedChat._id);
    console.log("Group picture length:", groupPic.length);
    console.log("Group picture preview:", groupPic.substring(0, 50) + "...");

    try {
      setPicLoading(true);
      const config_headers = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      
      const requestData = {
        chatId: selectedChat._id,
        groupPic: groupPic,
      };
      
      console.log("Sending request to:", `${config.BACKEND_URL}/api/chat/update-picture`);
      console.log("Request data:", requestData);
      
      const { data } = await axios.put(
        `${config.BACKEND_URL}/api/chat/update-picture`,
        requestData,
        config_headers
      );

      console.log("Response received:", data);
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setPicLoading(false);
      setGroupPic("");
      
      toast({
        title: "Success",
        description: "Group picture updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      console.error("Error updating group picture:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update group picture",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
    }
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

  const handleAddUser = async (user1) => {
    if (selectedChat.users.find((u) => u._id === user1._id)) {
      toast({
        title: "User Already in group!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: "Only admins can add someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      setLoading(true);
      const config_headers = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `${config.BACKEND_URL}/api/chat/groupadd`,
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config_headers
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response?.data?.message || "Error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
    setGroupChatName("");
  };

  const handleRemove = async (user1) => {
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      toast({
        title: "Only admins can remove someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      setLoading(true);
      const config_headers = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `${config.BACKEND_URL}/api/chat/groupremove`,
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config_headers
      );

      user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessages();
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response?.data?.message || "Error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
    setGroupChatName("");
  };

  // Fetch current background on open
  const fetchBackground = async () => {
    try {
      setBgLoading(true);
      const config_headers = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.get(`${config.BACKEND_URL}/api/user/chat-background/${selectedChat._id}`, config_headers);
      if (data) {
        setBgType(data.type);
        if (data.type === "color") setBgColor(data.value);
        if (data.type === "image") setBgImage(data.value);
      } else {
        setBgType("color");
        setBgColor("#f8fafc");
        setBgImage("");
      }
      setBgLoading(false);
    } catch (err) {
      setBgLoading(false);
    }
  };

  // Call fetchBackground when modal opens
  React.useEffect(() => {
    if (isOpen && selectedChat) fetchBackground();
    // eslint-disable-next-line
  }, [isOpen, selectedChat]);

  const handleBgImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", status: "error", duration: 3000, isClosable: true, position: "bottom" });
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast({ title: "Invalid file type", status: "error", duration: 3000, isClosable: true, position: "bottom" });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => setBgImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBackground = async () => {
    try {
      setBgLoading(true);
      const config_headers = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const payload = bgType === "color"
        ? { type: "color", value: bgColor }
        : { type: "image", value: bgImage };
      await axios.put(`${config.BACKEND_URL}/api/user/chat-background/${selectedChat._id}`, payload, config_headers);
      setBgLoading(false);
      toast({ title: "Background updated!", status: "success", duration: 2000, isClosable: true, position: "bottom" });
      setShowBgPicker(false);
      if (typeof onBackgroundChange === "function") onBackgroundChange();
    } catch (err) {
      setBgLoading(false);
      toast({ title: "Failed to update background", status: "error", duration: 3000, isClosable: true, position: "bottom" });
    }
  };

  return (
    <>
      <IconButton d={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />

      <Modal onClose={onClose} isOpen={isOpen} isCentered size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            d="flex"
            justifyContent="center"
            bg="linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)"
            color="white"
          >
            {selectedChat.chatName}
          </ModalHeader>

          <ModalCloseButton color="white" />
          <ModalBody 
            d="flex" 
            flexDir="column" 
            alignItems="center"
            bg="#E6E6FA"
            overflowY="auto"
            maxH="70vh"
            p={6}
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
            <VStack spacing={6} w="100%">
              {/* Group Profile Picture Section */}
              <Box position="relative">
                <Avatar
                  size="xl"
                  cursor="pointer"
                  name={selectedChat.chatName}
                  src={groupPic || selectedChat.groupPic}
                  border="4px solid"
                  borderColor="purple.500"
                  onClick={triggerFileInput}
                  _hover={{ opacity: 0.8 }}
                  bg={groupPic || selectedChat.groupPic ? "transparent" : "purple.600"}
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

              {/* Change Chat Background Section */}
              <Box w="100%" mt={2} mb={2}>
                <Button
                  size="sm"
                  colorScheme="purple"
                  variant="outline"
                  onClick={() => setShowBgPicker((v) => !v)}
                  mb={2}
                >
                  Change Chat Background
                </Button>
                {showBgPicker && (
                  <Box p={3} borderRadius="lg" bg="#f8fafc" boxShadow="md" mt={2}>
                    <HStack mb={2}>
                      <Button
                        size="xs"
                        colorScheme={bgType === "color" ? "purple" : "gray"}
                        variant={bgType === "color" ? "solid" : "outline"}
                        onClick={() => setBgType("color")}
                      >
                        Solid Color
                      </Button>
                      <Button
                        size="xs"
                        colorScheme={bgType === "image" ? "purple" : "gray"}
                        variant={bgType === "image" ? "solid" : "outline"}
                        onClick={() => setBgType("image")}
                      >
                        Image
                      </Button>
                    </HStack>
                    {bgType === "color" && (
                      <Box>
                        <SketchPicker
                          color={bgColor}
                          onChangeComplete={(color) => setBgColor(color.hex)}
                          disableAlpha
                        />
                        <Box mt={2} w="100%" h="40px" borderRadius="md" bg={bgColor} border="1px solid #ccc" />
                      </Box>
                    )}
                    {bgType === "image" && (
                      <Box>
                        <Input type="file" accept="image/*" onChange={handleBgImageUpload} mb={2} />
                        {bgImage && (
                          <Box mt={2} w="100%" h="80px" borderRadius="md" bg="#eee" backgroundImage={`url(${bgImage})`} backgroundSize="cover" backgroundPosition="center" />
                        )}
                      </Box>
                    )}
                    <Button
                      size="sm"
                      colorScheme="purple"
                      mt={3}
                      isLoading={bgLoading}
                      onClick={handleSaveBackground}
                      w="100%"
                    >
                      Save Background
                    </Button>
                  </Box>
                )}
              </Box>

              {/* Group Members */}
              <Box w="100%">
                <Text color="purple.700" fontWeight="600" mb={3}>
                  Group Members
                </Text>
                <Box d="flex" flexWrap="wrap" pb={3}>
                  {selectedChat.users.map((u) => (
                    <UserBadgeItem
                      key={u._id}
                      user={u}
                      admin={selectedChat.groupAdmin}
                      handleFunction={() => handleRemove(u)}
                    />
                  ))}
                </Box>
              </Box>

              {/* Rename Group */}
              <FormControl>
                <FormLabel color="purple.700" fontWeight="600">
                  Rename Group
                </FormLabel>
                <HStack>
                  <Input
                    placeholder="New group name"
                    value={groupChatName || ""}
                    onChange={(e) => setGroupChatName(e.target.value)}
                    bg="white"
                    focusBorderColor="purple.500"
                    borderColor="purple.300"
                  />
                  <Button
                    variant="solid"
                    bg="linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)"
                    color="white"
                    isLoading={renameloading}
                    onClick={handleRename}
                    _hover={{ bg: "linear-gradient(135deg, #6B46C1 0%, #7C3AED 100%)" }}
                  >
                    Update
                  </Button>
                </HStack>
              </FormControl>

              {/* Add User */}
              <FormControl>
                <FormLabel color="purple.700" fontWeight="600">
                  Add Member
                </FormLabel>
                <Input
                  placeholder="Search users to add"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  bg="white"
                  focusBorderColor="purple.500"
                  borderColor="purple.300"
                />
              </FormControl>

              {/* Search Results */}
              {loading ? (
                <Spinner size="lg" />
              ) : (
                searchResult?.map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleAddUser(user)}
                  />
                ))
              )}
            </VStack>
          </ModalBody>
          <ModalFooter bg="linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)">
            <Button onClick={() => handleRemove(user)} colorScheme="red">
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;