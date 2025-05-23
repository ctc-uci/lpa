import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Checkbox,
  Flex,
  Heading,
  Icon,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  StackDivider,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";

import { useNavigate } from "react-router-dom";

import {
  EmailIcon,
  PersonIcon,
  UpDownArrowIcon,
} from "../../assets/AdminSettingsIcons";
import { EllipsisIcon } from "../../assets/EllipsisIcon";
import { GoogleCalendarIcon } from "../../assets/GoogleCalendarIcon";
import { LeftIcon } from "../../assets/LeftIcon";
import { LocationPinIcon } from "../../assets/LocationPinIcon";
import { PlusIcon } from "../../assets/PlusIcon";
import { UserIcon } from "../../assets/UserIcon";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import Navbar from "../navbar/Navbar";

const ConfirmationModal = ({
  isOpen,
  onClose,
  title,
  body,
  onConfirm,
  primaryButtonBackgroundColor,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
  >
    <ModalOverlay />
    <ModalContent gap="1.5rem">
      <ModalHeader>{title}</ModalHeader>
      <ModalBody>
        <Text>{body}</Text>
      </ModalBody>
      <ModalFooter>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          marginLeft="0.75rem"
          backgroundColor={primaryButtonBackgroundColor}
          onClick={onConfirm}
        >
          <Text color="white">Confirm</Text>
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

const RoomSettings = ({
  room,
  isInitiallyEditing = false,
  onSave,
  onCancel,
}) => {
  const { backend } = useBackendContext();

  const [isEditing, setIsEditing] = useState(isInitiallyEditing);

  const isInitiallyInvalid = room.id ? false : true;
  const [isInvalidRoomName, setInvalidRoomName] = useState(isInitiallyInvalid);
  const [isInvalidNumericInput, setInvalidNumericInput] =
    useState(isInitiallyInvalid);
  const [isInvalidDescription, setInvalidDescription] =
    useState(isInitiallyInvalid);

  const [roomName, setRoomName] = useState(room.name);
  const [roomRate, setRoomRate] = useState(parseFloat(room.rate).toFixed(2));
  const [roomDescription, setRoomDescription] = useState(room.description);

  const [originalRoomName, setOriginalRoomName] = useState(room.name);

  const {
    isOpen: isCancelModalOpen,
    onOpen: onCancelModalOpen,
    onClose: onCancelModalClose,
  } = useDisclosure();
  const {
    isOpen: isSaveModalOpen,
    onOpen: onSaveModalOpen,
    onClose: onSaveModalClose,
  } = useDisclosure();

  const handleRoomNameEdit = (e) => {
    if (e.target.value === "") {
      setInvalidRoomName(true);
    } else {
      setInvalidRoomName(false);
    }
    setRoomName(e.target.value);
  };

  const handleNumericInputEdit = (value) => {
    if (value[0] === "e" || value === "") {
      setInvalidNumericInput(true);
    } else {
      setInvalidNumericInput(false);
    }
    setRoomRate(value);
  };

  const handleDescription = (e) => {
    if (e.target.value === "") {
      setInvalidDescription(true);
    } else {
      setInvalidDescription(false);
    }
    setRoomDescription(e.target.value);
  };

  const handleCancel = () => {
    if (!room.id) {
      onCancel();
    } else {
      setRoomName(originalRoomName);
      setRoomRate(parseFloat(room.rate).toFixed(2));
      setRoomDescription(room.description);
      setInvalidRoomName(false);
      setInvalidNumericInput(false);
      setInvalidDescription(false);
      setIsEditing(false);
    }
    onCancelModalClose();
  };

  const handleSave = async () => {
    const updatedRoom = {
      name: roomName,
      rate: roomRate,
      description: roomDescription,
    };

    if (room.id) {
      await backend.put("/rooms/" + room.id, updatedRoom);
      if (onSave) {
        onSave({ id: room.id, ...updatedRoom });
      }
      setOriginalRoomName(roomName);
    } else {
      const newRoomResponse = await backend.post("/rooms", updatedRoom);
      const savedRoom = { id: newRoomResponse.data[0].id, ...updatedRoom };
      onSave(savedRoom);
    }
    onSaveModalClose();
    setIsEditing(false);
  };

  useEffect(() => {
    setRoomName(room.name);
    setRoomRate(parseFloat(room.rate).toFixed(2));
    setRoomDescription(room.description);
  }, [room]);

  return (
    <VStack
      divider={<StackDivider style={{ margin: "0px" }} />}
      border="1px solid #E2E8F0"
      borderRadius="15px"
      padding="1.5rem"
      gap="1.5rem"
      alignItems="start"
    >
      <Flex
        width="100%"
        alignItems="center"
      >
        <LocationPinIcon></LocationPinIcon>
        {isEditing ? (
          <Input
            maxW="18rem"
            marginLeft="0.75rem"
            value={roomName}
            onChange={handleRoomNameEdit}
            placeholder="Add room name here..."
            style={{ fontWeight: "bold" }}
            isInvalid={isInvalidRoomName}
          ></Input>
        ) : (
          <Text
            marginLeft="0.75rem"
            as="b"
          >
            {roomName}
          </Text>
        )}
        {isEditing ? (
          <>
            <Text
              marginLeft="3rem"
              as="b"
            >
              $
            </Text>
            <NumberInput
              w="10rem"
              marginLeft="0.25rem"
              precision={2}
              value={roomRate}
              onChange={handleNumericInputEdit}
              isInvalid={isInvalidNumericInput}
            >
              <NumberInputField fontWeight="bold" />
            </NumberInput>
          </>
        ) : (
          <Text
            marginLeft="3rem"
            as="b"
          >
            ${roomRate}
          </Text>
        )}
        <Text
          marginLeft="0.25rem"
          as="b"
        >
          / hour
        </Text>
        {isEditing ? (
          <>
            <Button
              marginLeft="auto"
              padding="0rem 1.25rem"
              onClick={() => {
                onCancelModalOpen();
              }}
            >
              <Text color="#2D3748">Cancel</Text>
            </Button>
            <Button
              marginLeft="0.75rem"
              padding="0rem 1.25rem"
              backgroundColor="#4441C8"
              onClick={() => {
                if (room.id) {
                  onSaveModalOpen();
                } else {
                  handleSave();
                }
              }}
              isDisabled={
                isInvalidRoomName ||
                isInvalidNumericInput ||
                isInvalidDescription
              }
            >
              <Text color="#FFFFFF">Save</Text>
            </Button>
          </>
        ) : (
          <Button
            marginLeft="auto"
            onClick={() => {
              setIsEditing(true);
            }}
          >
            <EllipsisIcon></EllipsisIcon>
          </Button>
        )}
        <ConfirmationModal
          isOpen={isCancelModalOpen}
          onClose={onCancelModalClose}
          title="Discard changes?"
          body={`Your edits to the ${room.id ? originalRoomName : roomName || "new"} room will not be saved.`}
          onConfirm={handleCancel}
          primaryButtonBackgroundColor="#90080F"
        />
        {room.id && (
          <ConfirmationModal
            isOpen={isSaveModalOpen}
            onClose={onSaveModalClose}
            title={`Save changes to ${roomName || "new"} room?`}
            body="Editing this room will affect all upcoming sessions, programs, and invoices that have not been generated yet."
            onConfirm={handleSave}
            primaryButtonBackgroundColor="#4441C8"
          />
        )}
      </Flex>
      {isEditing ? (
        <Textarea
          value={roomDescription}
          onChange={handleDescription}
          isInvalid={isInvalidDescription}
        />
      ) : (
        <Text>{roomDescription}</Text>
      )}
    </VStack>
  );
};

export const RoomsSettings = () => {
  const { backend } = useBackendContext();
  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoomsData = async () => {
      try {
        const roomsResponse = await backend.get("/rooms");
        setRooms(roomsResponse.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchRoomsData();
  }, [backend]);

  const handleAddNewRoom = () => {
    setNewRoom({ name: "", rate: "0.00", description: "" });
  };

  const handleCancelNewRoom = () => {
    setNewRoom(null);
  };

  const handleSaveOrUpdateRoom = (updatedRoom) => {
    setRooms((prevRooms) => {
      const roomIndex = prevRooms.findIndex((r) => r.id === updatedRoom.id);
      if (roomIndex >= 0) {
        return prevRooms.map((r) =>
          r.id === updatedRoom.id ? updatedRoom : r
        );
      }
      return [...prevRooms, updatedRoom];
    });
    setNewRoom(null);
  };

  return (
    <Navbar>
      <Flex
        direction="column"
        padding="32px"
        gap="32px"
      >
        <Flex alignItems="center">
          <Flex direction="column">
            <Flex
              mb="32px"
              alignItems="center"
            >
              <IconButton
                icon={<LeftIcon />}
                bg="white"
                onClick={() => {
                  navigate("/settings");
                }}
              />

              <Button
                backgroundColor="#4441C8"
                marginLeft="auto"
                gap="0.75rem"
                padding="1.5rem"
                onClick={() => {
                  handleAddNewRoom();
                }}
              >
                <PlusIcon size="1rem" />
                <Text
                  as="b"
                  fontSize="1rem"
                  color="#FFF"
                >
                  New Room
                </Text>
              </Button>
            </Flex>
            <Flex alignItems="center">
              <Text
                as="b"
                fontSize="1.75rem"
              >
                Rooms
              </Text>
            </Flex>
            <Flex
              direction="column"
              marginTop="2.5rem"
              gap="1.25rem"
              color="#718096"
            >
              {rooms.map((room) => (
                <RoomSettings
                  key={room.id}
                  room={room}
                  onSave={handleSaveOrUpdateRoom}
                />
              ))}
              {newRoom && (
                <RoomSettings
                  room={newRoom}
                  isInitiallyEditing={true}
                  onSave={handleSaveOrUpdateRoom}
                  onCancel={handleCancelNewRoom}
                />
              )}
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Navbar>
  );
};

// export default RoomsSettings;
