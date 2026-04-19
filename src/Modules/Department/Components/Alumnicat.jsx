import {
  Text,
  Title,
} from "@mantine/core"; // Use Mantine components
import React, { useState, useEffect, Suspense, lazy } from "react";
import PropTypes from "prop-types";
import { host } from "../../../routes/globalRoutes/index.jsx";

// Lazy load the SpecialTable component
const SpecialTable = lazy(() => import("./SpecialTable"));

const columns = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "department", header: "Department" },
  { accessorKey: "cabin_details", header: "Cabin Details" },
  { accessorKey: "contact", header: "Contact" },
  { accessorKey: "email", header: "Email" },
];

function Alumnicat({ branch }) {
  const [alumniData, setAlumniData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchUrl = `${host}/dep/api/alumni-directory/${branch}/`;
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
        setAlumniData(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setAlumniData([]);
        setLoading(false);
      });
  }, [branch]);

  return (
    <div style={{ margin: "20px" }}>
      <Title order={4} style={{ marginBottom: "20px" }}>
        Alumni
      </Title>
      {loading ? (
        <Text>Loading data...</Text>
      ) : (
        <Suspense fallback={<Text>Loading table...</Text>}>
          <div
            style={{
              overflowX: "auto",
              width: "100%",
              marginTop: "10px",
            }}
          >
            <SpecialTable
              title="Alumni"
              columns={columns}
              data={alumniData}
              rowOptions={["10", "20", "50"]}
            />
          </div>
        </Suspense>
      )}
    </div>
  );
}

Alumnicat.propTypes = {
  branch: PropTypes.string.isRequired,
};

export default Alumnicat;
