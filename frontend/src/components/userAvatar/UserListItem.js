import { Avatar } from "@chakra-ui/avatar";
import { Box, Text } from "@chakra-ui/layout";

const UserListItem = ({ user, handleFunction }) => {
  return (
    <Box
      onClick={handleFunction}
      cursor="pointer"
      bg="rgba(255, 255, 255, 0.05)"
      _hover={{
        background: "linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)",
        color: "white",
        transform: "translateY(-1px)",
        boxShadow: "0 4px 14px rgba(90, 103, 216, 0.35)",
        borderColor: "rgba(255, 255, 255, 0.25)",
      }}
      w="100%"
      display="flex"
      alignItems="center"
      color="white"
      px={3.5}
      py={2.5}
      mb={2}
      borderRadius="xl"
      border="1px solid rgba(255, 255, 255, 0.08)"
      transition="all 0.2s ease-in-out"
    >
      <Avatar
        mr={3}
        size="sm"
        cursor="pointer"
        name={user.name}
        src={user.pic}
        border="1.5px solid rgba(255, 255, 255, 0.2)"
      />
      <Box>
        <Text fontSize="sm" fontWeight="600">{user.name}</Text>
        <Text fontSize="xs" color="rgba(255, 255, 255, 0.6)">
          <b>Email: </b>
          {user.email}
        </Text>
      </Box>
    </Box>
  );
};

export default UserListItem;