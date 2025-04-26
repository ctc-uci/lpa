import {
  Button,
  Icon,
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
import { DeleteConfirmationModal } from "./DiscardConfirmationModal";

export const AddProgram = () => {
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
  const [hasChanges, setHasChanges] = useState(false);
  const initialState = useRef(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    initialState.current = JSON.stringify({
      eventName,
      generalInformation,
      selectedInstructors,
      selectedPayees,
      selectedEmails
    });
  }, []);


  useEffect(() => {
    const currentState = JSON.stringify({
      eventName,
      generalInformation,
      selectedInstructors,
      selectedPayees,
      selectedEmails
    });

    setHasChanges(currentState !== initialState.current);
  }, [
    eventName,
    generalInformation,
    selectedInstructors,
    selectedPayees,
    selectedEmails,
  ]);

  useEffect(() => {
    getInstructorResults(instructorSearchTerm);
  }, [selectedInstructors, instructorSearchTerm]);

  useEffect(() => {
    getPayeeResults(payeeSearchTerm);
  }, [selectedPayees, payeeSearchTerm]);

  useEffect(() => {
    getEmailResults(emailSearchTerm);
  }, [selectedEmails, emailSearchTerm]);

  const exit = (newEventId = "") => {
    console.log(newEventId);
    if (hasChanges) {
      setIsConfirmModalOpen(true);
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

  const isFormValid = () => {
    return (
      eventName.trim() !== "" &&
      selectedInstructors.length > 0 &&
      selectedPayees.length > 0
    );
  };

  const getInstructorResults = async (search) => {
    try {
      if (search !== "") {
        const instructorResponse = await backend.get("/clients/search", {
          params: {
            searchTerm: search
          }
        });
        filterSelectedInstructorsFromSearch(instructorResponse.data);
      }
      else {
        setSearchedInstructors([]);
      }
    } catch (error) {
      console.error("Error getting instructors:", error);
    }
  };

  const filterSelectedInstructorsFromSearch = (instructorData) => {
    const filteredInstructors =  instructorData.filter(
      instructor => !selectedInstructors.some(
        selected => selected.id === instructor.id
      )
    );
    setSearchedInstructors(filteredInstructors);
  };

  const getPayeeResults = async (search) => {
    try {
      if (search !== "") {
        const payeeResponse = await backend.get("/clients/search", {
          params: {
            searchTerm: search
          }
        });
        filterSelectedPayeesFromSearch(payeeResponse.data);
      }
      else {
        setSearchedPayees([]);
      }
    } catch (error) {
        console.error("Error getting instructors:", error);
    }
  };

  const filterSelectedPayeesFromSearch = (payeesData) => {
    const filteredPayees = payeesData.filter(
      (payee) => !selectedPayees.some(
        (selectedPayee) => selectedPayee.id === payee.id
      )
    );

    setSearchedPayees(filteredPayees);
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

      console.log("payee object:", selectedPayees);
      for (const payee of selectedPayees) {
        console.log("Assigning payee:", payee);
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
      <DeleteConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
      />
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
                  Save

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
                getInstructorResults={getInstructorResults}
                setInstructorSearchTerm={setInstructorSearchTerm}
              />

              <PayeesDropdown
                payeeSearchTerm={payeeSearchTerm}
                searchedPayees={searchedPayees}
                selectedPayees={selectedPayees}
                getPayeeResults={getPayeeResults}
                setPayeeSearchTerm={setPayeeSearchTerm}
                setSelectedPayees={setSelectedPayees}
                setSearchedPayees={setSearchedPayees}
              />

              <EmailDropdown
                selectedPayees={selectedPayees}
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
