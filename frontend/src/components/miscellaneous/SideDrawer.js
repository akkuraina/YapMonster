import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Box, Text, Flex } from "@chakra-ui/layout";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/modal";
import { Tooltip } from "@chakra-ui/tooltip";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import { useNavigate } from "react-router-dom"; // <-- Import useNavigate here
import { useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/toast";
import ChatLoading from "../ChatLoading";
import { Spinner } from "@chakra-ui/spinner";
import ProfileModal from "./ProfileModal";
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";
import { getSender } from "../../config/ChatLogics";
import UserListItem from "../userAvatar/UserListItem";
import { ChatState } from "../../Context/ChatProvider";

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate(); // <-- Use useNavigate here

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/"); // <-- Replace history.push() with navigate()
  };

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`, // Fixed here
        },
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config);

      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const accessChat = async (userId) => {
    console.log(userId);

    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`, // Fixed here
        },
      };
      const { data } = await axios.post(`/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  return (
    <>
      <Box
        bg="green.100" // Soft green background
        w="100%"
        p="5px 20px 5px 20px" // Increased padding for a larger look
        borderWidth="5px"
        borderColor="green.400" // Green border color
        h="170px" // Increased height for larger side drawer
      >
        <Flex alignItems="center" justifyContent="space-between">
          {/* Notification icon on the left */}
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge size="50px" count={notification.length} effect={Effect.SCALE} />
              <BellIcon fontSize="5xl" m={1} color="green.600" /> {/* Larger size and dark green color */}
            </MenuButton>
            <MenuList pl={2}>
              {!notification.length && "No New Messages"}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          {/* Centered Name and Search Bar */}
          <Flex direction="column" align="center" justify="center" flex="1">
            <Text
              fontSize={{ base: "4xl", md: "6xl", lg: "6xl" }} // Make it responsive
              fontFamily="Work sans"
              fontWeight="bold"
              sx={{
                background: "linear-gradient(to right, #38A169, #2F855A)", // Green gradient
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              YapMonster
            </Text>

            <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
              <Button variant="ghost" onClick={onOpen} colorScheme="green" mt={4}>
                <i className="fas fa-search"></i>
                <Text d={{ base: "none", md: "flex" }} px={4}>
                  Search User
                </Text>
              </Button>
            </Tooltip>
          </Flex>

          {/* Profile and logout section on the right */}
          <Flex alignItems="center">
            <Menu>
              <MenuButton as={Button} bg="green.600" size="lg" rightIcon={<ChevronDownIcon />}>
                <Avatar
                  size="md"
                  cursor="pointer"
                  name={user.name}
                  src={user.pic}
                  color="green.600" // Dark green color for the profile icon
                />
              </MenuButton>
              <MenuList>
                <ProfileModal user={user}>
                  <MenuItem>My Profile</MenuItem>
                </ProfileModal>
                <MenuDivider />
                <MenuItem onClick={logoutHandler}>Logout</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>
      </Box>

      {/* Drawer for searching users */}
      <Drawer placement="left" onClose={onClose} isOpen={isOpen} size="lg"> {/* Make the drawer larger */}
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px" bg="green.200">
            Search Users
          </DrawerHeader>
          <DrawerBody>
            <Box d="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                focusBorderColor="green.400" // Green border on focus
              />
              <Button onClick={handleSearch} colorScheme="green">
                Go
              </Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" d="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SideDrawer;
