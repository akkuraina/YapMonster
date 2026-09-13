import React, { useState, useRef, useEffect } from "react";
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
  IconButton,
  Text,
  Avatar,
  Input,
  FormControl,
  FormLabel,
  VStack,
  HStack,
  useToast,
  Box,
} from "@chakra-ui/react";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider";
import config from "../../config/config";
import { SketchPicker } from "react-color";

const ProfileModal = ({ user, children, chatId, onBackgroundChange }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [pic, setPic] = useState(user?.pic || "");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();
  const toast = useToast();
  
  const { setUser, user: currentUser } = ChatState();

  // Check if this is the current user's profile or another user's profile
  const isOwnProfile = user?._id === currentUser?._id;

  // Chat background state (for personal chat context)
  const [bgColor, setBgColor] = useState("#f8fafc");
  const [bgLoading, setBgLoading] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);

  // Fetch current background for this chat (if chatId is provided)
  const fetchBackground = async () => {
    if (!chatId || !currentUser?.token) return;
    try {
      setBgLoading(true);
      const config_headers = { headers: { Authorization: `Bearer ${currentUser.token}` } };
      const { data } = await axios.get(`${config.BACKEND_URL}/api/user/chat-background/${chatId}`, config_headers);
      if (data) {
        if (data.type === "color") setBgColor(data.value);
      } else {
        setBgColor("#f8fafc");
      }
      setBgLoading(false);
    } catch (error) {
      console.error("Fetch background error:", error);
      setBgLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && chatId && currentUser?.token) {
      fetchBackground();
    }
    // eslint-disable-next-line
  }, [isOpen, chatId, currentUser?.token]);

  // Safety check - if no user is provided, don't render anything
  if (!user) {
    return null;
  }

  const handleEdit = () => {
    setIsEditing(true);
    setName(user?.name || "");
    setPic(user?.pic || "");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setName(user?.name || "");
    setPic(user?.pic || "");
  };

  const handleSave = async () => {
    if (!isOwnProfile) {
      toast({
        title: "Error",
        description: "You can only edit your own profile",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    setLoading(true);
    try {
      const config_headers = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        `${config.BACKEND_URL}/api/user/profile`,
        { name: name.trim(), pic },
        config_headers
      );

      // Update the user context with new data
      setUser(data);
      
      // Update localStorage
      localStorage.setItem("userInfo", JSON.stringify(data));

      toast({
        title: "Success",
        description: "Profile updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update profile",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPic(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSaveBackground = async () => {
    if (!chatId) {
      console.error("No chatId provided for background update");
      toast({ title: "Error", description: "No chat ID provided", status: "error", duration: 3000, isClosable: true, position: "bottom" });
      return;
    }
    
    if (!currentUser?.token) {
      console.error("No user token available for background update");
      toast({ title: "Error", description: "Authentication required", status: "error", duration: 3000, isClosable: true, position: "bottom" });
      return;
    }

    try {
      setBgLoading(true);
      const config_headers = { headers: { Authorization: `Bearer ${currentUser.token}` } };
      console.log("[ProfileModal] Using token for background update:", currentUser.token);
      console.log("[ProfileModal] Chat ID:", chatId);
      console.log("[ProfileModal] Background color:", bgColor);
      
      const payload = { type: "color", value: bgColor };
      
      console.log("[ProfileModal] Request payload:", payload);
      console.log("[ProfileModal] Request URL:", `${config.BACKEND_URL}/api/user/chat-background/${chatId}`);
      
      const response = await axios.put(`${config.BACKEND_URL}/api/user/chat-background/${chatId}`, payload, config_headers);
      console.log("[ProfileModal] Response:", response.data);
      
      setBgLoading(false);
      toast({ title: "Background updated!", status: "success", duration: 2000, isClosable: true, position: "bottom" });
      setShowBgPicker(false);
      if (typeof onBackgroundChange === "function") onBackgroundChange();
    } catch (error) {
      console.error("Background update error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      setBgLoading(false);
      toast({ 
        title: "Failed to update background", 
        description: error.response?.data?.message || error.message || "Unknown error",
        status: "error", 
        duration: 3000, 
        isClosable: true, 
        position: "bottom" 
      });
    }
  };

  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton
          display={{ base: "flex" }}
          icon={<ViewIcon />}
          onClick={onOpen}
          colorScheme="purple"
        />
      )}
      <Modal onClose={onClose} isOpen={isOpen} isCentered size="md">
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
            {isEditing ? "Edit Profile" : (isOwnProfile ? user?.name : "User Profile")}
          </ModalHeader>
          <ModalCloseButton color="white" borderRadius="full" _hover={{ bg: "rgba(255, 255, 255, 0.1)" }} />
          <ModalBody
            display="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="space-between"
            bg="transparent"
            p={6}
          >
            <VStack spacing={5} w="100%">
              {/* Profile Picture Section */}
              <Box position="relative">
                <Avatar
                  size="2xl"
                  cursor={isEditing && isOwnProfile ? "pointer" : "default"}
                  name={user?.name}
                  src={isEditing ? pic : user?.pic}
                  border="3px solid #60A5FA"
                  boxShadow="0 0 24px rgba(96, 165, 250, 0.35)"
                  onClick={isEditing && isOwnProfile ? triggerFileInput : undefined}
                  _hover={isEditing && isOwnProfile ? { opacity: 0.85, transform: "scale(1.02)" } : {}}
                  transition="all 0.2s ease"
                />
                {isEditing && isOwnProfile && (
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
                    aria-label="Edit profile picture"
                    _hover={{ transform: "scale(1.1)", filter: "brightness(1.15)" }}
                  />
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  style={{ display: "none" }}
                />
              </Box>

              {/* Chat Background Picker for Personal Chat */}
              {!isEditing && chatId && (
                <Box w="100%" mt={2} mb={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    borderColor="rgba(255, 255, 255, 0.2)"
                    color="#BAE6FD"
                    _hover={{ bg: "rgba(255, 255, 255, 0.08)" }}
                    onClick={() => setShowBgPicker((v) => !v)}
                    mb={2}
                    borderRadius="xl"
                    w="100%"
                  >
                    Change Chat Background
                  </Button>
                  {showBgPicker && (
                    <Box p={3} borderRadius="xl" bg="rgba(255, 255, 255, 0.06)" border="1px solid rgba(255, 255, 255, 0.12)" mt={2}>
                      <Box>
                        <SketchPicker
                          color={bgColor}
                          onChangeComplete={(color) => setBgColor(color.hex)}
                          disableAlpha
                        />
                        <Box mt={2} w="100%" h="36px" borderRadius="lg" bg={bgColor} border="1px solid rgba(255, 255, 255, 0.2)" />
                      </Box>
                      <Button
                        size="sm"
                        bg="linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)"
                        color="white"
                        mt={3}
                        isLoading={bgLoading}
                        onClick={handleSaveBackground}
                        borderRadius="xl"
                        w="100%"
                        _hover={{ filter: "brightness(1.1)" }}
                      >
                        Save Background
                      </Button>
                    </Box>
                  )}
                </Box>
              )}

              {/* Profile Information */}
              <VStack spacing={3} w="100%">
                {isEditing ? (
                  <FormControl>
                    <FormLabel color="rgba(255, 255, 255, 0.85)" fontSize="xs" fontWeight="700" letterSpacing="0.04em" textTransform="uppercase">
                      Name
                    </FormLabel>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      bg="rgba(255, 255, 255, 0.06)"
                      border="1px solid rgba(255, 255, 255, 0.12)"
                      color="white"
                      borderRadius="xl"
                      fontSize="sm"
                      h="44px"
                      _placeholder={{ color: "rgba(255, 255, 255, 0.45)" }}
                      _focus={{ borderColor: "#60A5FA", bg: "rgba(255, 255, 255, 0.09)", boxShadow: "0 0 0 1px #60A5FA" }}
                    />
                  </FormControl>
                ) : (
                  <Text
                    fontSize="24px"
                    fontWeight="800"
                    fontFamily="'Plus Jakarta Sans', sans-serif"
                    color="white"
                    textAlign="center"
                  >
                    {user?.name}
                  </Text>
                )}

                <Text
                  fontSize="sm"
                  color="rgba(255, 255, 255, 0.65)"
                  textAlign="center"
                >
                  <b>Email: </b> {user?.email}
                </Text>
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter bg="rgba(4, 9, 24, 0.95)" borderTop="1px solid rgba(255, 255, 255, 0.08)" py={3.5} px={6}>
            <HStack spacing={3} w="100%" justify="flex-end">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleCancel}
                    bg="rgba(255, 255, 255, 0.08)"
                    color="white"
                    borderRadius="xl"
                    px={4}
                    h="38px"
                    fontSize="sm"
                    _hover={{ bg: "rgba(255, 255, 255, 0.15)" }}
                    isDisabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    bg="linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)"
                    color="white"
                    borderRadius="xl"
                    px={5}
                    h="38px"
                    fontSize="sm"
                    fontWeight="700"
                    _hover={{ transform: "translateY(-1px)", boxShadow: "0 4px 14px rgba(90, 103, 216, 0.4)" }}
                    isLoading={loading}
                    loadingText="Saving..."
                  >
                    Save
                  </Button>
                </>
              ) : (
                <>
                  {isOwnProfile && (
                    <Button
                      onClick={handleEdit}
                      bg="linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)"
                      color="white"
                      borderRadius="xl"
                      px={5}
                      h="38px"
                      fontSize="sm"
                      fontWeight="700"
                      _hover={{ transform: "translateY(-1px)", boxShadow: "0 4px 14px rgba(90, 103, 216, 0.4)" }}
                      leftIcon={<EditIcon />}
                    >
                      Edit Profile
                    </Button>
                  )}
                  <Button
                    onClick={onClose}
                    bg="rgba(255, 255, 255, 0.08)"
                    color="white"
                    borderRadius="xl"
                    px={4}
                    h="38px"
                    fontSize="sm"
                    _hover={{ bg: "rgba(255, 255, 255, 0.15)" }}
                  >
                    Close
                  </Button>
                </>
              )}
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;
