import React from 'react'
import {
    Input,
  } from "@chakra-ui/react";

export const TitleInformation = ( {eventName, setEventName} ) => {
  return (
        <Input
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            width="100%"
            height="50px"
            borderRightColor="transparent"
            borderLeftColor="transparent"
            borderTopColor="transparent"
            borderRadius="0"
            fontSize="22px"
            pb="8px"
            sx={{ borderBottomWidth: "2px", borderBottomColor:"#718096", padding: "3px", fontWeight: "700" }}
        />
  )
}
