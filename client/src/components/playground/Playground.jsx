import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import Navbar from "../navbar/Navbar";
import { getPastDue } from "../../utils/pastDueCalc";
import { Button } from "@chakra-ui/react";

export const Playground = () => {
  const { backend } = useBackendContext();

  const getDue = async () => {
    const pastDue = await getPastDue(backend, 23);
    console.log(pastDue);
  };

  return (
    <Navbar>
      <Button onClick={getDue}>Get Due</Button>
    </Navbar>
  );
};
