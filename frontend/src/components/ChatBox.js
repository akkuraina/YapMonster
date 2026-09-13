import React from "react";
import { Box } from "@chakra-ui/layout";
import "./styles.css";
import SingleChat from "./SingleChat";
import { ChatState } from "../Context/ChatProvider";

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();

  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      flexDirection="column"
      w="100%"
      h="100%"
      minH="0"
      minW="0"
      bg="rgba(5, 11, 28, 0.88)"
      backdropFilter="blur(24px)"
      borderRadius="24px"
      border="1px solid rgba(255, 255, 255, 0.08)"
      boxShadow="0 16px 45px rgba(0, 0, 0, 0.6)"
      overflow="hidden"
      p={{ base: 2, md: 3 }}
      position="relative"
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default Chatbox;
