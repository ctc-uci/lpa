export const CloseFilledIcon = ({ color = "#718096", width="24", height="24"}) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <rect width="16" height="16" x="4" y="4" rx="8" fill={color}/>
      <path fillRule="evenodd" clipRule="evenodd"
        d="M10 10 L14 14 M14 10 L10 14"
        stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
};