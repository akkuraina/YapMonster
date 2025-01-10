import { Box } from "@chakra-ui/layout";
import "./styles.css";
import SingleChat from "./SingleChat";
import { ChatState } from "../Context/ChatProvider";

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();

  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      alignSelf="stretch"
      overflow="hidden"
      flexDirection="column" // Ensure column layout on smaller screens
      padding={3}
      bg="linear-gradient(135deg, #4caf50, #81c784)" // Green gradient background
      width="100%" // Ensures Chatbox takes full width within the container
      borderRadius="lg"
      borderWidth="1px"
      borderColor="#388e3c" // Dark green border
      boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default Chatbox;
