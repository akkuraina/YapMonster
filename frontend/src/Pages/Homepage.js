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
  SimpleGrid,
  Icon,
  Avatar,
  Badge,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FaComments, FaVideo, FaUsers, FaPalette, FaShieldAlt, FaBolt, FaArrowRight } from "react-icons/fa";
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

      {/* 2. Hero Section */}
      <Container maxW="7xl" pt={{ base: 12, md: 20 }} pb={{ base: 16, md: 24 }} position="relative" zIndex={2}>
        <Flex
          direction={{ base: "column", lg: "row" }}
          align="center"
          justify="space-between"
          gap={{ base: 12, lg: 8 }}
        >
          {/* Left Column: Hero Text */}
          <VStack align={{ base: "center", lg: "flex-start" }} textAlign={{ base: "center", lg: "left" }} spacing={6} maxW={{ base: "100%", lg: "620px" }}>
            {/* Pill Badge */}
            <HStack
              bg="rgba(90, 103, 216, 0.15)"
              border="1px solid rgba(99, 179, 237, 0.3)"
              px={4}
              py={1.5}
              borderRadius="full"
              spacing={2}
            >
              <Icon as={FaBolt} color="#4299E1" fontSize="xs" />
              <Text fontSize="xs" fontWeight="700" color="#63B3ED" letterSpacing="0.04em" textTransform="uppercase">
                Real-Time Chat & HD Video Calling
              </Text>
            </HStack>

            {/* Hero Main Heading with Wordmark */}
            <Box>
              <Text
                fontSize={{ base: "2.2rem", sm: "3rem", md: "3.8rem" }}
                fontWeight="800"
                lineHeight={1.15}
                letterSpacing="-0.025em"
              >
                Where Conversations Come Alive with{" "}
                <YapMonsterWordmark size="hero" color="lightBlue" glow={true} />
              </Text>
            </Box>

            {/* Tagline */}
            <Text
              fontSize={{ base: "md", md: "lg" }}
              color="rgba(255, 255, 255, 0.72)"
              lineHeight={1.6}
              maxW="540px"
            >
              Experience ultra-fast real-time messaging, team group rooms, and seamless LiveKit video calls wrapped in a polished, fluid interface.
            </Text>

            {/* Hero CTA Buttons */}
            <HStack spacing={4} pt={2} flexWrap="wrap" justify={{ base: "center", lg: "flex-start" }}>
              <Button
                size="lg"
                bg="linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)"
                color="white"
                borderRadius="xl"
                px={8}
                h="52px"
                fontWeight="700"
                fontSize="md"
                rightIcon={<FaArrowRight />}
                boxShadow="0 10px 25px rgba(90, 103, 216, 0.45)"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "0 14px 32px rgba(90, 103, 216, 0.6)",
                  filter: "brightness(1.1)",
                }}
                _active={{ transform: "translateY(0)" }}
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
                px={6}
                h="52px"
                fontWeight="600"
                fontSize="md"
                _hover={{
                  bg: "rgba(255, 255, 255, 0.15)",
                  borderColor: "rgba(255, 255, 255, 0.3)",
                }}
                onClick={() => scrollToAuth(0)}
              >
                Sign In
              </Button>
            </HStack>

            {/* Social Proof / Features mini chips */}
            <HStack spacing={{ base: 4, md: 6 }} pt={4} color="rgba(255, 255, 255, 0.6)" fontSize="xs" fontWeight="600" flexWrap="wrap" justify={{ base: "center", lg: "flex-start" }}>
              <HStack spacing={1.5}>
                <Icon as={FaShieldAlt} color="green.400" />
                <Text>Secure Auth</Text>
              </HStack>
              <HStack spacing={1.5}>
                <Icon as={FaVideo} color="#4299E1" />
                <Text>LiveKit Video Rooms</Text>
              </HStack>
              <HStack spacing={1.5}>
                <Icon as={FaBolt} color="yellow.400" />
                <Text>Instant Socket Sync</Text>
              </HStack>
            </HStack>
          </VStack>

          {/* Right Column: Live Chat Preview Mockup */}
          <Box
            w={{ base: "100%", lg: "480px" }}
            maxW="500px"
            bg="rgba(15, 23, 42, 0.75)"
            backdropFilter="blur(24px)"
            border="1px solid rgba(255, 255, 255, 0.15)"
            borderRadius="28px"
            p={5}
            boxShadow="0 24px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(90, 103, 216, 0.18)"
            position="relative"
          >
            {/* Top Bar of Mockup */}
            <Flex justify="space-between" align="center" pb={4} borderBottom="1px solid rgba(255, 255, 255, 0.1)">
              <HStack spacing={3}>
                <Avatar size="sm" name="Yap Community" bg="purple.600" />
                <Box>
                  <Text fontSize="sm" fontWeight="700" color="white">
                    Design & Dev Squad
                  </Text>
                  <Text fontSize="2xs" color="green.300" fontWeight="600">
                    ● 5 online
                  </Text>
                </Box>
              </HStack>
              <Badge
                bg="rgba(66, 153, 225, 0.2)"
                color="#63B3ED"
                border="1px solid rgba(66, 153, 225, 0.4)"
                borderRadius="full"
                px={2.5}
                py={0.5}
                fontSize="2xs"
                display="flex"
                alignItems="center"
                gap={1}
              >
                <Icon as={FaVideo} /> Video Active
              </Badge>
            </Flex>

            {/* Mock Message Flow */}
            <VStack spacing={3} py={4} align="stretch">
              <Box
                alignSelf="flex-start"
                bg="rgba(255, 255, 255, 0.1)"
                color="white"
                px={3.5}
                py={2.5}
                borderRadius="16px 16px 16px 4px"
                maxW="82%"
                fontSize="xs"
              >
                <Text fontWeight="bold" color="#63B3ED" fontSize="2xs" mb={0.5}>
                  Sarah K.
                </Text>
                Hey team! The new LiveKit video calling integration in YapMonster is live 🚀
              </Box>

              <Box
                alignSelf="flex-end"
                bg="linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)"
                color="white"
                px={3.5}
                py={2.5}
                borderRadius="16px 16px 4px 16px"
                maxW="82%"
                fontSize="xs"
                boxShadow="0 4px 12px rgba(90, 103, 216, 0.35)"
              >
                Awesome! Let's hop on a group call to test the screen share.
              </Box>

              <Box
                alignSelf="flex-start"
                bg="rgba(255, 255, 255, 0.1)"
                color="white"
                px={3.5}
                py={2.5}
                borderRadius="16px 16px 16px 4px"
                maxW="82%"
                fontSize="xs"
              >
                <Text fontWeight="bold" color="purple.300" fontSize="2xs" mb={0.5}>
                  Alex R.
                </Text>
                Joining right now! Audio and latency feel instant ✨
              </Box>
            </VStack>

            {/* Mock Bottom Input */}
            <Flex
              bg="rgba(255, 255, 255, 0.06)"
              border="1px solid rgba(255, 255, 255, 0.12)"
              borderRadius="full"
              px={4}
              py={2}
              align="center"
              justify="space-between"
            >
              <Text fontSize="xs" color="rgba(255, 255, 255, 0.4)">
                Type a message in YapMonster...
              </Text>
              <Box
                w="28px"
                h="28px"
                borderRadius="full"
                bg="linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="0 2px 8px rgba(90, 103, 216, 0.4)"
              >
                <Icon as={FaArrowRight} fontSize="xs" color="white" />
              </Box>
            </Flex>
          </Box>
        </Flex>
      </Container>

      {/* 3. Features Section */}
      <Box py={{ base: 16, md: 24 }} bg="rgba(255, 255, 255, 0.02)" borderTop="1px solid rgba(255, 255, 255, 0.06)" borderBottom="1px solid rgba(255, 255, 255, 0.06)">
        <Container maxW="7xl">
          <VStack spacing={4} textAlign="center" mb={14}>
            <Text fontSize="xs" fontWeight="700" color="#63B3ED" letterSpacing="0.08em" textTransform="uppercase">
              Built for Modern Connection
            </Text>
            <Text fontSize={{ base: "2xl", md: "3.2rem" }} fontWeight="800" letterSpacing="-0.02em">
              Everything You Need in One Chat Space
            </Text>
            <Text fontSize="md" color="rgba(255, 255, 255, 0.65)" maxW="600px">
              Built with modern WebRTC, Socket.IO real-time data streams, and responsive design.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            {/* Feature 1 */}
            <Box
              bg="rgba(255, 255, 255, 0.04)"
              backdropFilter="blur(16px)"
              border="1px solid rgba(255, 255, 255, 0.08)"
              borderRadius="24px"
              p={6}
              transition="all 0.3s ease"
              _hover={{
                transform: "translateY(-4px)",
                borderColor: "rgba(99, 179, 237, 0.4)",
                boxShadow: "0 16px 36px rgba(0, 0, 0, 0.3)",
              }}
            >
              <Box
                w="46px"
                h="46px"
                borderRadius="xl"
                bg="rgba(66, 153, 225, 0.15)"
                border="1px solid rgba(66, 153, 225, 0.3)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={5}
              >
                <Icon as={FaComments} color="#4299E1" fontSize="xl" />
              </Box>
              <Text fontSize="lg" fontWeight="700" mb={2}>
                Real-Time Messaging
              </Text>
              <Text fontSize="sm" color="rgba(255, 255, 255, 0.65)" lineHeight={1.6}>
                Instant message synchronization with typing indicators, message deletion for everyone, and live unread counts.
              </Text>
            </Box>

            {/* Feature 2 */}
            <Box
              bg="rgba(255, 255, 255, 0.04)"
              backdropFilter="blur(16px)"
              border="1px solid rgba(255, 255, 255, 0.08)"
              borderRadius="24px"
              p={6}
              transition="all 0.3s ease"
              _hover={{
                transform: "translateY(-4px)",
                borderColor: "rgba(107, 70, 193, 0.4)",
                boxShadow: "0 16px 36px rgba(0, 0, 0, 0.3)",
              }}
            >
              <Box
                w="46px"
                h="46px"
                borderRadius="xl"
                bg="rgba(107, 70, 193, 0.2)"
                border="1px solid rgba(107, 70, 193, 0.4)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={5}
              >
                <Icon as={FaVideo} color="#B794F4" fontSize="xl" />
              </Box>
              <Text fontSize="lg" fontWeight="700" mb={2}>
                LiveKit Video Calling
              </Text>
              <Text fontSize="sm" color="rgba(255, 255, 255, 0.65)" lineHeight={1.6}>
                High-definition 1-on-1 and group video rooms with screen sharing, participant audio controls, and incoming ring alerts.
              </Text>
            </Box>

            {/* Feature 3 */}
            <Box
              bg="rgba(255, 255, 255, 0.04)"
              backdropFilter="blur(16px)"
              border="1px solid rgba(255, 255, 255, 0.08)"
              borderRadius="24px"
              p={6}
              transition="all 0.3s ease"
              _hover={{
                transform: "translateY(-4px)",
                borderColor: "rgba(72, 187, 120, 0.4)",
                boxShadow: "0 16px 36px rgba(0, 0, 0, 0.3)",
              }}
            >
              <Box
                w="46px"
                h="46px"
                borderRadius="xl"
                bg="rgba(72, 187, 120, 0.15)"
                border="1px solid rgba(72, 187, 120, 0.3)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={5}
              >
                <Icon as={FaUsers} color="#48BB78" fontSize="xl" />
              </Box>
              <Text fontSize="lg" fontWeight="700" mb={2}>
                Group Collaboration
              </Text>
              <Text fontSize="sm" color="rgba(255, 255, 255, 0.65)" lineHeight={1.6}>
                Create custom group rooms, assign group admins, manage participants, and share updates seamlessly.
              </Text>
            </Box>

            {/* Feature 4 */}
            <Box
              bg="rgba(255, 255, 255, 0.04)"
              backdropFilter="blur(16px)"
              border="1px solid rgba(255, 255, 255, 0.08)"
              borderRadius="24px"
              p={6}
              transition="all 0.3s ease"
              _hover={{
                transform: "translateY(-4px)",
                borderColor: "rgba(237, 100, 166, 0.4)",
                boxShadow: "0 16px 36px rgba(0, 0, 0, 0.3)",
              }}
            >
              <Box
                w="46px"
                h="46px"
                borderRadius="xl"
                bg="rgba(237, 100, 166, 0.15)"
                border="1px solid rgba(237, 100, 166, 0.3)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={5}
              >
                <Icon as={FaPalette} color="#ED64A6" fontSize="xl" />
              </Box>
              <Text fontSize="lg" fontWeight="700" mb={2}>
                Themes & Avatars
              </Text>
              <Text fontSize="sm" color="rgba(255, 255, 255, 0.65)" lineHeight={1.6}>
                Personalize individual chat backgrounds with custom colors, profile avatars with canvas compression, and rich themes.
              </Text>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

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

      {/* 5. Footer */}
      <Box py={8} borderTop="1px solid rgba(255, 255, 255, 0.06)" bg="rgba(2, 6, 23, 0.95)">
        <Container maxW="7xl">
          <Flex direction={{ base: "column", sm: "row" }} justify="space-between" align="center" gap={4}>
            <HStack spacing={2}>
              <YapMonsterWordmark size="sm" color="lightBlue" />
              <Text fontSize="xs" color="rgba(255, 255, 255, 0.5)">
                — Where Conversations Come Alive.
              </Text>
            </HStack>
            <Text fontSize="xs" color="rgba(255, 255, 255, 0.4)">
              © {new Date().getFullYear()} YapMonster. Real-time chat & video powered by WebSockets and LiveKit.
            </Text>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}

export default Homepage;
