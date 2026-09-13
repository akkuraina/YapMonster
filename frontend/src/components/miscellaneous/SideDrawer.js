import React, { useState } from "react";
import { useDisclosure } from "@chakra-ui/hooks";
import { Box, Text, Flex, Badge, HStack, VStack } from "@chakra-ui/layout";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import { BellIcon, SearchIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/toast";
import { IconButton, Button, Input, Spinner, Tooltip } from "@chakra-ui/react";
import axios from "axios";
import { Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton } from "@chakra-ui/react";
import { getSender } from "../../config/ChatLogics";
import ProfileModal from "./ProfileModal";
import UserListItem from "../userAvatar/UserListItem";
import ChatLoading from "../ChatLoading";
import { ChatState } from "../../Context/ChatProvider";
import YapMonsterWordmark from "../common/YapMonsterWordmark";
import config from "../../config/config";

// Notification Badge Component with subtle pulse
const NotificationBadge = ({ count, children }) => {
  return (
    <Box position="relative" display="inline-block">
      {children}
      {count > 0 && (
        <Badge
          position="absolute"
          top="-6px"
          right="-6px"
          bg="linear-gradient(135deg, #FF6B6B 0%, #EE5253 100%)"
          color="white"
          borderRadius="full"
          fontSize="2xs"
          fontWeight="bold"
          minW="18px"
          h="18px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          border="2px solid #5A67D8"
          boxShadow="0 2px 6px rgba(238, 82, 83, 0.5)"
        >
          {count > 99 ? "99+" : count}
        </Badge>
      )}
    </Box>
  );
};

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
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      toast({
        title: "Search Term Required",
        description: "Please enter a name or email to search",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);
      const config_headers = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        `${config.BACKEND_URL}/api/user?search=${search}`,
        config_headers
      );

      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Failed to load search results",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config_headers = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        `${config.BACKEND_URL}/api/chat`,
        { userId },
        config_headers
      );

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching chat",
        description: error.response?.data?.message || "Could not open conversation",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoadingChat(false);
    }
  };

  return (
    <>
      {/* Top Header Bar */}
      <Box
        bg="rgba(4, 9, 24, 0.92)"
        backdropFilter="blur(20px)"
        borderBottom="1px solid rgba(255, 255, 255, 0.08)"
        w="100%"
        px={{ base: 3, sm: 4, md: 6 }}
        py={2.5}
        h={{ base: "62px", md: "70px" }}
        boxShadow="0 4px 25px rgba(0, 0, 0, 0.5)"
        position="relative"
        zIndex={100}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        {/* Left Action: Search Users Trigger */}
        <HStack spacing={2}>
          <Tooltip label="Search users to chat" placement="bottom-start">
            <Button
              variant="ghost"
              onClick={onOpen}
              bg="rgba(255, 255, 255, 0.08)"
              border="1px solid rgba(255, 255, 255, 0.12)"
              color="white"
              borderRadius="full"
              h={{ base: "36px", md: "40px" }}
              px={{ base: 2.5, md: 4 }}
              _hover={{
                bg: "rgba(255, 255, 255, 0.15)",
                transform: "translateY(-1px)",
              }}
              _active={{ transform: "translateY(0)" }}
              fontSize="xs"
              fontWeight="600"
              leftIcon={<SearchIcon />}
            >
              <Text display={{ base: "none", md: "inline" }}>Search Users</Text>
            </Button>
          </Tooltip>
        </HStack>

        {/* Center: Signature Wordmark */}
        <Flex align="center" justify="center" flex="1" mx={2}>
          <YapMonsterWordmark size="lg" color="lightBlue" glow={true} />
        </Flex>

        {/* Right Actions: Notifications + Profile */}
        <HStack spacing={{ base: 2, md: 3 }}>
          {/* Notification Bell Menu */}
          <Menu>
            <MenuButton
              as={IconButton}
              icon={
                <NotificationBadge count={notification.length}>
                  <BellIcon fontSize="xl" color="white" />
                </NotificationBadge>
              }
              bg="rgba(255, 255, 255, 0.15)"
              _hover={{ bg: "rgba(255, 255, 255, 0.25)", transform: "scale(1.05)" }}
              _active={{ bg: "rgba(255, 255, 255, 0.3)" }}
              borderRadius="full"
              h={{ base: "36px", md: "40px" }}
              w={{ base: "36px", md: "40px" }}
              aria-label="Notifications"
            />
            <MenuList
              bg="white"
              borderRadius="2xl"
              boxShadow="0 12px 35px rgba(0, 0, 0, 0.2)"
              border="none"
              p={2}
              minW="260px"
              zIndex={1000}
            >
              {!notification.length && (
                <Text p={4} color="gray.500" fontSize="xs" textAlign="center" fontWeight="500">
                  🎉 No new notifications
                </Text>
              )}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                  borderRadius="xl"
                  mb={1}
                  p={3}
                  _hover={{ bg: "purple.50", color: "purple.700" }}
                  fontSize="xs"
                  fontWeight="600"
                >
                  {notif.chat.isGroupChat
                    ? `💬 New in ${notif.chat.chatName}`
                    : `💬 New from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          {/* Profile Dropdown */}
          <Menu>
            <MenuButton
              as={Box}
              cursor="pointer"
              borderRadius="full"
              p="2px"
              transition="all 0.2s ease"
              _hover={{ transform: "scale(1.08)", boxShadow: "0 0 12px rgba(255, 255, 255, 0.5)" }}
            >
              <Avatar
                size="sm"
                name={user?.name}
                src={user?.pic}
                border="2px solid white"
                bg="purple.700"
              />
            </MenuButton>
            <MenuList
              bg="white"
              borderRadius="2xl"
              boxShadow="0 12px 35px rgba(90, 103, 216, 0.2)"
              border="none"
              p={2}
              minW="200px"
              zIndex={1000}
            >
              <ProfileModal user={user}>
                <MenuItem
                  borderRadius="xl"
                  fontWeight="600"
                  fontSize="sm"
                  color="gray.700"
                  _hover={{ bg: "purple.50", color: "purple.700" }}
                  mb={1}
                >
                  👤 My Profile
                </MenuItem>
              </ProfileModal>
              <MenuItem
                borderRadius="xl"
                fontWeight="600"
                fontSize="sm"
                color="red.500"
                _hover={{ bg: "red.50" }}
                onClick={logoutHandler}
              >
                🚪 Sign Out
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Box>

      {/* User Search Drawer */}
      <Drawer placement="left" onClose={onClose} isOpen={isOpen} size="sm">
        <DrawerOverlay bg="rgba(0, 0, 0, 0.75)" backdropFilter="blur(8px)" />
        <DrawerContent bg="linear-gradient(180deg, #020617 0%, #080d24 100%)" color="white" borderRight="1px solid rgba(255, 255, 255, 0.08)">
          <DrawerCloseButton color="white" />
          <DrawerHeader borderBottom="1px solid rgba(255, 255, 255, 0.08)" py={4}>
            <Text fontSize="lg" fontWeight="700" fontFamily="'Plus Jakarta Sans', sans-serif">
              Find Users to Chat
            </Text>
          </DrawerHeader>

          <DrawerBody p={4}>
            <Flex gap={2} mb={5}>
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                bg="rgba(255, 255, 255, 0.08)"
                border="1px solid rgba(255, 255, 255, 0.15)"
                color="white"
                borderRadius="xl"
                fontSize="sm"
                _placeholder={{ color: "rgba(255, 255, 255, 0.45)" }}
                _focus={{
                  borderColor: "#63B3ED",
                  boxShadow: "0 0 0 1px #63B3ED",
                }}
              />
              <Button
                onClick={handleSearch}
                isLoading={loading}
                bg="linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)"
                color="white"
                borderRadius="xl"
                px={5}
                fontWeight="700"
                fontSize="sm"
                _hover={{ filter: "brightness(1.1)" }}
              >
                Go
              </Button>
            </Flex>

            {loading ? (
              <ChatLoading />
            ) : (
              <VStack spacing={2} align="stretch">
                {searchResult.map((u) => (
                  <UserListItem
                    key={u._id}
                    user={u}
                    handleFunction={() => accessChat(u._id)}
                  />
                ))}
              </VStack>
            )}

            {loadingChat && (
              <Flex justify="center" mt={4}>
                <Spinner size="md" color="purple.400" />
              </Flex>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SideDrawer;
