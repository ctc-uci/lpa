export const CounterComponent = ({ count }) => {
  return (
    <div
      style={{
        width: "75px",
        height: "31px",
        borderRadius: "10px",
        border: "1px solid var(--medium-light-grey, #D2D2D2)",
        background: "#FFF",
        marginTop: "3px",
      }}
    >
      <p
        style={{
          color: "var(--medium-grey, #767778",
          fontFamily: "Inter",
          fontSize: "20px",
          fontStyle: "normal",
          fontWeight: 400,
          lineHeight: "normal",
          textAlign: "center",
          marginTop: "3px",
        }}
      >
        {count}
      </p>
    </div>
  );
};
