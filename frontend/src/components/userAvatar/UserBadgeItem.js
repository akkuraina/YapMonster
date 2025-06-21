import { CloseIcon } from "@chakra-ui/icons";
import { Badge } from "@chakra-ui/react";

const UserBadgeItem = ({ user, handleFunction, admin }) => {
  return (
    <Badge
      px={3}
      py={2}
      borderRadius="lg"
      m={1}
      mb={2}
      variant="solid"
      fontSize={14}
      colorScheme="purple" /* Updated to purple theme */
      size="sm"
      cursor="pointer"
      onClick={handleFunction}
      bg="purple.500" /* Custom purple background */
      color="white" /* White text for contrast */
      _hover={{ bg: "purple.600" }} /* Darker purple on hover */
    >
      <span>{user.name}</span>
      {admin === user._id && <span> (Admin)</span>}
      <CloseIcon pl={1} ml={2} cursor="pointer" />
    </Badge>
  );
};

export default UserBadgeItem;
