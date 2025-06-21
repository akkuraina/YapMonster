import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import { Box } from "@chakra-ui/layout";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="8px"
      padding="10px"
      height="100%"
      flex="1"
      overflowY="auto"
      overflowX="hidden"
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
      {messages &&
        messages.map((m, i) => (
          <Box
            key={m._id}
            display="flex"
            alignItems="flex-start"
            justifyContent={m.sender._id === user._id ? "flex-end" : "flex-start"}
            width="100%"
          >
            {m.sender._id !== user._id && (
              <Tooltip
                label={m.sender.name}
                placement="bottom-start"
                hasArrow
                bg="purple.700"
                color="white"
              >
                <Avatar
                  mt="7px"
                  mr={2}
                  size="sm"
                  cursor="pointer"
                  name={m.sender.name}
                  src={m.sender.pic}
                  bg="purple.600"
                />
              </Tooltip>
            )}
            <Box
              backgroundColor={m.sender._id === user._id ? "#5A67D8" : "#6B46C1"}
              color="white"
              padding="8px 16px"
              borderRadius="18px"
              maxWidth="70%"
              fontSize="14px"
              boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
              wordBreak="break-word"
              overflowWrap="break-word"
            >
              {m.content}
            </Box>
            {m.sender._id === user._id && (
              <Tooltip
                label={m.sender.name}
                placement="bottom-end"
                hasArrow
                bg="purple.700"
                color="white"
              >
                <Avatar
                  mt="7px"
                  ml={2}
                  size="sm"
                  cursor="pointer"
                  name={m.sender.name}
                  src={m.sender.pic}
                  bg="purple.600"
                />
              </Tooltip>
            )}
          </Box>
        ))}
    </Box>
  );
};

export default ScrollableChat;
