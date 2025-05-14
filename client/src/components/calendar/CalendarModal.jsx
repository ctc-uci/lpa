// lpa/client/src/components/calendar/CalendarModal.jsx
import React from "react";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  VStack,
} from "@chakra-ui/react";

/**
 * CalendarModal Component
 * This component is a modal for creating and editing calendar events.
 * It includes input fields for event title, start time, and end time.
 * It also has a button to save the event.
 *
 * @param {string} isOpen: Boolean to control the modal visibility
 * @param {function} onClose: Function to close the modal
 * @param {object} newEvent: Object containing event details
 * @param {function} setNewEvent: Function to update the newEvent state
 * @param {string} editingEventId: ID of the event being edited
 * @param {function} handleSaveEvent Function to handle saving the event
 *
 * Usage:
 * <CalendarModal
 *  isOpen={isOpen}
 *  onClose={onClose}
 *  newEvent={newEvent}
 *  setNewEvent={setNewEvent}
 *  editingEventId={editingEventId}
 *  handleSaveEvent={handleSaveEvent}
 * />
 *
 * This component is used in the Test component to create and edit events.
 * @return {JSX.Element} The CalendarModal component
 */
const CalendarModal = ({
  isOpen,
  onClose,
  newEvent,
  setNewEvent,
  editingEventId,
  handleSaveEvent,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {editingEventId ? "Edit Event" : "Create New Event"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            {/* title/summary field */}
            <Input
              placeholder="Event Title"
              value={newEvent.summary}
              onChange={(e) =>
                setNewEvent({ ...newEvent, summary: e.target.value })
              }
            />
            {/* start time field */}
            <Input
              type="datetime-local"
              value={newEvent.start}
              onChange={(e) =>
                setNewEvent({ ...newEvent, start: e.target.value })
              }
            />
            {/* end time field */}
            <Input
              type="datetime-local"
              value={newEvent.end}
              onChange={(e) =>
                setNewEvent({ ...newEvent, end: e.target.value })
              }
            />

            {/* save changed button */}
            <Button
              colorScheme="blue"
              onClick={handleSaveEvent}
            >
              {editingEventId ? "Save Changes" : "Create Event"}
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CalendarModal;
