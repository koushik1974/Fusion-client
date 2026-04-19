import React, { useEffect, useState, lazy } from "react";
import PropTypes from "prop-types";
import { host } from "../../../routes/globalRoutes/index.jsx";

// Lazy load SpecialTable component
const SpecialTable = lazy(() => import("./SpecialTable.jsx"));

const columns = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "department", header: "Department" },
  { accessorKey: "cabin_details", header: "Cabin Details" },
  { accessorKey: "contact", header: "Contact" },
  { accessorKey: "email", header: "Email" },
];

function Faculty({ branch }) {
  const [facultyData, setFacultyData] = useState([]);

  if (branch === "DS") branch = "Design";
  if (branch === "Natural Science") branch = "Natural_Science";

  // Fetch faculty data from API with Auth Token
  useEffect(() => {
    const fetchUrl = `${host}/dep/api/faculty-directory/${branch}/`;

    fetch(fetchUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("authToken")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setFacultyData(data);
      })
      .catch((error) => {
        console.error("There was a problem with your fetch operation:", error);
      });
  }, [branch]);

  return (
    <div
      style={{
        overflowX: "auto", // Enable horizontal scrolling
        width: "100%", // Ensure the container takes the full width
        marginTop: "10px", // Add some spacing
      }}
    >
      <SpecialTable
        title="Faculty"
        columns={columns}
        data={facultyData}
        rowOptions={["10", "20", "30"]}
      />
    </div>
  );
}

Faculty.propTypes = {
  branch: PropTypes.string.isRequired,
};

export default Faculty;
