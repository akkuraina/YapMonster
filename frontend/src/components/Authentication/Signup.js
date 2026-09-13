import React, { useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  useToast,
  Icon,
  Avatar,
  Flex,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../config/config";

const Signup = () => {
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [pic, setPic] = useState("");
  const [picLoading, setPicLoading] = useState(false);

  const submitHandler = async () => {
    setPicLoading(true);
    if (!name || !email || !password || !confirmpassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
      setPicLoading(false);
      return;
    }
    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
      setPicLoading(false);
      return;
    }
    if (password !== confirmpassword) {
      toast({
        title: "Passwords Do Not Match",
        description: "Please verify that both passwords match.",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
      setPicLoading(false);
      return;
    }

    try {
      const config_headers = {
        headers: {
          "Content-type": "application/json",
        },
      };
      const { data } = await axios.post(
        `${config.BACKEND_URL}/api/user`,
        {
          name,
          email,
          password,
          pic,
        },
        config_headers
      );
      toast({
        title: "Account Created!",
        description: `Welcome to YapMonster, ${data.name}!`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setPicLoading(false);
      navigate("/chats");
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error.response?.data?.message || "Error creating account.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
      setPicLoading(false);
    }
  };

  const postDetails = (pics) => {
    setPicLoading(true);
    if (!pics) {
      setPicLoading(false);
      return;
    }
    if (pics.type === "image/jpeg" || pics.type === "image/png" || pics.type === "image/webp") {
      if (pics.size > 2 * 1024 * 1024) {
        toast({
          title: "Image too large",
          description: "Please select an image smaller than 2MB",
          status: "warning",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        setPicLoading(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 250;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.8);
          setPic(compressedDataUrl);
          setPicLoading(false);
        };
        img.onerror = () => {
          setPic(e.target.result);
          setPicLoading(false);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(pics);
    } else {
      toast({
        title: "Invalid file format",
        description: "Please select JPEG, PNG, or WebP.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      setPicLoading(false);
    }
  };

  return (
    <VStack spacing={{ base: 2.5, sm: 3.5 }} w="100%">
      <FormControl id="signup-name" isRequired>
        <FormLabel
          color="rgba(255, 255, 255, 0.9)"
          fontWeight="600"
          fontSize={{ base: "2xs", sm: "xs" }}
          letterSpacing="0.03em"
          textTransform="uppercase"
          mb={0.5}
        >
          Full Name
        </FormLabel>
        <Input
          value={name}
          placeholder="e.g. Alex Miller"
          onChange={(e) => setName(e.target.value)}
          bg="rgba(255, 255, 255, 0.07)"
          border="1px solid rgba(255, 255, 255, 0.15)"
          color="white"
          fontSize={{ base: "xs", sm: "sm" }}
          _placeholder={{ color: "rgba(255, 255, 255, 0.45)" }}
          _focus={{
            borderColor: "#63B3ED",
            boxShadow: "0 0 0 1px #63B3ED, 0 0 16px rgba(99, 179, 237, 0.25)",
            bg: "rgba(255, 255, 255, 0.12)",
          }}
          _hover={{
            bg: "rgba(255, 255, 255, 0.1)",
            borderColor: "rgba(255, 255, 255, 0.25)",
          }}
          borderRadius="xl"
          h={{ base: "38px", sm: "42px" }}
          transition="all 0.2s ease-in-out"
        />
      </FormControl>

      <FormControl id="signup-email" isRequired>
        <FormLabel
          color="rgba(255, 255, 255, 0.9)"
          fontWeight="600"
          fontSize={{ base: "2xs", sm: "xs" }}
          letterSpacing="0.03em"
          textTransform="uppercase"
          mb={0.5}
        >
          Email Address
        </FormLabel>
        <Input
          value={email}
          type="email"
          placeholder="name@example.com"
          onChange={(e) => setEmail(e.target.value)}
          bg="rgba(255, 255, 255, 0.07)"
          border="1px solid rgba(255, 255, 255, 0.15)"
          color="white"
          fontSize={{ base: "xs", sm: "sm" }}
          _placeholder={{ color: "rgba(255, 255, 255, 0.45)" }}
          _focus={{
            borderColor: "#63B3ED",
            boxShadow: "0 0 0 1px #63B3ED, 0 0 16px rgba(99, 179, 237, 0.25)",
            bg: "rgba(255, 255, 255, 0.12)",
          }}
          _hover={{
            bg: "rgba(255, 255, 255, 0.1)",
            borderColor: "rgba(255, 255, 255, 0.25)",
          }}
          borderRadius="xl"
          h={{ base: "38px", sm: "42px" }}
          transition="all 0.2s ease-in-out"
        />
      </FormControl>

      <FormControl id="signup-password" isRequired>
        <FormLabel
          color="rgba(255, 255, 255, 0.9)"
          fontWeight="600"
          fontSize={{ base: "2xs", sm: "xs" }}
          letterSpacing="0.03em"
          textTransform="uppercase"
          mb={0.5}
        >
          Password
        </FormLabel>
        <InputGroup size="md">
          <Input
            value={password}
            type={show ? "text" : "password"}
            placeholder="At least 6 characters"
            onChange={(e) => setPassword(e.target.value)}
            bg="rgba(255, 255, 255, 0.07)"
            border="1px solid rgba(255, 255, 255, 0.15)"
            color="white"
            fontSize={{ base: "xs", sm: "sm" }}
            _placeholder={{ color: "rgba(255, 255, 255, 0.45)" }}
            _focus={{
              borderColor: "#63B3ED",
              boxShadow: "0 0 0 1px #63B3ED, 0 0 16px rgba(99, 179, 237, 0.25)",
              bg: "rgba(255, 255, 255, 0.12)",
            }}
            _hover={{
              bg: "rgba(255, 255, 255, 0.1)",
              borderColor: "rgba(255, 255, 255, 0.25)",
            }}
            borderRadius="xl"
            h={{ base: "38px", sm: "42px" }}
            transition="all 0.2s ease-in-out"
          />
          <InputRightElement h={{ base: "38px", sm: "42px" }} pr={1}>
            <Button
              h="26px"
              w="26px"
              minW="26px"
              p={0}
              size="sm"
              onClick={() => setShow(!show)}
              bg="rgba(255, 255, 255, 0.1)"
              color="rgba(255, 255, 255, 0.8)"
              _hover={{ bg: "rgba(255, 255, 255, 0.2)", color: "white" }}
              borderRadius="lg"
            >
              <Icon as={show ? ViewOffIcon : ViewIcon} fontSize="xs" />
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl id="signup-confirm-password" isRequired>
        <FormLabel
          color="rgba(255, 255, 255, 0.9)"
          fontWeight="600"
          fontSize={{ base: "2xs", sm: "xs" }}
          letterSpacing="0.03em"
          textTransform="uppercase"
          mb={0.5}
        >
          Confirm Password
        </FormLabel>
        <InputGroup size="md">
          <Input
            value={confirmpassword}
            type={showConfirm ? "text" : "password"}
            placeholder="Re-enter password"
            onChange={(e) => setConfirmpassword(e.target.value)}
            bg="rgba(255, 255, 255, 0.07)"
            border="1px solid rgba(255, 255, 255, 0.15)"
            color="white"
            fontSize={{ base: "xs", sm: "sm" }}
            _placeholder={{ color: "rgba(255, 255, 255, 0.45)" }}
            _focus={{
              borderColor: "#63B3ED",
              boxShadow: "0 0 0 1px #63B3ED, 0 0 16px rgba(99, 179, 237, 0.25)",
              bg: "rgba(255, 255, 255, 0.12)",
            }}
            _hover={{
              bg: "rgba(255, 255, 255, 0.1)",
              borderColor: "rgba(255, 255, 255, 0.25)",
            }}
            borderRadius="xl"
            h={{ base: "38px", sm: "42px" }}
            transition="all 0.2s ease-in-out"
          />
          <InputRightElement h={{ base: "38px", sm: "42px" }} pr={1}>
            <Button
              h="26px"
              w="26px"
              minW="26px"
              p={0}
              size="sm"
              onClick={() => setShowConfirm(!showConfirm)}
              bg="rgba(255, 255, 255, 0.1)"
              color="rgba(255, 255, 255, 0.8)"
              _hover={{ bg: "rgba(255, 255, 255, 0.2)", color: "white" }}
              borderRadius="lg"
            >
              <Icon as={showConfirm ? ViewOffIcon : ViewIcon} fontSize="xs" />
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl id="signup-pic">
        <FormLabel
          color="rgba(255, 255, 255, 0.9)"
          fontWeight="600"
          fontSize={{ base: "2xs", sm: "xs" }}
          letterSpacing="0.03em"
          textTransform="uppercase"
          mb={0.5}
        >
          Profile Avatar (Optional)
        </FormLabel>
        <Flex align="center" gap={2.5} w="100%">
          <Avatar
            size={{ base: "xs", sm: "sm" }}
            src={pic}
            name={name || "User"}
            border="2px solid rgba(255, 255, 255, 0.2)"
            flexShrink={0}
          />
          <Input
            type="file"
            p={1}
            accept="image/*"
            onChange={(e) => postDetails(e.target.files[0])}
            bg="rgba(255, 255, 255, 0.07)"
            border="1px solid rgba(255, 255, 255, 0.15)"
            color="white"
            fontSize="xs"
            borderRadius="xl"
            h={{ base: "36px", sm: "40px" }}
            flex="1"
            minW="0"
            sx={{
              "&::file-selector-button": {
                bg: "rgba(255, 255, 255, 0.15)",
                border: "none",
                color: "white",
                borderRadius: "md",
                padding: "3px 7px",
                marginRight: "6px",
                cursor: "pointer",
                fontSize: "2xs",
                fontWeight: "600",
                "&:hover": { bg: "rgba(255, 255, 255, 0.25)" },
              },
            }}
          />
        </Flex>
      </FormControl>

      <Button
        width="100%"
        onClick={submitHandler}
        isLoading={picLoading}
        bg="linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)"
        color="white"
        h={{ base: "44px", sm: "48px" }}
        borderRadius="xl"
        fontWeight="700"
        fontSize={{ base: "xs", sm: "sm" }}
        letterSpacing="0.02em"
        boxShadow="0 8px 20px rgba(90, 103, 216, 0.35)"
        _hover={{
          transform: "translateY(-1px)",
          boxShadow: "0 12px 28px rgba(90, 103, 216, 0.5)",
          filter: "brightness(1.08)",
        }}
        _active={{
          transform: "translateY(0)",
          boxShadow: "0 4px 12px rgba(90, 103, 216, 0.3)",
        }}
        transition="all 0.2s ease-in-out"
        mt={{ base: 2.5, sm: 3.5 }}
        mb={{ base: 1, sm: 0 }}
      >
        Create Free Account
      </Button>
    </VStack>
  );
};

export default Signup;
