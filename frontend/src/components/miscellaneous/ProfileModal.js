import React from "react";
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
  Image,
  Avatar,
  Input,
  FormControl,
  FormLabel,
  VStack,
  HStack,
  useToast,
  Box,
  Flex,
} from "@chakra-ui/react";
import { useState, useRef } from "react";
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
  
  const { setUser } = ChatState();

  // Chat background state (for personal chat context)
  const [bgType, setBgType] = useState("color");
  const [bgColor, setBgColor] = useState("#f8fafc");
  const [bgImage, setBgImage] = useState("");
  const [bgLoading, setBgLoading] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);

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

  // Fetch current background for this chat (if chatId is provided)
  const fetchBackground = async () => {
    if (!chatId) return;
    try {
      setBgLoading(true);
      const config_headers = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${config.BACKEND_URL}/api/user/chat-background/${chatId}`, config_headers);
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
    } catch {
      setBgLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && chatId) fetchBackground();
    // eslint-disable-next-line
  }, [isOpen, chatId]);

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
    if (!chatId) return;
    try {
      setBgLoading(true);
      const config_headers = { headers: { Authorization: `Bearer ${user.token}` } };
      console.log("[ProfileModal] Using token for background update:", user.token);
      const payload = bgType === "color"
        ? { type: "color", value: bgColor }
        : { type: "image", value: bgImage };
      await axios.put(`${config.BACKEND_URL}/api/user/chat-background/${chatId}`, payload, config_headers);
      setBgLoading(false);
      toast({ title: "Background updated!", status: "success", duration: 2000, isClosable: true, position: "bottom" });
      setShowBgPicker(false);
      if (typeof onBackgroundChange === "function") onBackgroundChange();
    } catch {
      setBgLoading(false);
      toast({ title: "Failed to update background", status: "error", duration: 3000, isClosable: true, position: "bottom" });
    }
  };

  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton
          d={{ base: "flex" }}
          icon={<ViewIcon />}
          onClick={onOpen}
          colorScheme="purple"
        />
      )}
      <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent h="auto" maxH="90vh" bg="#E6E6FA">
          <ModalHeader
            fontSize="40px"
            fontFamily="Work sans"
            d="flex"
            justifyContent="center"
            bg="linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)"
            color="white"
            borderRadius="md"
          >
            {isEditing ? "Edit Profile" : user?.name}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody
            d="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="space-between"
            bg="#E6E6FA"
            p={6}
          >
            <VStack spacing={6} w="100%">
              {/* Profile Picture Section */}
              <Box position="relative">
                <Avatar
                  size="2xl"
                  cursor={isEditing ? "pointer" : "default"}
                  name={user?.name}
                  src={isEditing ? pic : user?.pic}
                  border="4px solid"
                  borderColor="purple.500"
                  onClick={isEditing ? triggerFileInput : undefined}
                  _hover={isEditing ? { opacity: 0.8 } : {}}
                />
                {isEditing && (
                  <IconButton
                    icon={<EditIcon />}
                    size="sm"
                    colorScheme="purple"
                    position="absolute"
                    bottom="0"
                    right="0"
                    borderRadius="full"
                    onClick={triggerFileInput}
                    aria-label="Edit profile picture"
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
              )}

              {/* Profile Information */}
              <VStack spacing={4} w="100%">
                {isEditing ? (
                  <FormControl>
                    <FormLabel color="purple.700" fontWeight="600">
                      Name
                    </FormLabel>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      bg="white"
                      borderColor="purple.300"
                      focusBorderColor="purple.500"
                      _hover={{ borderColor: "purple.400" }}
                    />
                  </FormControl>
                ) : (
                  <Text
                    fontSize={{ base: "28px", md: "30px" }}
                    fontFamily="Work sans"
                    color="purple.700"
                    textAlign="center"
                  >
                    {user?.name}
                  </Text>
                )}

                <Text
                  fontSize="lg"
                  fontFamily="Work sans"
                  color="purple.600"
                  textAlign="center"
                >
                  Email: {user?.email}
                </Text>
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter bg="linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)">
            <HStack spacing={3}>
              {isEditing ? (
                <>
                  <Button
                    onClick={handleCancel}
                    bg="gray.100"
                    color="gray.700"
                    _hover={{ bg: "gray.200" }}
                    isDisabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    bg="white"
                    color="purple.700"
                    _hover={{ bg: "purple.50" }}
                    isLoading={loading}
                    loadingText="Saving..."
                  >
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleEdit}
                    bg="white"
                    color="purple.700"
                    _hover={{ bg: "purple.50" }}
                    leftIcon={<EditIcon />}
                  >
                    Edit Profile
                  </Button>
                  <Button
                    onClick={onClose}
                    bg="gray.100"
                    color="gray.700"
                    _hover={{ bg: "gray.200" }}
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
