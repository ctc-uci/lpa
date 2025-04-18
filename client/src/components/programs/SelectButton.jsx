import React, { useState } from 'react';

const SelectButton = (selectMenuOpen, isSelected) => {

  return (
    <button
      style={{
        display: "flex",
        height: "40px",
        padding: "0px 16px",
        justifyContent: "center",
        alignItems: "center",
        gap: "4px",
        flex: "1 0 0",
        borderRadius: "6px",
        backgroundColor: "var(--Secondary-2-Default, #EDF2F7)",
        color: isSelected ? "var(--Primary-5-Default, #4441C8)" : "inherit",
        fontFamily: "Inter",
        fontSize: "14px",
        fontStyle: "normal",
        fontWeight: "700",
        lineHeight: "normal",
        letterSpacing: "0.07px",
      }}
      onClick={() => {
        setSelectMenuOpen(!selectMenuOpen);
        setIsSelected(!isSelected);
      }}
      data-select-menu="true"
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = "#e0e6ed";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = "var(--Secondary-2-Default, #EDF2F7)";
      }}
    >
      Select
    </button>
  );
};

export default SelectButton;