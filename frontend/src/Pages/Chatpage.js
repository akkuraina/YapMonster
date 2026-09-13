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
    <Box 
      width="100vw" 
      height="100vh" 
      display="flex"
      flexDirection="column"
      overflow="hidden"
      bg="#E6E6FA"
    >
      {user && <SideDrawer />}
      <Box
        display="flex"
        justifyContent="flex-start"
        alignItems="stretch"
        width="100%"
        flex="1"
        minH="0"
        padding="10px"
        bg="transparent"
      >
        {/* MyChats section */}
        <Box
          width={{ base: "100%", md: "30%" }}
          height="100%"
          padding="10px"
          bg="transparent"
        >
          {user && <MyChats fetchAgain={fetchAgain} />}
        </Box>

        {/* Chatbox section */}
        <Box
          width={{ base: "100%", md: "70%" }}
          height="100%"
          padding="10px"
          bg="transparent"
        >
          {user && (
            <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Chatpage;
