import { Text } from "@mantine/core";
import React, { useState, useEffect, lazy } from "react";
import PropTypes from "prop-types";
import { host } from "../../../routes/globalRoutes/index.jsx";

const SpecialTable = lazy(() => import("./SpecialTable.jsx"));

const columns = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "department", header: "Department" },
  { accessorKey: "cabin_details", header: "Cabin Details" },
  { accessorKey: "contact", header: "Contact" },
  { accessorKey: "email", header: "Email" },
];

function Studentcat({ branch }) {
  const [studentData, setStudentData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setStudentData([]);
    const fetchUrl = `${host}/dep/api/student-directory/${branch}/`;
    fetch(fetchUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("authToken")}`,
      },
    })
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error("Network error")),
      )
      .then((data) => {
        setStudentData(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, [branch]);

  return (
    <div style={{ margin: "20px" }}>
      <Text size="xl" weight={400} mb="md">
        Students
      </Text>

      {loading ? (
        <Text>Loading data...</Text>
      ) : (
        <SpecialTable
          title="Student"
          columns={columns}
          data={studentData}
          rowOptions={["20", "50", "100"]}
        />
      )}
    </div>
  );
}

export default Studentcat;

Studentcat.propTypes = {
  branch: PropTypes.string.isRequired,
};
