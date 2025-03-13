export const CloseFilledIcon = ({ color = "#718096" }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="12" fill={color}/>
      <path fillRule="evenodd" clipRule="evenodd"
        d="M8 8 L16 16 M16 8 L8 16"
        stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
};
