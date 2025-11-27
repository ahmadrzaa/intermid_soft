// frontend/src/pages/Checks/New.jsx

import React from "react";

const NewCheque = () => {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <iframe
        title="Write Cheque BBK"
        src="/cheque_bbk.html"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
      />
    </div>
  );
};

export default NewCheque;
