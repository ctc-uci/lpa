import React from 'react'
import { Tooltip, Text } from "@chakra-ui/react";
import { AiOutlineInfoCircle } from "react-icons/ai";

export const InfoTooltip = ({ tooltipInfo }) => {

  return (
    <Tooltip 
        label={
          <Text
            fontFamily="Inter"
            fontSize="14px"
            fontStyle="normal"
            fontWeight="400"
            lineHeight="normal"
            letterSpacing="0.07px"
            textAlign="center"
          >
            {tooltipInfo}
          </Text>
        }
        hasArrow
        placement={"right-end"}
        bg={"#718096"}
        width={"165px"}
        padding={"8px"}
        display={"flex"}
        borderRadius={"6px"}
        flexDirection={"column"}
        alignItems={"center"}
    >
      <span>
          <AiOutlineInfoCircle
          color="#4A5568"
          />
      </span>
    </Tooltip>
  )
}
