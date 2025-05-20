import { useEffect, useState } from "react";

import "./EditProgram.css";

import React from "react";

import { Button, Flex, Icon, useDisclosure } from "@chakra-ui/react";

import { IoCloseOutline } from "react-icons/io5";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";

import { SessionsRightIcon } from "../../assets/SessionsRightIcon";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import Navbar from "../navbar/Navbar";
import { UnsavedChangesModal } from "../popups/UnsavedChangesModal";
import { ArtistsDropdown } from "./programComponents/ArtistsDropdown";
import { EmailDropdown } from "./programComponents/EmailDropdown";
import { PayeesDropdown } from "./programComponents/PayeesDropdown";
import { ProgramInformation } from "./programComponents/ProgramInformation";
import { TitleInformation } from "./programComponents/TitleInformation";
import { ExitStatus } from "typescript";
import { EmailDropdown } from "./programComponents/EmailDropdown";
import { UnsavedChangesModal } from "../popups/UnsavedChangesModal";

export const EditProgram = () => {
  const { backend } = useBackendContext();
  const navigate = useNavigate();
  const { id } = useParams();
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
  const [initialState, setInitialState] = useState(null);
  const [infoLoaded, setInfoLoaded] = useState({
    event: false,
    assignments: false,
  });
  const {
    isOpen: isUnsavedModalOpen,
    onOpen: onUnsavedModalOpen,
    onClose: onUnsavedModalClose,
  } = useDisclosure();

  useEffect(() => {
    const getInitialEventData = async (eventResponse) => {
      setEventName(eventResponse.data[0].name);
      setGeneralInformation(eventResponse.data[0].description);
      setEventArchived(eventResponse.data[0].archived);
    };

    const getInitialAssignmentsData = async (eventClientResponse) => {
      const instructors = eventClientResponse.data
        .filter((client) => client.role === "instructor")
        .map((client) => ({
          id: client.clientId,
          name: client.clientName,
          email: client.clientEmail,
        }));

      const payees = eventClientResponse.data
        .filter((client) => client.role === "payee")
        .map((client) => ({
          id: client.clientId,
          name: client.clientName,
          email: client.clientEmail,
        }));
      setSelectedInstructors(instructors);
      setSelectedPayees(payees);
      setSelectedEmails(payees);
    };

    const loadInitialData = async () => {
      const eventResponse = await backend.get(`/events/${id}`);
      const eventClientResponse = await backend.get("/assignments/event/" + id);

      await getInitialEventData(eventResponse).then(() => {
        setInfoLoaded((prev) => ({ ...prev, event: true }));
      });
      await getInitialAssignmentsData(eventClientResponse).then(() => {
        setInfoLoaded((prev) => ({ ...prev, assignments: true }));
      });
    };

    loadInitialData();
  }, [backend, id]);

  useEffect(() => {
    if (initialState === null && Object.values(infoLoaded).every(Boolean)) {
      setInitialState(
        JSON.stringify({
          eventName,
          generalInformation,
          selectedInstructors,
          selectedPayees,
          selectedEmails,
        })
      );
    }
  }, [
    eventName,
    generalInformation,
    infoLoaded,
    initialState,
    selectedEmails,
    selectedInstructors,
    selectedPayees,
  ]);

  const exit = () => {
    const currentState = JSON.stringify({
      eventName,
      generalInformation,
      selectedInstructors,
      selectedPayees,
      selectedEmails,
    });
    if (initialState !== currentState) {
      onUnsavedModalOpen();
      return;
    } else {
      navigate("/programs/" + id);
    }
  };

  const noSave = () => {
    navigate("/programs/" + id);
  };

  const isUnsavedValid = () => {
    const currentState = JSON.stringify({
      eventName,
      generalInformation,
      selectedInstructors,
      selectedPayees,
      selectedEmails,
    });
    return (
      (eventName.trim() !== "" ||
        selectedInstructors.length > 0 ||
        selectedPayees.length > 0) &&
      initialState !== currentState
    );
  };

  const isFormValid = () => {
    return (
      eventName.trim() !== "" &&
      selectedInstructors.length > 0 &&
      selectedPayees.length > 0
    );
  };

  const deleteAllAssignments = async () => {
    try {
      await backend.delete("/assignments/event/" + id);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`No assignments found for event ${id}`);
        return;
      } else {
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

      await backend.put("/events/" + id, {
        name: eventName,
        description: generalInformation,
        archived: eventArchived,
      });

      await deleteAllAssignments();
      console.log("Selected instructors: ", selectedInstructors);
      console.log("Selected payees: ", selectedPayees);
      console.log("Assigning instructors...");
      for (const instructor of selectedInstructors) {
        await backend.post("/assignments", {
          eventId: id,
          clientId: instructor.id,
          role: "instructor",
        });
      }

      for (const payee of selectedPayees) {
        await backend.post("/assignments", {
          eventId: id,
          clientId: payee.id,
          role: "payee",
        });
      }
      console.log("Save complete, navigating away...");
    } catch (error) {
      console.error("Error updating sessions", error);
    }
  };

  const saveEventUnsaved = async () => {
    await saveEvent();
    navigate("/programs/" + id);
  };

  const saveEventToSessions = async () => {
    await saveEvent();
    navigate("/programs/edit/sessions/" + id);
  };

  return (
    <Navbar>
      <UnsavedChangesModal
        isOpen={isUnsavedModalOpen}
        onClose={onUnsavedModalClose}
        noSave={noSave}
        save={saveEventUnsaved}
        isFormValid={isUnsavedValid}
      />
      <div id="body">
        <div id="programsBody">
          <Flex
            style={{
              width: "48px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              padding: "0px 16px"
            }}
            _hover={{ bgColor: "#EDF2F7" }}
          >
            <Icon
              fontSize="20px"
              onClick={exit}
              id="leftCancel"
            >
              <IoCloseOutline />
            </Icon>
          </Flex>
          <div id="eventInfoBody">
            <div id="title">
              <TitleInformation
                eventName={eventName}
                setEventName={setEventName}
              />
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
          <div id="saveCancel">
            <Button
              id="save"
              onClick={saveEventToSessions}
              isDisabled={!isFormValid()}
              backgroundColor={"#4441C8"}
              _hover={{ bgColor: "#312E8A" }}
              rightIcon={<SessionsRightIcon />}
            >
              Session
            </Button>
          </div>
        </div>
      </div>
    </Navbar>
  );
};
