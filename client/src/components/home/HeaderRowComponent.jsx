import archiveSvg from "../../assets/icons/archive.svg";
import googleCalendarSvg from "../../assets/icons/google-calendar.svg";
import plusSvg from "../../assets/icons/plus.svg";
import { useNavigate } from "react-router-dom";


export const HeaderRowComponent = () => {
  const navigate = useNavigate();

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
          onClick={() => navigate("/addprogram")}
        >
          <img
            src={plusSvg}
            alt="New Program"
            className="new-program-icon"
          />
          <span className="new-program-text">New Program</span>
        </div>
      </div>
    </div>
  );
};
