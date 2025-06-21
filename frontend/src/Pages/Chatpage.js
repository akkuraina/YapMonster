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
      overflow="auto"
      bg="#E6E6FA"
      css={{
        scrollBehavior: 'smooth',
        '&::-webkit-scrollbar': {
          width: '0px !important',
          background: 'transparent !important',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent !important',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'transparent !important',
        },
        scrollbarWidth: 'none !important',
        msOverflowStyle: 'none !important',
      }}
    >
      {user && <SideDrawer />}
      <Box
        display="flex"
        justifyContent="flex-start"
        alignItems="stretch"
        width="100%"
        height="calc(100vh - 120px)"
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
