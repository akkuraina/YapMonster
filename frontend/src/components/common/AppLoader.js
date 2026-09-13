import React from "react";
import { Box, Flex, Text, keyframes } from "@chakra-ui/react";
import YapMonsterWordmark from "./YapMonsterWordmark";

const pulseGlow = keyframes`
  0% {
    transform: scale(0.96);
    opacity: 0.7;
    filter: drop-shadow(0 0 10px rgba(186, 230, 253, 0.4));
  }
  50% {
    transform: scale(1.04);
    opacity: 1;
    filter: drop-shadow(0 0 25px rgba(186, 230, 253, 0.8));
  }
  100% {
    transform: scale(0.96);
    opacity: 0.7;
    filter: drop-shadow(0 0 10px rgba(186, 230, 253, 0.4));
  }
`;

const spinOrbit = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const AppLoader = ({ text = "Launching your conversations..." }) => {
  return (
    <Flex
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="linear-gradient(135deg, #020617 0%, #070d24 50%, #020617 100%)"
      zIndex={9999}
      direction="column"
      align="center"
      justify="center"
      userSelect="none"
    >
      {/* Central Glowing Orb & Wordmark */}
      <Box position="relative" display="flex" alignItems="center" justifyContent="center">
        {/* Animated Rotating Aura Ring */}
        <Box
          position="absolute"
          w={{ base: "180px", md: "240px" }}
          h={{ base: "180px", md: "240px" }}
          borderRadius="full"
          border="2px solid transparent"
          borderTopColor="#BAE6FD"
          borderRightColor="#60A5FA"
          borderBottomColor="rgba(186, 230, 253, 0.2)"
          animation={`${spinOrbit} 2.5s linear infinite`}
          filter="blur(1px)"
        />

        {/* Pulsing Wordmark */}
        <Box animation={`${pulseGlow} 2s ease-in-out infinite`} p={6}>
          <YapMonsterWordmark size="xl" color="gradient" glow={true} />
        </Box>
      </Box>

      {/* Subtitle / Status */}
      <Text
        mt={8}
        fontSize="sm"
        color="rgba(255, 255, 255, 0.7)"
        fontFamily="'Plus Jakarta Sans', sans-serif"
        fontWeight="500"
        letterSpacing="0.05em"
      >
        {text}
      </Text>
    </Flex>
  );
};

export default AppLoader;
