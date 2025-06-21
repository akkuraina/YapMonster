import { Box } from "@chakra-ui/layout";
import "./styles.css";
import SingleChat from "./SingleChat";
import { ChatState } from "../Context/ChatProvider";

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();

  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="stretch"
      alignSelf="stretch"
      flexDirection="column"
      padding={3}
      bg="linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)"
      width="100%"
      height="100%"
      borderRadius="lg"
      borderWidth="5px"
      borderColor="#5A67D8"
      boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
      overflow="auto"
      css={{
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
        scrollBehavior: 'smooth',
      }}
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default Chatbox;
