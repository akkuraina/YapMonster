import { CloseIcon } from "@chakra-ui/icons";
import { Badge } from "@chakra-ui/react";

const UserBadgeItem = ({ user, handleFunction, admin }) => {
  return (
    <Badge
      px={3}
      py={1.5}
      borderRadius="full"
      m={1}
      variant="solid"
      fontSize="xs"
      fontWeight="600"
      cursor="pointer"
      onClick={handleFunction}
      bg="rgba(90, 103, 216, 0.3)"
      border="1px solid rgba(186, 230, 253, 0.35)"
      color="#BAE6FD"
      display="inline-flex"
      alignItems="center"
      gap={1.5}
      _hover={{
        bg: "rgba(239, 68, 68, 0.3)",
        borderColor: "rgba(239, 68, 68, 0.6)",
        color: "#FCA5A5",
      }}
      transition="all 0.2s ease"
    >
      <span>{user.name}</span>
      {(admin?._id === user._id || admin === user._id) && (
        <span style={{ fontSize: "10px", color: "#FCD34D", fontWeight: 700 }}> (Admin)</span>
      )}
      <CloseIcon w={2.5} h={2.5} ml={1} />
    </Badge>
  );
};

export default UserBadgeItem;
