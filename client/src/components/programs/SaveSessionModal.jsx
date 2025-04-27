// import {
//   Button,
//   Modal,
//   ModalContent,
//   ModalFooter,
//   ModalHeader,
//   ModalOverlay,
//   Text,
// } from "@chakra-ui/react";

// export const SaveSessionModal = ({isOpen, onClose, pendingNavigation, setHasUnsavedChanges, programName}) => {
//   return (
//     <Modal
//       isOpen={isOpen}
//       onClose={onClose}
//     >
//       <ModalOverlay />
//       <ModalContent>
//         <ModalHeader
//           textAlign="left"
//           color="#4A5568"
//           pb={4}
//           fontSize="16px"
//           fontWeight="700"
//         >
//           Save changes to sessions?
//         </ModalHeader>
//         <ModalFooter
//           style={{ display: "flex", justifyContent: "flex-end" }}
//           gap={3}
//         >
//           <Text>
//             This preview of sessions table will be applied to the program: {programName}.
//           </Text>
//           <Button
//             onClick={() => {
//               onClose();
//               if (pendingNavigation) {
//                 pendingNavigation();
//                 setHasUnsavedChanges(false);
//               }
//             }}
//             backgroundColor="#EDF2F7"
//             color="#2D3748"
//             fontSize="14px"
//             fontWeight="500"
//           >
//             Cancel
//           </Button>
//           <Button
//             onClick={onClose}
//             backgroundColor="#4441C8"
//             color="#FFFFFF"
//             fontSize="14px"
//             fontWeight="500"
//           >
//             Save
//           </Button>
//         </ModalFooter>
//       </ModalContent>
//     </Modal>
//   )
// };
