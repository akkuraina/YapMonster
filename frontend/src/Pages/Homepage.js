import React, { useEffect, useState, useRef } from "react";
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
  HStack,
  Flex,
  Button,
  Icon,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FaComments, FaArrowRight } from "react-icons/fa";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";
import YapMonsterWordmark from "../components/common/YapMonsterWordmark";
import AppLoader from "../components/common/AppLoader";

function Homepage() {
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const authSectionRef = useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) {
      setIsRedirecting(true);
      const timer = setTimeout(() => {
        navigate("/chats");
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [navigate]);

  const scrollToAuth = (tabToSelect = 0) => {
    setTabIndex(tabToSelect);
    if (authSectionRef.current) {
      authSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (isRedirecting) {
    return <AppLoader text="Opening your chat workspace..." />;
  }

  return (
    <Box
      minH="100vh"
      w="100%"
      bg="linear-gradient(135deg, #020617 0%, #070d24 45%, #020617 100%)"
      color="white"
      position="relative"
      overflowX="hidden"
      fontFamily="'Plus Jakarta Sans', sans-serif"
    >
      {/* Background Decorative Ambient Lights */}
      <Box
        position="absolute"
        top="-10%"
        left="-5%"
        w="50vw"
        h="50vw"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(30, 58, 138, 0.2) 0%, transparent 60%)"
        filter="blur(70px)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        top="40%"
        right="-10%"
        w="45vw"
        h="45vw"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(67, 56, 202, 0.15) 0%, transparent 65%)"
        filter="blur(80px)"
        pointerEvents="none"
      />

      {/* 1. Header / Navbar */}
      <Box
        position="sticky"
        top={0}
        zIndex={100}
        backdropFilter="blur(20px)"
        bg="rgba(2, 6, 23, 0.88)"
        borderBottom="1px solid rgba(255, 255, 255, 0.06)"
        py={3.5}
        px={{ base: 4, md: 8 }}
      >
        <Container maxW="7xl">
          <Flex justify="space-between" align="center">
            {/* Logo */}
            <Flex align="center" gap={3} cursor="pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              <Box
                w="38px"
                h="38px"
                borderRadius="xl"
                bg="linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="0 4px 14px rgba(90, 103, 216, 0.4)"
              >
                <Icon as={FaComments} color="white" fontSize="lg" />
              </Box>
              <YapMonsterWordmark size="md" color="lightBlue" glow={true} />
            </Flex>

            {/* Navigation & CTAs */}
            <HStack spacing={{ base: 3, md: 5 }}>
              <Button
                variant="ghost"
                color="rgba(255, 255, 255, 0.8)"
                fontSize="sm"
                fontWeight="600"
                _hover={{ color: "white", bg: "rgba(255, 255, 255, 0.08)" }}
                display={{ base: "none", sm: "inline-flex" }}
                onClick={() => scrollToAuth(0)}
              >
                Sign In
              </Button>
              <Button
                bg="linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)"
                color="white"
                fontSize="sm"
                fontWeight="700"
                px={5}
                h="38px"
                borderRadius="full"
                boxShadow="0 4px 14px rgba(90, 103, 216, 0.4)"
                _hover={{
                  transform: "translateY(-1px)",
                  boxShadow: "0 8px 20px rgba(90, 103, 216, 0.55)",
                  filter: "brightness(1.1)",
                }}
                _active={{ transform: "translateY(0)" }}
                onClick={() => scrollToAuth(1)}
              >
                Get Started
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* 2. Hero Section (Centered & Minimal) */}
      <Container
        maxW="5xl"
        pt={{ base: 20, md: 28, lg: 36 }}
        pb={{ base: 20, md: 28, lg: 36 }}
        position="relative"
        zIndex={2}
        display="flex"
        flexDirection="column"
        alignItems="center"
        textAlign="center"
      >
        {/* Subtle Ambient Radial Glow behind text */}
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          w={{ base: "320px", sm: "500px", md: "720px" }}
          h={{ base: "260px", sm: "360px", md: "460px" }}
          bg="radial-gradient(ellipse at center, rgba(56, 189, 248, 0.12) 0%, rgba(90, 103, 216, 0.08) 45%, transparent 70%)"
          filter="blur(50px)"
          pointerEvents="none"
          zIndex={-1}
        />

        <VStack
          spacing={{ base: 6, md: 8 }}
          maxW="920px"
          mx="auto"
          align="center"
          sx={{
            animation: "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            "@keyframes fadeInUp": {
              "0%": { opacity: 0, transform: "translateY(20px)" },
              "100%": { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          {/* Hero Main Heading with Wordmark */}
          <Box maxW="900px">
            <Text
              fontSize={{ base: "2.5rem", sm: "3.5rem", md: "4.6rem", lg: "5.4rem" }}
              fontWeight="800"
              lineHeight={1.12}
              letterSpacing="-0.03em"
              color="white"
            >
              Where Conversations Come Alive with{" "}
              <YapMonsterWordmark size="hero" color="lightBlue" glow={true} />
            </Text>
          </Box>

          {/* Subheading Paragraph */}
          <Text
            fontSize={{ base: "md", sm: "lg", md: "xl" }}
            color="rgba(255, 255, 255, 0.72)"
            lineHeight={1.65}
            maxW="640px"
            fontWeight="400"
          >
            Experience ultra-fast real-time messaging, team group rooms, and seamless LiveKit video calls wrapped in a polished, fluid interface.
          </Text>

          {/* Hero CTA Buttons */}
          <HStack
            spacing={4}
            pt={3}
            justify="center"
            flexWrap="wrap"
          >
            <Button
              size="lg"
              bg="linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)"
              color="white"
              borderRadius="xl"
              px={8}
              h="54px"
              fontWeight="700"
              fontSize="md"
              rightIcon={<FaArrowRight />}
              boxShadow="0 10px 28px rgba(90, 103, 216, 0.45)"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 14px 34px rgba(90, 103, 216, 0.65)",
                filter: "brightness(1.1)",
              }}
              _active={{ transform: "translateY(0)" }}
              transition="all 0.25s ease"
              onClick={() => scrollToAuth(1)}
            >
              Start Chatting Free
            </Button>
            <Button
              size="lg"
              variant="ghost"
              bg="rgba(255, 255, 255, 0.08)"
              border="1px solid rgba(255, 255, 255, 0.16)"
              color="white"
              borderRadius="xl"
              px={7}
              h="54px"
              fontWeight="600"
              fontSize="md"
              _hover={{
                bg: "rgba(255, 255, 255, 0.15)",
                borderColor: "rgba(255, 255, 255, 0.3)",
                transform: "translateY(-2px)",
              }}
              _active={{ transform: "translateY(0)" }}
              transition="all 0.25s ease"
              onClick={() => scrollToAuth(0)}
            >
              Sign In
            </Button>
          </HStack>
        </VStack>
      </Container>

      {/* 4. Auth Section */}
      <Container maxW="lg" py={{ base: 16, md: 24 }} ref={authSectionRef} id="auth-section">
        <VStack spacing={6} w="100%">
          <VStack spacing={2} textAlign="center">
            <YapMonsterWordmark size="xl" color="gradient" glow={true} />
            <Text fontSize="sm" color="rgba(255, 255, 255, 0.65)">
              Sign in to your account or get started in seconds
            </Text>
          </VStack>

          {/* Auth Card Container */}
          <Box
            bg="rgba(7, 13, 30, 0.85)"
            backdropFilter="blur(24px)"
            border="1px solid rgba(255, 255, 255, 0.08)"
            borderRadius="28px"
            boxShadow="0 24px 60px rgba(0, 0, 0, 0.6), 0 0 35px rgba(56, 189, 248, 0.08)"
            w="100%"
            p={{ base: 5, sm: 7 }}
          >
            <Tabs
              isFitted
              variant="soft-rounded"
              index={tabIndex}
              onChange={(index) => setTabIndex(index)}
            >
              <TabList
                mb={5}
                bg="rgba(255, 255, 255, 0.05)"
                borderRadius="xl"
                p={1}
                border="1px solid rgba(255, 255, 255, 0.08)"
              >
                <Tab
                  _selected={{
                    color: "white",
                    bg: "linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)",
                    boxShadow: "0 4px 14px rgba(90, 103, 216, 0.4)",
                  }}
                  _hover={{ color: "white", bg: "rgba(255, 255, 255, 0.08)" }}
                  color="rgba(255, 255, 255, 0.65)"
                  fontWeight="700"
                  fontSize="sm"
                  borderRadius="lg"
                  h="38px"
                  transition="all 0.25s ease-in-out"
                >
                  Sign In
                </Tab>
                <Tab
                  _selected={{
                    color: "white",
                    bg: "linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)",
                    boxShadow: "0 4px 14px rgba(90, 103, 216, 0.4)",
                  }}
                  _hover={{ color: "white", bg: "rgba(255, 255, 255, 0.08)" }}
                  color="rgba(255, 255, 255, 0.65)"
                  fontWeight="700"
                  fontSize="sm"
                  borderRadius="lg"
                  h="38px"
                  transition="all 0.25s ease-in-out"
                >
                  Create Account
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
