import React from "react";

import { EditProgram } from "./EditProgram";
import { AddProgram } from "./AddProgram";

export const ModifyProgram = ({ load = false }) => {
  console.log("LOAD:", load)
  return load ? <EditProgram /> : <AddProgram />;
};
