import { Box } from "@chakra-ui/react";
import { useState } from "react";
import Chatbox from "../components/ChatBox";
import MyChats from "../components/MyChats";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";

const Chatpage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user } = ChatState();

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {user && <SideDrawer />}
      <Box
        display="flex" // Flex container for horizontal alignment
        justifyContent="flex-start"
        alignItems="stretch"
        width="100%"
        height="91.5vh"
        padding="10px"
        bg="#2d3748" // Dark background for ChatPage
        borderRadius="lg"
        overflow="hidden"
        boxShadow="xl"
      >
        {/* MyChats section */}
        <Box
          width={{ base: "100%", md: "30%" }} // Responsive width for MyChats
          height="100%"
          padding="10px"
          bg="#1a202c" // Dark background for MyChats section
          borderRadius="lg"
          boxShadow="md"
        >
          {user && <MyChats fetchAgain={fetchAgain} />}
        </Box>

        {/* Chatbox section */}
        <Box
          width={{ base: "100%", md: "70%" }} // Responsive width for Chatbox
          height="100%"
          padding="10px"
          bg="#1a202c" // Dark background for Chatbox section
          borderRadius="lg"
          boxShadow="md"
        >
          {user && (
            <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
          )}
        </Box>
      </Box>
    </div>
  );
};

export default Chatpage;
