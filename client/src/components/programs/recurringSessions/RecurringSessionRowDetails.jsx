import React from "react";

import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Button,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";

export const RecurringSessionRowDetails = ({
  session,
  index,
  allRooms,
  handleChangeSessionField,
}) => {
  return (
    <>
      <Text>from</Text>

      <Input
        type="time"
        value={session.startTime}
        sx={{
          width: "fit-content",
          color: session.startTime ? "#2D3748" : "#CBD5E0",
        }}
        onChange={(e) =>
          handleChangeSessionField(
            "recurring",
            index,
            "startTime",
            e.target.value
          )
        }
      />

      <Text>to</Text>

      <Input
        type="time"
        value={session.endTime}
        sx={{
          width: "fit-content",
          color: session.endTime ? "#2D3748" : "#CBD5E0",
        }}
        onChange={(e) =>
          handleChangeSessionField(
            "recurring",
            index,
            "endTime",
            e.target.value
          )
        }
      />

      <Text>in</Text>

      <Menu autoSelect={false}>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}
          background="transparent"
          border="1px solid #E2E8F0"
          borderRadius="4px"
          fontWeight="400"
          fontSize="14px"
          width="fit-content"
          display="flex"
          alignItems="center"
          padding="0px 16px"
          justifyContent="flex-start"
          gap="4px"
          textAlign="left"
          color={session.roomId ? "#2D3748" : "#CBD5E0"}
          _hover={{
            bgColor: "#EDF2F7",
            borderRadius: "4px",
          }}
          _active={{
            bgColor: "#EDF2F7",
            borderRadius: "4px",
          }}
        >
          {session.roomId
            ? allRooms.find((room) => room.id === session.roomId)?.name
            : "Room"}
        </MenuButton>

        <MenuList
          minWidth="200px"
          padding="4px"
          borderRadius="4px"
          overflow="hidden"
        >
          {allRooms.map((room) => (
            <MenuItem
              key={room.id}
              value={room.id}
              onClick={() =>
                handleChangeSessionField("recurring", index, "roomId", room.id)
              }
              bg={session.roomId === room.id ? "#EDF2F7" : "transparent"}
            >
              {room.name}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </>
  );
};
