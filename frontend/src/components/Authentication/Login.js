import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom"; 
import { ChatState } from "../../Context/ChatProvider";

const Login = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); 
  const { setUser } = ChatState();

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      toast({
        title: "Please Fill all the Fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/api/user/login",
        { email, password },
        config
      );

      toast({
        title: "Login Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      navigate("/chats"); 
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    <VStack 
      spacing="4" 
      w="100%"
    >
      <FormControl id="email" isRequired>
        <FormLabel 
          color="rgba(255, 255, 255, 0.9)"
          fontWeight="600"
          fontSize="sm"
          mb={1}
        >
          Email Address
        </FormLabel>
        <Input
          value={email}
          type="email"
          placeholder="Enter Your Email Address"
          onChange={(e) => setEmail(e.target.value)}
          bg="rgba(255, 255, 255, 0.1)"
          border="1px solid rgba(255, 255, 255, 0.2)"
          color="white"
          _placeholder={{ color: "rgba(255, 255, 255, 0.5)" }}
          _focus={{
            borderColor: "#667eea",
            boxShadow: "0 0 0 1px #667eea",
            bg: "rgba(255, 255, 255, 0.15)"
          }}
          _hover={{
            bg: "rgba(255, 255, 255, 0.15)"
          }}
          borderRadius="lg"
          transition="all 0.3s ease-in-out"
          size="md"
        />
      </FormControl>
      <FormControl id="password" isRequired>
        <FormLabel 
          color="rgba(255, 255, 255, 0.9)"
          fontWeight="600"
          fontSize="sm"
          mb={1}
        >
          Password
        </FormLabel>
        <InputGroup size="md">
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={show ? "text" : "password"}
            placeholder="Enter password"
            bg="rgba(255, 255, 255, 0.1)"
            border="1px solid rgba(255, 255, 255, 0.2)"
            color="white"
            _placeholder={{ color: "rgba(255, 255, 255, 0.5)" }}
            _focus={{
              borderColor: "#667eea",
              boxShadow: "0 0 0 1px #667eea",
              bg: "rgba(255, 255, 255, 0.15)"
            }}
            _hover={{
              bg: "rgba(255, 255, 255, 0.15)"
            }}
            borderRadius="lg"
            transition="all 0.3s ease-in-out"
          />
          <InputRightElement width="4.5rem">
            <Button 
              h="1.75rem" 
              size="sm" 
              onClick={handleClick} 
              bg="rgba(255, 255, 255, 0.1)"
              border="1px solid rgba(255, 255, 255, 0.2)"
              color="white"
              _hover={{ 
                bg: "rgba(255, 255, 255, 0.2)",
                transform: "scale(1.05)"
              }}
              borderRadius="md"
              transition="all 0.2s ease-in-out"
            >
              {show ? "Hide" : "Show"}
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
        _hover={{ 
          transform: "translateY(-2px)",
          boxShadow: "0 8px 25px rgba(90, 103, 216, 0.4)"
        }}
        _active={{
          transform: "translateY(0)"
        }}
        borderRadius="lg"
        py={2}
        fontWeight="600"
        fontSize="md"
        transition="all 0.3s ease-in-out"
        mt={2}
      >
        Login
      </Button>
      <Button
        variant="ghost"
        bg="rgba(255, 255, 255, 0.1)"
        border="1px solid rgba(255, 255, 255, 0.2)"
        color="rgba(255, 255, 255, 0.8)"
        width="100%"
        onClick={() => {
          setEmail("guest@example.com");
          setPassword("123456");
        }}
        _hover={{ 
          bg: "rgba(255, 255, 255, 0.2)",
          transform: "translateY(-1px)"
        }}
        borderRadius="lg"
        py={2}
        fontWeight="500"
        fontSize="sm"
        transition="all 0.3s ease-in-out"
      >
        Get Guest User Credentials
      </Button>
    </VStack>
  );
};

export default Login;
