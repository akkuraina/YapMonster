import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";

function Homepage() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user) navigate("/chats");
  }, [navigate]);

  return (
    <Container
      maxW="xl"
      centerContent
      bgImage="url('D:\DJSCE\MERN PROJECTS\CHAT-APP\frontend\public\background.png')" // Set the background image
      bgSize="cover" // Ensure the image covers the whole container
      bgPosition="center" // Center the image
      minH="100vh" // Ensure the container takes full height
    >
      <Box
        d="flex"
        justifyContent="center"
        p={3}
        w="100%"
        m="22px 0 15px 0"
        borderRadius="lg"
        borderWidth="10px"
        borderColor="green.800"
        backgroundColor="rgba(34, 197, 94, 0.8)" // Greenish overlay with some transparency
      >
        <Text
          fontSize="5xl"
          fontFamily="Work sans"
          sx={{
            background: "linear-gradient(to right,rgb(3, 21, 3), #32CD32)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            alignContent: "center",
          }}
        >
          YapMonster
        </Text>
      </Box>

      <Box
        bg="rgba(34, 197, 94, 0.7)" // Slightly transparent greenish background
        w="100%"
        p={4}
        borderRadius="lg"
        borderWidth="10px"
        borderColor="green.800"
      >
        <Tabs isFitted variant="soft-rounded">
          <TabList mb="1em" bg="green.300">
            <Tab
              _selected={{ color: "black", bg: "#2F855A" }}
              _hover={{ bg: "#2F855A" }}
            >
              Login
            </Tab>
            <Tab
              _selected={{ color: "black", bg: "#2F855A" }}
              _hover={{ bg: "#2F855A" }}
            >
              Sign Up
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel bg="green.100">
              <Login />
            </TabPanel>
            <TabPanel bg="green.100">
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
}

export default Homepage;
