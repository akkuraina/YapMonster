import React from "react";
import { Box, Text } from "@chakra-ui/react";

/**
 * YapMonsterWordmark
 * Brand wordmark component rendered with elegant, ultra-thin italic serif typography
 * ("Instrument Serif" / "Playfair Display" italic, hairline weight) in signature light blue color.
 */
const YapMonsterWordmark = ({
  size = "md",
  color = "lightBlue",
  glow = false,
  onClick,
  cursor = "default",
  sx = {},
  ...props
}) => {
  // Size mapping with fluid scaling
  const sizeStyles = {
    xs: {
      fontSize: "18px",
      letterSpacing: "-0.01em",
    },
    sm: {
      fontSize: "22px",
      letterSpacing: "-0.015em",
    },
    md: {
      fontSize: { base: "24px", md: "28px" },
      letterSpacing: "-0.02em",
    },
    lg: {
      fontSize: { base: "30px", md: "38px", lg: "42px" },
      letterSpacing: "-0.025em",
    },
    xl: {
      fontSize: { base: "36px", md: "46px", lg: "54px" },
      letterSpacing: "-0.03em",
    },
    hero: {
      fontSize: { base: "3.2rem", sm: "4.2rem", md: "5.5rem", lg: "6.5rem" },
      letterSpacing: "-0.035em",
      lineHeight: 1.05,
    },
  };

  // Color schemes with very light blue
  const colorStyles = {
    lightBlue: {
      color: "#BAE6FD", // Very light, luminous ice blue
      textShadow: glow ? "0 0 20px rgba(186, 230, 253, 0.55), 0 0 40px rgba(147, 197, 253, 0.3)" : "none",
    },
    blue: {
      color: "#90CDF4", // Soft light sky blue
      textShadow: glow ? "0 0 20px rgba(144, 205, 244, 0.5)" : "none",
    },
    gradient: {
      background: "linear-gradient(135deg, #F0F9FF 0%, #BAE6FD 45%, #7DD3FC 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      textShadow: glow ? "0 2px 24px rgba(186, 230, 253, 0.45)" : "none",
    },
    white: {
      color: "#FFFFFF",
      textShadow: glow ? "0 0 20px rgba(255, 255, 255, 0.4)" : "none",
    },
    dark: {
      color: "#38BDF8",
      textShadow: "none",
    },
  };

  const selectedSize = sizeStyles[size] || sizeStyles.md;
  const selectedColor = colorStyles[color] || colorStyles.lightBlue;

  return (
    <Box
      as="span"
      display="inline-flex"
      alignItems="center"
      onClick={onClick}
      cursor={cursor}
      userSelect="none"
      {...props}
    >
      <Text
        as="span"
        fontFamily="'Instrument Serif', 'Cormorant Garamond', 'Playfair Display', Georgia, serif"
        fontStyle="italic"
        fontWeight="300"
        transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={
          onClick
            ? {
                transform: "translateY(-1px) scale(1.02)",
                filter: "brightness(1.15)",
              }
            : undefined
        }
        sx={{
          ...selectedSize,
          ...selectedColor,
          ...sx,
        }}
      >
        YapMonster
      </Text>
    </Box>
  );
};

export default YapMonsterWordmark;
