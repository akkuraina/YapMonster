import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
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
    <Box
      minH="100vh"
      bg="linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      overflow="auto"
      css={{
        scrollBehavior: 'smooth',
        '&::-webkit-scrollbar': {
          width: '0px',
          background: 'transparent',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'transparent',
        },
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.1) 0%, transparent 50%)",
        zIndex: 1,
      }}
    >
      <Container
        maxW="lg"
        centerContent
        position="relative"
        zIndex={2}
      >
        <VStack spacing={6} w="100%">
          {/* Logo Section */}
          <Box
            textAlign="center"
            p={6}
            borderRadius="2xl"
            bg="rgba(255, 255, 255, 0.05)"
            backdropFilter="blur(20px)"
            border="1px solid rgba(255, 255, 255, 0.1)"
            boxShadow="0 20px 40px rgba(0, 0, 0, 0.3)"
            w="100%"
          >
            <Text
              fontSize={{ base: "3xl", md: "4xl" }}
              fontFamily="'Poppins', sans-serif"
              fontWeight="800"
              sx={{
                background: "linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
                filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))"
              }}
              letterSpacing="tight"
            >
              YapMonster
            </Text>
            <Text
              fontSize="md"
              color="rgba(255, 255, 255, 0.7)"
              mt={1}
              fontFamily="'Poppins', sans-serif"
              fontWeight="400"
            >
              Connect. Chat. Share.
            </Text>
          </Box>

          {/* Auth Tabs Section */}
          <Box
            bg="rgba(255, 255, 255, 0.05)"
            backdropFilter="blur(20px)"
            border="1px solid rgba(255, 255, 255, 0.1)"
            borderRadius="2xl"
            boxShadow="0 20px 40px rgba(0, 0, 0, 0.3)"
            w="100%"
            p={4}
          >
            <Tabs isFitted variant="soft-rounded" colorScheme="purple">
              <TabList 
                mb={4} 
                bg="rgba(255, 255, 255, 0.05)"
                borderRadius="xl"
                p={1}
                border="1px solid rgba(255, 255, 255, 0.1)"
              >
                <Tab
                  _selected={{ 
                    color: "white", 
                    bg: "linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)",
                    boxShadow: "0 4px 12px rgba(90, 103, 216, 0.4)"
                  }}
                  _hover={{ 
                    bg: "rgba(255, 255, 255, 0.1)",
                    color: "white"
                  }}
                  color="rgba(255, 255, 255, 0.7)"
                  fontWeight="600"
                  borderRadius="lg"
                  transition="all 0.3s ease-in-out"
                >
                  Login
                </Tab>
                <Tab
                  _selected={{ 
                    color: "white", 
                    bg: "linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)",
                    boxShadow: "0 4px 12px rgba(90, 103, 216, 0.4)"
                  }}
                  _hover={{ 
                    bg: "rgba(255, 255, 255, 0.1)",
                    color: "white"
                  }}
                  color="rgba(255, 255, 255, 0.7)"
                  fontWeight="600"
                  borderRadius="lg"
                  transition="all 0.3s ease-in-out"
                >
                  Sign Up
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel p={0}>
                  <Login />
                </TabPanel>
                <TabPanel p={0}>
                  <Signup />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}

export default Homepage;
