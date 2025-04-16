import React from 'react'
import { Tooltip, Text } from "@chakra-ui/react";
import { AiOutlineInfoCircle } from "react-icons/ai";

export const InfoTooltip = () => {
  return (
    <Tooltip 
        label="Payment Overdue (5+ Days)" 
        fontSize="sm" hasArrow
        positioning={{ placement: "right" }}
    >
        <span>
            <AiOutlineInfoCircle
            color="#4A5568"
            />
        </span>
    </Tooltip>
  )
}
