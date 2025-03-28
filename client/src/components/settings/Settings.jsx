import { useState } from "react";

import {
    Box,
    Tabs,
    TabList,
    Tab,
    TabIndicator,
    TabPanels,
    TabPanel,
    Text
} from "@chakra-ui/react";

import Navbar from "../navbar/Navbar";
import { GeneralSettings, AdminSettings } from "./SettingsComponents";

export const Settings = () => {
    const [selectedComponent, setSelectedComponent] = useState("general");
    return (
        <Navbar>
            <Box margin="0px" padding="2.5rem 5rem">
                <Tabs
                    variant="unstyled"
                    onChange={(index) => {
                        if (index === 0) {
                            setSelectedComponent("general");
                        }
                    }}
                >
                    <TabList gap="2rem" color="#718096">
                        <Tab
                            _selected={{ color: "#5C1F8C" }}
                            onClick={() => setSelectedComponent("general")}
                        >
                            <Text as="b" fontSize="1.5rem">
                                General
                            </Text>
                        </Tab>
                        <Tab _selected={{ color: "#5C1F8C" }}>
                            <Text as="b" fontSize="1.5rem">
                                Admin
                            </Text>
                        </Tab>
                    </TabList>
                    <TabIndicator height="3px" borderRadius="1.5px" bgColor="#5C1F8C"></TabIndicator>
                    <TabPanels>
                        <TabPanel marginTop="2.5rem" padding="0px">
                            <GeneralSettings
                                selectedComponent={selectedComponent}
                                setSelectedComponent={setSelectedComponent}
                            >
                            </GeneralSettings>
                        </TabPanel>
                        <TabPanel marginTop="2.5rem" padding="0px">
                            <AdminSettings />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>
        </Navbar>
    );
};
