import React from "react";

import { EditProgram } from "./EditProgram";
import { NewProgram } from "./NewProgram";

export const ModifyProgram = ({ load = false }) => {
  console.log("LOAD:", load)
  return load ? <EditProgram /> : <NewProgram />;
};
