import React, { useEffect, useState, lazy, useMemo } from "react";
import PropTypes from "prop-types";
import { Select, Group, Stack, Text } from "@mantine/core";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);

  if (branch === "DS") branch = "Design";
  if (branch === "Natural Science") branch = "Natural_Science";

  // Get unique departments from faculty data
  const departments = useMemo(() => {
    const depts = facultyData
      .map((f) => f.department)
      .filter((v, i, a) => v && a.indexOf(v) === i)
      .sort();
    return depts;
  }, [facultyData]);

  // Filter faculty by selected department
  const filteredData = useMemo(() => {
    if (!selectedDept) return facultyData;
    return facultyData.filter((f) => f.department === selectedDept);
  }, [facultyData, selectedDept]);

  // Fetch faculty data from API with Auth Token
  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetchUrl = `${host}/dep/api/faculty-directory/${branch}/`;
    console.log("Fetching faculty from:", fetchUrl);

    fetch(fetchUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("authToken")}`,
      },
    })
      .then((response) => {
        console.log("Response status:", response.status);
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Faculty data received:", data);
        // Handle paginated response
        const results = Array.isArray(data) ? data : data.results || [];
        setFacultyData(results);
        setSelectedDept(null);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Faculty fetch error:", error);
        setError(error.message);
        setLoading(false);
      });
  }, [branch]);

  return (
    <Stack gap="md" style={{ width: "100%" }}>
      {/* Department Filter */}
      <Group gap="md" align="flex-end">
        <Select
          label="Filter by Department"
          placeholder="Select a department"
          value={selectedDept}
          onChange={setSelectedDept}
          clearable
          searchable
          data={departments.map((dept) => ({ value: dept, label: dept }))}
          style={{ minWidth: "250px" }}
        />
        {selectedDept && (
          <Text size="sm" c="dimmed">
            Showing {filteredData.length} of {facultyData.length} faculty members
          </Text>
        )}
      </Group>

      {error && (
        <div style={{ color: "red", padding: "10px", marginBottom: "10px" }}>
          Error loading faculty: {error}
        </div>
      )}
      {loading ? (
        <div>Loading faculty data...</div>
      ) : filteredData.length === 0 ? (
        <div>{selectedDept ? `No faculty members found in ${selectedDept}` : `No faculty members found for ${branch}`}</div>
      ) : (
        <SpecialTable
          title="Faculty"
          columns={columns}
          data={filteredData}
          rowOptions={["10", "20", "30"]}
        />
      )}
    </Stack>
  );
}

Faculty.propTypes = {
  branch: PropTypes.string.isRequired,
};

export default Faculty;
