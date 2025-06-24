import { Avatar } from "@chakra-ui/avatar";
import { Box, Text } from "@chakra-ui/layout";

const UserListItem = ({ user, handleFunction }) => {
  return (
    <Box
      onClick={handleFunction}
      cursor="pointer"
      bg="white"
      _hover={{
        background: "linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%)",
        color: "white",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(90, 103, 216, 0.3)",
        transition: "all 0.3s ease-in-out"
      }}
      w="100%"
      d="flex"
      alignItems="center"
      color="gray.700"
      px={3}
      py={2}
      mb={2}
      borderRadius="lg"
      border="1px solid"
      borderColor="purple.200"
      transition="all 0.3s ease-in-out"
    >
      <Avatar
        mr={2}
        size="sm"
        cursor="pointer"
        name={user.name}
        src={user.pic}
      />
      <Box>
        <Text>{user.name}</Text>
        <Text fontSize="xs">
          <b>Email : </b>
          {user.email}
        </Text>
      </Box>
    </Box>
  );
};

export default UserListItem;