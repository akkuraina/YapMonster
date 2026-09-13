import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Avatar,
  VStack,
  Text,
  Box,
  keyframes,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { FaVideo } from "react-icons/fa";

// Pulse animation for incoming call ring effect
const pulseRing = keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(72, 187, 120, 0.7);
  }
  70% {
    transform: scale(1.08);
    box-shadow: 0 0 0 20px rgba(72, 187, 120, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(72, 187, 120, 0);
  }
`;

const IncomingCallModal = ({ isOpen, caller, chatName, isGroupChat, onAccept, onDecline }) => {
  if (!caller) return null;

  return (
    <Modal isOpen={isOpen} onClose={onDecline} isCentered closeOnOverlayClick={false}>
      <ModalOverlay bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(8px)" />
      <ModalContent
        bg="linear-gradient(135deg, #1a202c 0%, #2d3748 100%)"
        color="white"
        borderRadius="24px"
        p={4}
        boxShadow="0 20px 40px rgba(0, 0, 0, 0.5)"
        border="1px solid rgba(255, 255, 255, 0.1)"
        maxW="400px"
      >
        <ModalHeader textAlign="center" pb={0}>
          <Text fontSize="sm" color="purple.300" textTransform="uppercase" letterSpacing="wider" fontWeight="bold">
            {isGroupChat ? "Incoming Group Video Call" : "Incoming Video Call"}
          </Text>
        </ModalHeader>

        <ModalBody py={6}>
          <VStack spacing={5} align="center">
            <Box
              position="relative"
              borderRadius="full"
              animation={`${pulseRing} 2s infinite`}
            >
              <Avatar
                size="2xl"
                name={caller.name}
                src={caller.pic}
                border="4px solid #48BB78"
              />
            </Box>

            <VStack spacing={1} textAlign="center">
              <Text fontSize="2xl" fontWeight="bold">
                {caller.name}
              </Text>
              {isGroupChat && chatName && (
                <Text fontSize="md" color="gray.300">
                  in <Text as="span" color="purple.300" fontWeight="semibold">{chatName}</Text>
                </Text>
              )}
              <Text fontSize="sm" color="gray.400">
                Calling via YapMonster Video...
              </Text>
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter justifyContent="center" gap={6} pt={0} pb={4}>
          <Button
            leftIcon={<CloseIcon />}
            bg="red.500"
            _hover={{ bg: "red.600", transform: "scale(1.05)" }}
            _active={{ bg: "red.700" }}
            color="white"
            borderRadius="full"
            px={6}
            py={6}
            fontWeight="bold"
            boxShadow="0 4px 15px rgba(229, 62, 62, 0.4)"
            onClick={onDecline}
          >
            Decline
          </Button>
          <Button
            leftIcon={<FaVideo />}
            bg="green.500"
            _hover={{ bg: "green.600", transform: "scale(1.05)" }}
            _active={{ bg: "green.700" }}
            color="white"
            borderRadius="full"
            px={6}
            py={6}
            fontWeight="bold"
            boxShadow="0 4px 15px rgba(72, 187, 120, 0.4)"
            onClick={onAccept}
          >
            Accept
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default IncomingCallModal;
