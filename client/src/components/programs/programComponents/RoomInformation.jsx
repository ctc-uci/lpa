import {
  Text,
} from "@chakra-ui/react"

import '../EditProgram.css';

export const RoomInformation = ({ roomDescription }) => {
    return (
        <div id="roomDescription">
            <h3>Room Information</h3>
            {roomDescription !== "N/A" ? (
              <Text color="#2D3748">{roomDescription}</Text>
            ) : (
              <Text color="#718096!important">Select room to populate Information.</Text>
            )}
        </div>
    )
}
