import React from "react";

// import clock from public icons folder

import ActiveIcon from "../../assets/icons/active.svg";
import PastIcon from "../../assets/icons/past.svg";

export const ProgramStatusLegend = () => (
  <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
    {/* Active */}
    <div style={{ display: "flex", alignItems: "center", marginRight: "20px" }}>
      <img
        src={ActiveIcon}
        alt="Active"
        style={{ width: "20px", height: "20px" }}
      />
      <span style={{ marginLeft: "5px" }}>Active</span>
    </div>

    {/* Past */}
    <div style={{ display: "flex", alignItems: "center" }}>
      <img
        src={PastIcon}
        alt="Past"
        style={{ width: "20px", height: "20px" }}
      />
      <span style={{ marginLeft: "5px" }}>Past</span>
    </div>
  </div>
);
