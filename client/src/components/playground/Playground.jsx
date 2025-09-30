import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import Navbar from "../navbar/Navbar";
import { getPastDue, getAllDue } from "../../utils/pastDueCalc";
import { Button } from "@chakra-ui/react";
import { ClientsFilter } from "../filters/FilterComponents";
import React from "react";
import { useState } from "react";
import {EmailDropdown} from "../programs/programComponents/EmailDropdown";

export const Playground = () => {
  const { backend } = useBackendContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedEmails, setSearchedEmails] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [emailSearchTerm, setEmailSearchTerm] = useState("");
  const [selectedPayees, setSelectedPayees] = useState([]);

  const getDue = async () => {
    const pastDue = await getPastDue(backend, 72);
    window.alert(pastDue);
  };
  const getAll = async () => {
    const allDue = await getAllDue(backend, 72);
    window.alert(allDue);
  };

  return (
    <Navbar>
      <Button onClick={getDue}>Get Due</Button>
      <Button onClick={getAll}>Get All Due</Button>
    </Navbar>
  );
};
