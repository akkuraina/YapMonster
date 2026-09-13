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
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider";
import config from "../../config/config";

const Login = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = ChatState();

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all the required fields.",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
      setLoading(false);
      return;
    }

    try {
      const config_headers = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(
        `${config.BACKEND_URL}/api/user/login`,
        { email, password },
        config_headers
      );

      toast({
        title: "Welcome Back!",
        description: `Logged in as ${data.name}`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      navigate("/chats");
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: error.response?.data?.message || "Invalid credentials provided.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    setEmail("guest@example.com");
    setPassword("123456");
  };

  return (
    <VStack spacing={{ base: 3, sm: 4 }} w="100%">
      <FormControl id="login-email" isRequired>
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
          h={{ base: "38px", sm: "44px" }}
          transition="all 0.2s ease-in-out"
        />
      </FormControl>

      <FormControl id="login-password" isRequired>
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
            onChange={(e) => setPassword(e.target.value)}
            type={show ? "text" : "password"}
            placeholder="Enter your password"
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
            h={{ base: "38px", sm: "44px" }}
            transition="all 0.2s ease-in-out"
            onKeyDown={(e) => e.key === "Enter" && submitHandler()}
          />
          <InputRightElement h={{ base: "38px", sm: "44px" }} pr={1}>
            <Button
              h="26px"
              w="26px"
              minW="26px"
              p={0}
              size="sm"
              onClick={handleClick}
              bg="rgba(255, 255, 255, 0.1)"
              color="rgba(255, 255, 255, 0.8)"
              _hover={{
                bg: "rgba(255, 255, 255, 0.2)",
                color: "white",
              }}
              borderRadius="lg"
              aria-label={show ? "Hide password" : "Show password"}
            >
              <Icon as={show ? ViewOffIcon : ViewIcon} fontSize="xs" />
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <Button
        width="100%"
        onClick={submitHandler}
        isLoading={loading}
        bg="linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)"
        color="white"
        h={{ base: "44px", sm: "46px" }}
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
        mt={{ base: 2, sm: 2.5 }}
      >
        Sign In to YapMonster
      </Button>

      <Button
        variant="ghost"
        bg="rgba(255, 255, 255, 0.06)"
        border="1px solid rgba(255, 255, 255, 0.12)"
        color="rgba(255, 255, 255, 0.85)"
        width="100%"
        h={{ base: "38px", sm: "40px" }}
        onClick={handleGuestLogin}
        _hover={{
          bg: "rgba(255, 255, 255, 0.14)",
          color: "white",
          borderColor: "rgba(255, 255, 255, 0.25)",
        }}
        borderRadius="xl"
        fontWeight="600"
        fontSize="xs"
        transition="all 0.2s ease-in-out"
      >
        ⚡ Quick Fill Guest Credentials
      </Button>
    </VStack>
  );
};

export default Login;
