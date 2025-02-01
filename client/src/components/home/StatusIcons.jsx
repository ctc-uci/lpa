// statusKey.jsx

import React from "react";
import { ActiveStatusIcon, PastStatusIcon } from "./TableIcons";

export const StatusKey = () => (
  <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
    <div style={{ display: "flex", alignItems: "center", marginRight: "20px" }}>
      <ActiveStatusIcon />
      <span style={{ marginLeft: "5px" }}>Active</span>
    </div>
    <div style={{ display: "flex", alignItems: "center" }}>
      <PastStatusIcon />
      <span style={{ marginLeft: "5px" }}>Past</span>
    </div>
  </div>
);
