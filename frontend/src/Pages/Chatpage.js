import React, { useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import Chatbox from "../components/ChatBox";
import MyChats from "../components/MyChats";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";

const Chatpage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user } = ChatState();

  return (
    <Flex
      direction="column"
      w="100vw"
      h="100vh"
      overflow="hidden"
      bg="linear-gradient(135deg, #020617 0%, #080d24 50%, #020617 100%)"
      position="relative"
    >
      {/* Top Navigation Bar with Wordmark */}
      {user && <SideDrawer />}

      {/* Main Workspace Body */}
      <Flex
        flex="1"
        minH="0"
        minW="0"
        w="100%"
        p={{ base: 2, sm: 3, md: 4 }}
        gap={{ base: 2, md: 4 }}
        alignItems="stretch"
        overflow="hidden"
      >
        {/* Left: Chat List Panel */}
        <Box
          display={{ base: "flex", md: "flex" }}
          w={{ base: "100%", md: "360px", lg: "400px" }}
          maxW={{ base: "100%", md: "420px" }}
          flexShrink={0}
          h="100%"
          minH="0"
        >
          {user && <MyChats fetchAgain={fetchAgain} />}
        </Box>

        {/* Right: Active Conversation Panel */}
        <Box
          flex="1"
          minW="0"
          minH="0"
          h="100%"
          display={{ base: "flex", md: "flex" }}
        >
          {user && (
            <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
          )}
        </Box>
      </Flex>
    </Flex>
  );
};

export default Chatpage;
