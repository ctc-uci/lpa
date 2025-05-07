import React, { useState } from 'react';
import { 
  Input, 
  InputGroup, 
  InputRightElement,
  IconButton,
  Tag,
  TagLabel,
  TagCloseButton,
  Flex,
  Box
} from "@chakra-ui/react";
import { PlusFilledIcon } from "../../assets/PlusFilledIcon.jsx";

export const EmailInput = ({ initialEmails = [] }) => {
  const [emails, setEmails] = useState(initialEmails);
  const [ccInput, setCcInput] = useState('');

  const handleAddCcEmail = () => {
    if (ccInput && !emails.includes(ccInput)) {
      setEmails([...emails, ccInput]);
      setCcInput('');
    }
  };

  const handleKeyPressCc = (e) => {
    if (e.key === 'Enter') {
      handleAddCcEmail();
    }
  };

  return (
    <Box>
      <InputGroup w="200px">
        <Input
          placeholder="johndoe@gmail.com"
          value={ccInput}
          onChange={(e) => setCcInput(e.target.value)}
          onKeyDown={handleKeyPressCc}
        />
        <InputRightElement>
          <IconButton
            bgColor="transparent"
            sx={{
              svg: {
                width: "16px",
                height: "16px",
              },
            }}
            _hover={{
              bgColor: "transparent",
              svg: {
                rect: { fill: "#4441C8" },
              },
            }}
            _active={{ bgColor: "transparent" }}
            _focus={{ boxShadow: "none" }}
            onClick={handleAddCcEmail}
            icon={<PlusFilledIcon />}
          />
        </InputRightElement>
      </InputGroup>
      
      {emails.length > 0 && (
        <Flex gap={2} mt={2} flexWrap="wrap">
          {emails.map((email, index) => (
            <Tag
              key={index}
              size="lg"
              borderRadius="full"
              variant="solid"
              bg="white"
              border="1px solid"
              borderColor="#E2E8F0"
              textColor="#080A0E"
              fontWeight="normal"
            >
              <TagLabel>{email}</TagLabel>
              <TagCloseButton
                onClick={() =>
                  setEmails((prevEmails) =>
                    prevEmails.filter((e) => e !== email)
                  )
                }
                bgColor="#718096"
                opacity="100%"
                _hover={{
                  bg: "#4441C8",
                }}
                textColor="white"
              />
            </Tag>
          ))}
        </Flex>
      )}
    </Box>
  );
};