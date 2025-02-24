import Ckemail from "../../assets/icons/CkEmail.svg";

const EmailIcon = () => {
  return (
    <img
      src={Ckemail}
      width={24}
      height={24}
    />
  );
};

export const InboxTab = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "10px",
        fontSize: "20px",
        fontWeight: 600,
        color: "#7C15D4",
        borderBottom: "2px solid #9747FF",
        width: "200px",
        height: "46px",
      }}
    >
      <EmailIcon />
      Primary Inbox
    </div>
  );
};
