import {
  Button,
  Icon,
  useDisclosure,
} from "@chakra-ui/react";

import { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import './EditProgram.css';
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { IoCloseOutline } from "react-icons/io5";
import Navbar from "../navbar/Navbar";
import React from 'react';

import { TitleInformation } from "./programComponents/TitleInformation";
import { ArtistsDropdown } from "./programComponents/ArtistsDropdown";
import { PayeesDropdown } from "./programComponents/PayeesDropdown"
import { ProgramInformation } from "./programComponents/ProgramInformation"
import { EmailDropdown } from "./programComponents/EmailDropdown";
import { UnsavedChangesModal } from "../popups/UnsavedChangesModal";

export const NewProgram = () => {
  const { backend } = useBackendContext();
  const navigate = useNavigate();
  const [eventName, setEventName] = useState("");
  const [eventArchived, setEventArchived] = useState(false);
  const [searchedInstructors, setSearchedInstructors] = useState([]);
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [searchedPayees, setSearchedPayees] = useState([]);
  const [selectedPayees, setSelectedPayees] = useState([]);
  const [searchedEmails, setSearchedEmails] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [generalInformation, setGeneralInformation] = useState("");
  const [instructorSearchTerm, setInstructorSearchTerm] = useState("");
  const [payeeSearchTerm, setPayeeSearchTerm] = useState("");
  const [emailSearchTerm, setEmailSearchTerm] = useState("");
  const {
    isOpen: isUnsavedModalOpen,
    onOpen: onUnsavedModalOpen,
    onClose: onUnsavedModalClose,
  } = useDisclosure();

  const exit = (newEventId = "") => {
    if (isFormValid()) {
      onUnsavedModalOpen(true);
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
    } else {
        navigate("/dashboard");
    }
  };

  const saveAndExit = (newEventId = "") => {
    navigate('/programs/' + newEventId);
  };

  const noSave = () => {
    navigate('/programs');
  }

  const isFormValid = () => {
    return (
      eventName.trim() !== "" &&
      selectedInstructors.length > 0 &&
      selectedPayees.length > 0
    );
  };

  const saveEvent = async () => {
    try {
      console.log("Newly added name:", eventName);
      console.log("Newly added Description:", generalInformation);
      console.log("Newly added Instructors:", selectedInstructors);
      console.log("Newly added Payees:", selectedPayees);

      const response = await backend.post('/events/', {
          name: eventName,
          description: generalInformation,
          archived: eventArchived
      });

      const newEventId = response.data.id;

      console.log("Assigning instructors...");
      console.log("Instructor object:", selectedInstructors);
      for (const instructor of selectedInstructors) {
        console.log("Assigning instructor:", instructor);
        await backend.post("/assignments", {
            eventId: newEventId,
            clientId: instructor.id,
            role: "instructor"
        });
      }

      for (const payee of selectedPayees) {
        await backend.post("/assignments", {
            eventId: newEventId,
            clientId: payee.id,
            role: "payee"
        });
      }
      console.log("Save complete, navigating away...");
      saveAndExit(newEventId);

    } catch (error) {
        console.error("Error getting instructors:", error);
    }
  };

  return (
    <Navbar>
      <UnsavedChangesModal isOpen={isUnsavedModalOpen} onClose={onUnsavedModalClose} noSave={noSave} save={saveEvent} isFormValid={isFormValid}/>
      <div id="body">
        <div id="programsBody">
          <div><Icon fontSize="2xl" onClick={exit} id="leftCancel"><IoCloseOutline/></Icon></div>
          <div id="eventInfoBody">
            <div id="title">

              <TitleInformation
                eventName={eventName}
                setEventName={setEventName}
              />

              <div id = "saveCancel">
                <Button
                  id="save"
                  onClick={saveEvent}
                  isDisabled={!isFormValid()}
                  backgroundColor={isFormValid() ? "purple.600" : "gray.300"}
                  _hover={{ backgroundColor: isFormValid() ? "purple.700" : "gray.300" }}
                >
                  Sessions
                </Button>
              </div>
            </div>
            <div id="innerBody">

              <ArtistsDropdown
                instructorSearchTerm={instructorSearchTerm}
                searchedInstructors={searchedInstructors}
                selectedInstructors={selectedInstructors}
                setSelectedInstructors={setSelectedInstructors}
                setSearchedInstructors={setSearchedInstructors}
                setInstructorSearchTerm={setInstructorSearchTerm}
              />

              <PayeesDropdown
                payeeSearchTerm={payeeSearchTerm}
                searchedPayees={searchedPayees}
                selectedPayees={selectedPayees}
                setPayeeSearchTerm={setPayeeSearchTerm}
                setSelectedPayees={setSelectedPayees}
                setSearchedPayees={setSearchedPayees}
                setSelectedEmails={setSelectedEmails}
              />

              <EmailDropdown
                emailSearchTerm={emailSearchTerm}
                searchedEmails={searchedEmails}
                selectedEmails={selectedEmails}
                setEmailSearchTerm={setEmailSearchTerm}
                setSelectedEmails={setSelectedEmails}
                setSearchedEmails={setSearchedEmails}
                setSelectedPayees={setSelectedPayees}
              />

              <ProgramInformation
                generalInformation={generalInformation}
                setGeneralInformation={setGeneralInformation}
              />
            </div>
          </div>
        </div>
      </div>
    </Navbar>
  );
};
