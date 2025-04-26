import { useEffect, useState } from "react";
import './EditProgram.css';

import {
  Button,
  Icon,
} from "@chakra-ui/react";

import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { useNavigate } from 'react-router-dom';
import { IoCloseOutline } from "react-icons/io5";
import { useParams } from "react-router";
import Navbar from "../navbar/Navbar";
import React from 'react';

import { TitleInformation } from "./programComponents/TitleInformation";
import { ArtistsDropdown } from "./programComponents/ArtistsDropdown";
import { PayeesDropdown } from "./programComponents/PayeesDropdown";
import { ProgramInformation } from "./programComponents/ProgramInformation";
import { EmailDropdown } from "./programComponents/EmailDropdown";


export const EditProgram = () => {
  const { backend } = useBackendContext();
  const navigate = useNavigate();
  const {id} = useParams();
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


  useEffect(() => {
    getInitialEventData();
    getInitialAssignmentsData();
  }, []);

  const exit = () => {
    navigate('/programs/' + id);
  };

  const isFormValid = () => {
    return (
      eventName.trim() !== "" &&
      selectedInstructors.length > 0 &&
      selectedPayees.length > 0
    );
  };

  const getInitialEventData = async () => {
    const eventResponse = await backend.get(`/events/${id}`);

    setEventName(eventResponse.data[0].name);
    setGeneralInformation(eventResponse.data[0].description);
    setEventArchived(eventResponse.data[0].archived);
  }

  const getInitialAssignmentsData = async () => {
    const eventClientResponse = await backend.get('/assignments/event/' + id);

    const instructors = eventClientResponse.data
  .filter(client => client.role === "instructor")
  .map(client => ({
    id: client.clientId,
    name: client.clientName,
    email: client.clientEmail
  }));

const payees = eventClientResponse.data
  .filter(client => client.role === "payee")
  .map(client => ({
    id: client.clientId,
    name: client.clientName,
    email: client.clientEmail
  }));
    setSelectedInstructors(instructors);
    setSelectedPayees(payees);
    setSelectedEmails(payees);
  }

  const deleteAllAssignments = async () => {
    try {
      await backend.delete('/assignments/event/' + id);
    } catch (error) {
      if (error.response?.status === 404) {
          console.log(`No assignments found for event ${id}`);
          return;
        }
      else {
        console.error("Error deleting event bookings", error);
      }
    }
  };

  const saveEvent = async () => {
    try {
      console.log("Newly added event name:", eventName);
      console.log("Newly added Description:", generalInformation);
      console.log("Newly added Selected Instructors:", selectedInstructors);
      console.log("Newly added Selected Payees:", selectedPayees);

      await backend.put('/events/' + id, {
          name: eventName,
          description: generalInformation,
          archived: eventArchived
      });

      deleteAllAssignments();

      console.log("Assigning instructors...");
      for (const instructor of selectedInstructors) {
        console.log("Assigning instructor:", instructor);
        await backend.post("/assignments", {
            eventId: id,
            clientId: instructor.id,
            role: "instructor"
        });
      }


      for (const payee of selectedPayees) {
        console.log("Assigning payee:", payee);
        await backend.post("/assignments", {
            eventId: id,
            clientId: payee.id,
            role: "payee"
        });
      }
      console.log("Save complete, navigating away...");
      exit();

    } catch (error) {
        console.error("Error updating sessions", error);
    }
  };


  return (

    <Navbar>
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
