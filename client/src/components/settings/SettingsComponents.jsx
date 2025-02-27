import { useEffect, useState } from "react";

import {
    Button,
    Flex,
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
    Text,
    Textarea,
    VStack,
} from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react"

import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { EllipsisIcon } from "../../assets/EllipsisIcon";
import { GoogleCalendarIcon } from "../../assets/GoogleCalendarIcon";
import { LocationPinIcon } from "../../assets/LocationPinIcon";
import { PlusIcon } from "../../assets/PlusIcon";
import { UserIcon } from "../../assets/UserIcon";


const GeneralSettings = ({ selectedComponent, setSelectedComponent }) => {
    const componentMap = {
        "general": <GeneralSettingsMenu setSelectedComponent={setSelectedComponent}></GeneralSettingsMenu>,
        "account": <h1> Account </h1>,
        "rooms": <RoomsSettings></RoomsSettings>,
        "calendar": <h1> Calendar </h1>
    }

    return (
        <>
            {componentMap[selectedComponent]}
        </>
    )
}


const GeneralSettingsMenu = ({ setSelectedComponent }) => {
    return (
        <VStack
            divider={<StackDivider style={{ margin: "0px" }} />}
            border="1px solid #E2E8F0"
            borderRadius="15px"
        >
            <Button
                width="100%"
                padding="3rem"
                backgroundColor="transparent"
                justifyContent="start"
                gap="0.75rem"
                onClick={() => setSelectedComponent("account")}
            >
                <UserIcon></UserIcon>
                <Text>
                    My Account
                </Text>
            </Button>
            <Button
                width="100%"
                padding="3rem"
                backgroundColor="transparent"
                justifyContent="start"
                gap="0.75rem"
                onClick={() => setSelectedComponent("rooms")}
            >
                <LocationPinIcon></LocationPinIcon>
                <Text>
                    Rooms
                </Text>
            </Button>
            <Button
                width="100%"
                padding="3rem"
                backgroundColor="transparent"
                justifyContent="start"
                gap="0.75rem"
                onClick={() => setSelectedComponent("calendar")}
            >
                <GoogleCalendarIcon></GoogleCalendarIcon>
                <Text>
                    Google Calendar
                </Text>
            </Button>
        </VStack>
    );
}


const ConfirmationModal = ({ isOpen, onClose, title, body, onConfirm, primaryButtonBackgroundColor }) => (
    <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent gap="1.5rem">
            <ModalHeader>{title}</ModalHeader>
            <ModalBody>
                <Text>{body}</Text>
            </ModalBody>
            <ModalFooter>
                <Button onClick={onClose}>Cancel</Button>
                <Button marginLeft="0.75rem" backgroundColor={primaryButtonBackgroundColor} onClick={onConfirm}>
                    <Text color="white">Confirm</Text>
                </Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
);


const RoomSettings = ({ room, isInitiallyEditing = false, onSave, onCancel }) => {
    const { backend } = useBackendContext();

    const [isEditing, setIsEditing] = useState(isInitiallyEditing);
    const [isInvalidNumericInput, setInvalidNumericInput] = useState(false);
    const [roomName, setRoomName] = useState(room.name);
    const [roomRate, setRoomRate] = useState(parseFloat(room.rate).toFixed(2));
    const [roomDescription, setRoomDescription] = useState(room.description);

    // const [prevRoomName, setPrevRoomName] = useState(room.name);

    const { isOpen: isCancelModalOpen, onOpen: onCancelModalOpen, onClose: onCancelModalClose } = useDisclosure()
    const { isOpen: isSaveModalOpen, onOpen: onSaveModalOpen, onClose: onSaveModalClose } = useDisclosure()

    const handleNumericInputEdit = (value) => {
        if (value[0] === "e") {
            setInvalidNumericInput(true);
        } else {
            setInvalidNumericInput(false);
        }
        setRoomRate(value);
    }

    const handleCancel = () => {
        console.log(room);
        if (!room.id) {
            onCancel();
        } else {
            setRoomName(room.name);
            setRoomRate(parseFloat(room.rate).toFixed(2));
            setRoomDescription(room.description);
            setIsEditing(false);
        }
        onCancelModalClose();
    }

    const handleSave = async () => {
        const updatedRoom = {
            name: roomName,
            rate: roomRate,
            description: roomDescription
        };

        if (room.id) {
            await backend.put("/rooms/" + room.id, updatedRoom);
            if (onSave) {
                onSave({ id: room.id, ...updatedRoom });
            }
        } else {
            const newRoomResponse = await backend.post("/rooms", updatedRoom);
            const savedRoom = { id: newRoomResponse.data[0].id, ...updatedRoom };
            onSave(savedRoom);
        }

        // setPrevRoomName(roomName);
        onSaveModalClose();
        setIsEditing(false);
    };

    useEffect(() => {
        setRoomName(room.name);
        setRoomRate(parseFloat(room.rate).toFixed(2));
        setRoomDescription(room.description);
        // setPrevRoomName(room.name);
    }, [room]);

    console.log(room);

    return (
        <VStack
            divider={<StackDivider style={{ margin: "0px" }} />}
            border="1px solid #E2E8F0"
            borderRadius="15px"
            padding="1.5rem"
            gap="1.5rem"
            alignItems="start"
        >
            <Flex width="100%" alignItems="center">
                <LocationPinIcon></LocationPinIcon>
                {
                    isEditing ? (
                        <Input
                            maxW="18rem"
                            marginLeft="0.75rem"
                            value={roomName}
                            onChange={(e) => { setRoomName(e.target.value) }}
                            placeholder="Add room name here..."
                            style={{ fontWeight: "bold" }}>
                        </Input>
                    ) : (
                        <Text marginLeft="0.75rem" as="b">
                            {roomName}
                        </Text>
                    )
                }
                {
                    isEditing ? (
                        <>
                            <Text marginLeft="3rem" as="b">
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
                        <Text marginLeft="3rem" as="b">${roomRate}</Text>
                    )
                }
                <Text marginLeft="0.25rem" as="b">
                    / hour
                </Text>
                {
                    isEditing ? (
                        <>
                            <Button marginLeft="auto" padding="0rem 1.25rem" onClick={() => { onCancelModalOpen() }}>
                                <Text color="#2D3748">
                                    Cancel
                                </Text>
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
                                isDisabled={isInvalidNumericInput}>
                                <Text color="#FFFFFF">
                                    Save
                                </Text>
                            </Button>
                        </>
                    ) : (
                        <Button marginLeft="auto" onClick={() => { setIsEditing(true) }}>
                            <EllipsisIcon></EllipsisIcon>
                        </Button>
                    )

                }
                <ConfirmationModal
                    isOpen={isCancelModalOpen}
                    onClose={onCancelModalClose}
                    title="Discard changes?"
                    body={`Your edits to the ${roomName || "new"} room will not be saved.`}
                    onConfirm={handleCancel}
                    primaryButtonBackgroundColor="#90080F"
                />
                {
                    room.id && (
                        <ConfirmationModal
                            isOpen={isSaveModalOpen}
                            onClose={onSaveModalClose}
                            title={`Save changes to ${roomName || "new"} room?`}
                            body="Editing this room will affect all upcoming sessions, programs, and invoices that have not been generated yet."
                            onConfirm={handleSave}
                            primaryButtonBackgroundColor="#4441C8"
                        />
                    )
                }
            </Flex>
            {
                isEditing ? (
                    <Textarea value={roomDescription} onChange={(e) => { setRoomDescription(e.target.value) }} />
                ) : (
                    <Text>{roomDescription}</Text>
                )
            }
        </VStack>
    );
};


const RoomsSettings = () => {
    const { backend } = useBackendContext();
    const [rooms, setRooms] = useState([]);
    const [newRoom, setNewRoom] = useState(null);

    useEffect(() => {
        const fetchRoomsData = async () => {
            try {
                const roomsResponse = await backend.get("/rooms");
                setRooms(roomsResponse.data);
            }
            catch (err) {
                console.log(err);
            }
        };
        fetchRoomsData();
    }, [backend]);

    const handleAddNewRoom = () => {
        setNewRoom({ name: "", rate: "0.00", description: "" });
    }

    const handleCancelNewRoom = () => {
        setNewRoom(null);
    }

    const handleSaveOrUpdateRoom = (updatedRoom) => {
        setRooms(prevRooms => {
            const roomIndex = prevRooms.findIndex(r => r.id === updatedRoom.id);
            if (roomIndex >= 0) {
                return prevRooms.map(r => r.id === updatedRoom.id ? updatedRoom : r);
            }
            return [...prevRooms, updatedRoom];
        });
        setNewRoom(null);
    };


    return (
        <Flex direction="column">
            <Flex alignItems="center">
                <Text as="b" fontSize="1.75rem">
                    Rooms
                </Text>
                <Button
                    backgroundColor="#4441C8"
                    marginLeft="auto"
                    gap="0.75rem"
                    padding="1.75rem"
                    onClick={() => { handleAddNewRoom() }}
                >
                    <PlusIcon></PlusIcon>
                    <Text as="b" fontSize="1.5rem" color="#FFF">
                        New Room
                    </Text>
                </Button>
            </Flex>
            <Flex
                direction="column"
                marginTop="2.5rem"
                gap="1.25rem"
                color="#718096"
            >
                {
                    rooms.map(room => (
                        <RoomSettings
                            key={room.id}
                            room={room}
                            onSave={handleSaveOrUpdateRoom}
                        />
                    ))
                }
                {
                    newRoom && (
                        <RoomSettings
                            room={newRoom}
                            isInitiallyEditing={true}
                            onSave={handleSaveOrUpdateRoom}
                            onCancel={handleCancelNewRoom} />
                    )
                }
            </Flex>
        </Flex >
    )
}

const AdminSettings = () => {

}

export { GeneralSettings, AdminSettings };