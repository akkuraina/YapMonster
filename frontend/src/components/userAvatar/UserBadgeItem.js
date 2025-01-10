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
      colorScheme="green" /* Updated to green theme */
      cursor="pointer"
      onClick={handleFunction}
      display="flex"
      alignItems="center"
      bg="green.500" /* Custom green background */
      color="white" /* White text for contrast */
      _hover={{ bg: "green.600" }} /* Darker green on hover */
    >
      <span>{user.name}</span>
      {admin === user._id && <span> (Admin)</span>}
      <CloseIcon pl={1} ml={2} cursor="pointer" />
    </Badge>
  );
};

export default UserBadgeItem;
