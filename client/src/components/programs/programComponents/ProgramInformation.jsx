import "../EditProgram.css";

import { Textarea } from "@chakra-ui/react";

export const ProgramInformation = ({
  generalInformation,
  setGeneralInformation,
}) => {
  return (
    <div id="information">
      <h3>Program Information</h3>
      <Textarea
        defaultValue={generalInformation}
        onChange={(e) => {
          setGeneralInformation(e.target.value);
        }}
        backgroundColor="transparent"
        placeholder="..."
      />
    </div>
  );
};
