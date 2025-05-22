import { useState } from "react";

import {
  Box,
  Tab,
  TabIndicator,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";

import Navbar from "../navbar/Navbar";
import { AdminSettings, GeneralSettings } from "./SettingsComponents";

export const Settings = () => {
  const [selectedComponent, setSelectedComponent] = useState("general");
  return (
    <Navbar>
      <Box
        margin="0px"
        padding="2.5rem 5rem"
      >
        <Tabs
          variant="unstyled"
          onChange={(index) => {
            if (index === 0) {
              setSelectedComponent("general");
            }
          }}
        >
          <TabList
            gap="2px"
            color="#718096"
          >
            <Tab
              _selected={{ color: "#3834B6)" }}
              onClick={() => setSelectedComponent("general")}
            >
              <Text
                fontSize="20px"
                fontFamily={"Inter"}
                fontWeight={"700"}
                fontStyle={"normal"}
                lineHeight={"normal"}
                letterSpacing={"0.07px"}
                color={selectedComponent === "general" ? "#3834B6" : "#718096"}
              >
                General
              </Text>
            </Tab>
            <Tab
              _selected={{ color: "#3834B6)" }}
              onClick={() => setSelectedComponent("admin")}
            >
              <Text
                fontSize="20px"
                fontFamily={"Inter"}
                fontWeight={"700"}
                fontStyle={"normal"}
                lineHeight={"normal"}
                letterSpacing={"0.07px"}
                color={selectedComponent === "admin" ? "#3834B6" : "#718096"}
              >
                Admin
              </Text>
            </Tab>
          </TabList>
          <TabIndicator
            height="3px"
            borderRadius="1.5px"
            bgColor="#5C1F8C"
          ></TabIndicator>
          <TabPanels>
            <TabPanel
              marginTop="2.5rem"
              padding="0px"
            >
              <GeneralSettings
                selectedComponent={selectedComponent}
                setSelectedComponent={setSelectedComponent}
              ></GeneralSettings>
            </TabPanel>
            <TabPanel
              marginTop="2.5rem"
              padding="0px"
            >
              <AdminSettings />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Navbar>
  );
};
