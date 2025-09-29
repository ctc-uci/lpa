import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import Navbar from "../navbar/Navbar";
import { getPastDue } from "../../utils/pastDueCalc";
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
    const pastDue = await getPastDue(backend, 23);
    console.log(pastDue);
  };

  return (
    <Navbar>
      <Button onClick={getDue}>Get Due</Button>
      <ClientsFilter clientsList={[{name: 'one'}, {name: 'two'}, {name: 'three'}]} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} type={'email'} />
      {/* <EmailDropdown emailSearchTerm={emailSearchTerm} searchedEmails={searchedEmails} selectedEmails={selectedEmails} setEmailSearchTerm={setEmailSearchTerm} setSelectedEmails={setSelectedEmails} setSearchedEmails={setSearchedEmails} setSelectedPayees={setSelectedPayees} freeEntryMode={true} /> */}
    </Navbar>
  );
};
