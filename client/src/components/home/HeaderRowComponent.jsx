import React, { useState } from "react";

import archiveSvg from "../../assets/icons/archive.svg";
import googleCalendarSvg from "../../assets/icons/google-calendar.svg";
import plusSvg from "../../assets/icons/plus.svg";
import { AddClassModal } from "../AddClassModal";

export const HeaderRowComponent = () => {
  // State to control AddClassModal visibility
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "24px",
        alignSelf: "stretch",
      }}
    >
      {/* Google Calendar on the left */}
      <div
        style={{
          display: "flex",
          height: "54.795px",
          padding: "4px 16px",
          justifyContent: "center",
          alignItems: "center",
          gap: "4px",
          borderRadius: "15px",
          border: "1px solid var(--medium-grey, #767778)",
          background: "var(--light-grey, #F6F6F6)",
          cursor: "pointer",
        }}
        onClick={() => {
          // handle google calendar logic uhhhhh
        }}
      >
        <img
          src={googleCalendarSvg}
          alt="Google Calendar"
          style={{ width: "20px", height: "20px" }}
        />
        <span
          style={{
            color: "var(--medium-grey, #767778)",
            fontFamily: "Inter",
            fontSize: "16px",
            fontStyle: "normal",
            fontWeight: 600,
            lineHeight: "normal",
          }}
        >
          Google Calendar
        </span>
      </div>

      {/* Archived + New Program on right*/}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "24px",
        }}
      >
        {/* Archived button */}
        <div
          style={{
            display: "flex",
            height: "54.795px",
            padding: "4px 16px",
            justifyContent: "center",
            alignItems: "center",
            gap: "4px",
            border: "none",
            borderRadius: "0px",
            cursor: "pointer",
          }}
          onClick={() => {
            // handle archive logic uhhhhhhh
          }}
        >
          <img
            src={archiveSvg}
            alt="Archived"
            style={{ width: "20px", height: "20px" }}
          />
          <span
            style={{
              color: "var(--medium-grey, #767778)",
              fontFamily: "Inter",
              fontSize: "16px",
              fontStyle: "normal",
              fontWeight: 600,
              lineHeight: "normal",
            }}
          >
            Archived
          </span>
        </div>

        {/* New Program Button */}
        <div
          style={{
            display: "flex",
            padding: "12px 16px",
            justifyContent: "center",
            alignItems: "center",
            gap: "4px",
            borderRadius: "30px",
            background: "var(--indigo, #4E4AE7)",
            cursor: "pointer",
          }}
          onClick={() => {
            // Open the AddClassModal
            setIsAddClassOpen(true);
          }}
        >
          <img
            src={plusSvg}
            alt="New Program"
            style={{ width: "20px", height: "20px" }}
          />
          <span
            style={{
              color: "var(--white, #FFF)",
              fontFamily: "Inter",
              fontSize: "16px",
              fontStyle: "normal",
              fontWeight: 600,
              lineHeight: "normal",
            }}
          >
            New Program
          </span>
        </div>
      </div>

      <AddClassModal
        isOpen={isAddClassOpen}
        onClose={() => setIsAddClassOpen(false)}
      />
    </div>
  );
};
