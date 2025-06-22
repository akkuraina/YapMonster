import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Box, Text, Flex, Badge } from "@chakra-ui/layout";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import { Tooltip } from "@chakra-ui/tooltip";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/toast";
import { getSender } from "../../config/ChatLogics";
import ProfileModal from "./ProfileModal";
import { ChatState } from "../../Context/ChatProvider";

// Custom Notification Badge Component
const NotificationBadge = ({ count, children }) => {
  return (
    <Box position="relative" display="inline-block">
      {children}
      {count > 0 && (
        <Badge
          position="absolute"
          top="-8px"
          right="-8px"
          colorScheme="red"
          borderRadius="full"
          fontSize="xs"
          fontWeight="bold"
          minW="22px"
          h="22px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          transform="scale(1)"
          transition="all 0.3s ease-in-out"
          _hover={{ 
            transform: "scale(1.1)",
            boxShadow: "0 4px 12px rgba(220, 38, 38, 0.4)"
          }}
          bg="linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)"
          color="white"
          border="2px solid white"
          boxShadow="0 2px 8px rgba(0, 0, 0, 0.2)"
          animation={count > 0 ? "pulse 2s infinite" : "none"}
          sx={{
            "@keyframes pulse": {
              "0%": { transform: "scale(1)" },
              "50%": { transform: "scale(1.05)" },
              "100%": { transform: "scale(1)" }
            }
          }}
        >
          {count > 99 ? "99+" : count}
        </Badge>
      )}
    </Box>
  );
};

function SideDrawer() {
  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();

  // Debug: Log notification count changes
  console.log("SideDrawer - Notification count:", notification.length);
  console.log("SideDrawer - Notifications:", notification);

  const toast = useToast();
  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  return (
    <>
      <Box
        bg="linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)"
        w="100%"
        p="20px 30px"
        borderBottom="3px solid"
        borderColor="purple.700"
        h="120px"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
        backdropFilter="blur(10px)"
        position="relative"
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(135deg, rgba(90, 103, 216, 0.9) 0%, rgba(107, 70, 193, 0.9) 100%)",
          zIndex: -1,
        }}
      >
        <Flex alignItems="center" justifyContent="space-between" h="100%">
          {/* Notification icon on the left */}
          <Menu>
            <MenuButton 
              p={3}
              borderRadius="full"
              bg="rgba(255, 255, 255, 0.2)"
              backdropFilter="blur(10px)"
              border="2px solid rgba(255, 255, 255, 0.3)"
              _hover={{
                bg: "rgba(255, 255, 255, 0.3)",
                transform: "scale(1.05)",
                transition: "all 0.2s ease-in-out"
              }}
              transition="all 0.2s ease-in-out"
            >
              <NotificationBadge count={notification.length}>
                <BellIcon fontSize="2xl" color="white" />
              </NotificationBadge>
            </MenuButton>
            <MenuList 
              bg="white" 
              borderRadius="xl"
              boxShadow="0 20px 40px rgba(0, 0, 0, 0.15)"
              border="none"
              p={2}
            >
              {!notification.length && (
                <Text p={3} color="gray.500" fontSize="sm" textAlign="center">
                  No New Messages
                </Text>
              )}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                  borderRadius="lg"
                  mb={1}
                  _hover={{
                    bg: "purple.100",
                    transform: "translateX(5px)",
                    transition: "all 0.2s ease-in-out"
                  }}
                  transition="all 0.2s ease-in-out"
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
              {/* Debug: Add test notification */}
              <MenuDivider />
              <MenuItem
                onClick={() => {
                  const testNotification = {
                    _id: Date.now().toString(),
                    content: "Test message",
                    sender: { name: "Test User" },
                    chat: { 
                      _id: "test-chat-id",
                      chatName: "Test Chat",
                      isGroupChat: false,
                      users: [{ name: "Test User" }]
                    }
                  };
                  setNotification(prev => [testNotification, ...prev]);
                }}
                borderRadius="lg"
                _hover={{
                  bg: "blue.100",
                  transform: "translateX(5px)",
                  transition: "all 0.2s ease-in-out"
                }}
                transition="all 0.2s ease-in-out"
              >
                🧪 Add Test Notification
              </MenuItem>
            </MenuList>
          </Menu>

          {/* Centered Name */}
          <Flex direction="column" align="center" justify="center" flex="1">
            <Text
              fontSize={{ base: "3xl", md: "5xl", lg: "6xl" }}
              fontFamily="'Poppins', sans-serif"
              fontWeight="800"
              letterSpacing="tight"
              textAlign="center"
              sx={{
                background: "linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
                filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))"
              }}
            >
              YapMonster
            </Text>
          </Flex>

          {/* Profile and logout section on the right */}
          <Flex alignItems="center">
            <Menu>
              <MenuButton 
                as={Button} 
                bg="rgba(255, 255, 255, 0.2)"
                backdropFilter="blur(10px)"
                border="2px solid rgba(255, 255, 255, 0.3)"
                size="lg" 
                rightIcon={<ChevronDownIcon color="white" />}
                borderRadius="full"
                px={4}
                _hover={{
                  bg: "rgba(255, 255, 255, 0.3)",
                  transform: "scale(1.05)",
                  transition: "all 0.2s ease-in-out"
                }}
                transition="all 0.2s ease-in-out"
              >
                <Avatar
                  size="md"
                  cursor="pointer"
                  name={user.name}
                  src={user.pic}
                  border="3px solid white"
                  boxShadow="0 4px 12px rgba(0, 0, 0, 0.2)"
                  objectFit="cover"
                  borderRadius="full"
                />
              </MenuButton>
              <MenuList 
                bg="white" 
                borderRadius="xl"
                boxShadow="0 20px 40px rgba(0, 0, 0, 0.15)"
                border="none"
                p={2}
              >
                <ProfileModal user={user}>
                  <MenuItem 
                    borderRadius="lg"
                    mb={1}
                    _hover={{
                      bg: "purple.100",
                      transform: "translateX(5px)",
                      transition: "all 0.2s ease-in-out"
                    }}
                    transition="all 0.2s ease-in-out"
                  >
                    My Profile
                  </MenuItem>
                </ProfileModal>
                <MenuDivider />
                <MenuItem 
                  onClick={logoutHandler}
                  borderRadius="lg"
                  _hover={{
                    bg: "red.50",
                    transform: "translateX(5px)",
                    transition: "all 0.2s ease-in-out"
                  }}
                  transition="all 0.2s ease-in-out"
                >
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>
      </Box>
    </>
  );
}

export default SideDrawer;
