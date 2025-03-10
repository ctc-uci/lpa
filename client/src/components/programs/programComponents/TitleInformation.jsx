import React from 'react'
import {
    Input,
  } from "@chakra-ui/react";

export const TitleInformation = ( {eventName, setEventName} ) => {
  return (
        <Input
            defaultValue={eventName}
            onChange={(e) => setEventName(e.target.value)}
            width="800px"
            height="50px"
            borderRightColor="transparent"
            borderLeftColor="transparent"
            borderTopColor="transparent"
            borderRadius="0"
            sx={{ borderBottomWidth: "3px", borderBottomColor:"gray", padding: "3px", fontSize: "40px", fontWeight: "bold" }}
        />
  )
}
