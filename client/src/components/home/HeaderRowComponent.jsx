import React, { useState } from "react";

import archiveSvg from "../../assets/icons/archive.svg";
import googleCalendarSvg from "../../assets/icons/google-calendar.svg";
import plusSvg from "../../assets/icons/plus.svg";
import { AddClassModal } from "../AddClassModal";

// Remove inline styles; use classNames from home.css
export const HeaderRowComponent = () => {
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);

  return (
    <div className="header-row">
      <div
        className="google-calendar"
        onClick={() => {
          // handle google calendar logic
        }}
      >
        <img
          src={googleCalendarSvg}
          alt="Google Calendar"
          className="google-calendar-icon"
        />
        <span className="google-calendar-text">Google Calendar</span>
      </div>

      <div className="header-right">
        <div
          className="archive"
          onClick={() => {
            // handle archive logic
          }}
        >
          <img
            src={archiveSvg}
            alt="Archived"
            className="archive-icon"
          />
          <span className="archive-text">Archived</span>
        </div>

        <div
          className="new-program"
          onClick={() => setIsAddClassOpen(true)}
        >
          <img
            src={plusSvg}
            alt="New Program"
            className="new-program-icon"
          />
          <span className="new-program-text">New Program</span>
        </div>
      </div>

      <AddClassModal
        isOpen={isAddClassOpen}
        onClose={() => setIsAddClassOpen(false)}
      />
    </div>
  );
};
