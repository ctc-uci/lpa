export const CounterComponent = ({ count }) => {
  return (
    <div
      style={{
        width: "75px",
        height: "31px",
        background: "#FFF",
        marginTop: "3px",
      }}
    >
      <p
        style={{
          color: "var(--medium-grey, #767778",
          fontFamily: "Inter, sans-serif",
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
