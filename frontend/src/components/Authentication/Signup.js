import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom"; 

const Signup = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();
  const navigate = useNavigate(); 

  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [confirmpassword, setConfirmpassword] = useState();
  const [password, setPassword] = useState();
  const [pic, setPic] = useState();
  const [picLoading, setPicLoading] = useState(false);

  const submitHandler = async () => {
    setPicLoading(true);
    if (!name || !email || !password || !confirmpassword) {
      toast({
        title: "Please Fill all the Fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }
    if (password !== confirmpassword) {
      toast({
        title: "Passwords Do Not Match",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      const { data } = await axios.post(
        "/api/user",
        {
          name,
          email,
          password,
          pic,
        },
        config
      );
      toast({
        title: "Registration Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setPicLoading(false);
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
      setPicLoading(false);
    }
  };

  const postDetails = (pics) => {
    setPicLoading(true);
    if (pics === undefined) {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "chat-app");
      data.append("cloud_name", "piyushproj");
      fetch("https://api.cloudinary.com/v1_1/piyushproj/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString());
          setPicLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setPicLoading(false);
        });
    } else {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }
  };

  return (
    <VStack
      spacing="4"
      w="100%"
      maxH="50vh"
      overflowY="auto"
      css={{
        scrollBehavior: 'smooth',
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
      }}
    >
      <FormControl id="first-name" isRequired>
        <FormLabel 
          color="rgba(255, 255, 255, 0.9)"
          fontWeight="600"
          fontSize="sm"
          mb={1}
        >
          Name
        </FormLabel>
        <Input
          placeholder="Enter Your Name"
          onChange={(e) => setName(e.target.value)}
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
            type={show ? "text" : "password"}
            placeholder="Enter Password"
            onChange={(e) => setPassword(e.target.value)}
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
      <FormControl id="password" isRequired>
        <FormLabel 
          color="rgba(255, 255, 255, 0.9)"
          fontWeight="600"
          fontSize="sm"
          mb={1}
        >
          Confirm Password
        </FormLabel>
        <InputGroup size="md">
          <Input
            type={show ? "text" : "password"}
            placeholder="Confirm Password"
            onChange={(e) => setConfirmpassword(e.target.value)}
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
      <FormControl id="pic">
        <FormLabel 
          color="rgba(255, 255, 255, 0.9)"
          fontWeight="600"
          fontSize="sm"
          mb={1}
        >
          Upload your Picture
        </FormLabel>
        <Input
          type="file"
          p={1}
          accept="image/*"
          onChange={(e) => postDetails(e.target.files[0])}
          bg="rgba(255, 255, 255, 0.1)"
          border="1px solid rgba(255, 255, 255, 0.2)"
          color="white"
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
          sx={{
            '&::file-selector-button': {
              bg: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              borderRadius: 'md',
              padding: '6px 12px',
              marginRight: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                bg: 'rgba(255, 255, 255, 0.2)',
                transform: 'scale(1.05)'
              }
            }
          }}
        />
      </FormControl>
      <Button
        width="100%"
        onClick={submitHandler}
        isLoading={picLoading}
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
        Sign Up
      </Button>
    </VStack>
  );
};

export default Signup;
