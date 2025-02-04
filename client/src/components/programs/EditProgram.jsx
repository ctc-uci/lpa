import { useEffect, useState } from "react";
import './EditProgram.css';

import {
  Button,
  Link as ChakraLink,
  Heading,
  Icon,
  IconButton,
  Input,
  Link,
  Select,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  VStack,
  Kbd,
} from "@chakra-ui/react";

// import { useAuthContext } from "../../contexts/hooks/useAuthContext";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
// import { useRoleContext } from "../../contexts/hooks/useRoleContext";
// import { User } from "../../types/user";
// import { RoleSelect } from "./RoleSelect";
import { MdOutlineEmail, MdLocationOn } from "react-icons/md";
import { IoCloseOutline } from "react-icons/io5";
import { TbCalendarEvent } from "react-icons/tb";
import { GoClockFill } from "react-icons/go";
import { CiCircleMore } from "react-icons/ci";
import { IoMdAddCircle, IoMdCloseCircle } from "react-icons/io";
import { useParams } from "react-router";
import Navbar from "../navbar/Navbar";
import React from 'react';


export const EditProgram = () => {
  const { backend } = useBackendContext();
  const {id} = useParams();
  const [locations, setLocations] = useState({1: "theater", 2: "room"}); // rooms.id rooms.name
  const [eventName, setEventName] = useState("poggers");
  const [searchedInstructors, setSearchedInstructors] = useState([])
  const [instructorSearchTerm, setInstructorSearchTerm] = useState();

  const handleInstructorSearch = (event) => {
    setInstructorSearchTerm(event.target.value);
    getInstructorResults();
  }

  const getInstructorResults = async (event) => {
    try {
      console.log(event.target.value);
      const instructorResponse = await backend.get("/assignments/instructorSearch", {
        params: {
          searchTerm: event.target.value
        }
      });
      console.log(instructorResponse.data);
      setSearchedInstructors(instructorResponse.data);
    } catch (error) {
        console.error("Error getting instructors:", error);
    }
  }

  // const getPayeeResults = () => {
  //   return ();
  // };

  // const getLocations = () => {
  // };

  return (
    <div id="body">
      <Navbar >
      </Navbar>
      <div id="programsBody">
        <Icon fontSize="2xl"><Link href="/programs/:id"><IoCloseOutline /></Link></Icon>
        <div id="eventInfoBody">
          <div id="title"><h1>{eventName}</h1><Button id="save">Save</Button></div>
          <Icon fontSize="2xl"><Link href="/programs/:id"><IoCloseOutline />Cancel</Link></Icon>
          <div>
            {/* <Field invalid label="startTime" errorText="This field is required">*/}
            <div id="dateTimeDiv">
              <Icon size="md"><GoClockFill/></Icon>
              <Input id = "time1" placeholder="00:00 am" variant="outline" size="xs" /> to
              <Input id = "time2" placeholder="00:00 pm" variant="outline" size="xs" /> from
              <Icon size="md"><TbCalendarEvent /></Icon>
              <Input id="date1" placeholder="Day. MM/DD/YYYY" variant="outline" size="xs" /> to
              <Icon size="md"><TbCalendarEvent /></Icon>
              <Input id="date2" placeholder="Day. MM/DD/YYYY" variant="outline" size="xs" />
            </div>
          </div>
            <div id="instructors">
              <Input placeholder="Instructors" onChange={getInstructorResults}/>
              <IoMdAddCircle />
             <Select value={selectedInstructor} onChange={handleInstructorChange}>
              { selectedInstructor ? <option value="DEFAULT" disabled>Select an Instructor</option>
                {searchedInstructors.map((instructor) => (
                  <option value={instructor.id} key={instructor.id}>
                    {instructor.name}
                  </option>
                ))} : none
              }
            </Select>
            </div>

            <div id="payees">
              <Input placeholder="Payees" />{/* onKeyUp="getPayeeResults()"/> */}
              <IoMdAddCircle />
            </div>
          <div id="payeeEmails">
            <MdOutlineEmail />
          </div>

          <div id="location">
            <MdLocationOn />
            <Select defaultValue={'DEFAULT'}>
              <option value="DEFAULT" disabled>Location</option>
              {Object.entries(locations).map(([key, value]) => (
                <option value={key} key={key}>
                  {value}
                </option>
              ))}
            </Select>
          </div>

          <div id="roomDescription">
            <h3>Room Description</h3>
            <p></p>
          </div>

          <div id="information">
            <h3>General Information</h3>
            <Textarea></Textarea>
          </div>
        </div>
        <Icon fontSize="2xl"><CiCircleMore /></Icon>
      </div>
    </div>
  );
};
