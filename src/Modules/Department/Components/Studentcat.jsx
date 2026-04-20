import { Text, Title, Select, Group, Stack } from "@mantine/core";
import React, { useState, useEffect, lazy, useMemo } from "react";
import PropTypes from "prop-types";
import { host } from "../../../routes/globalRoutes/index.jsx";

const SpecialTable = lazy(() => import("./SpecialTable.jsx"));

const columns = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "department", header: "Department" },
  { accessorKey: "programme", header: "Programme" },
  { accessorKey: "contact", header: "Contact" },
  { accessorKey: "email", header: "Email" },
];

function Studentcat({ branch }) {
  const [studentData, setStudentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);

  // Get unique programs from student data
  const programs = useMemo(() => {
    const progs = studentData
      .map((s) => s.programme)
      .filter((v, i, a) => v && a.indexOf(v) === i)
      .sort();
    return progs;
  }, [studentData]);

  // Get unique departments from student data
  const departments = useMemo(() => {
    const depts = studentData
      .map((s) => s.department)
      .filter((v, i, a) => v && a.indexOf(v) === i)
      .sort();
    return depts;
  }, [studentData]);

  // Filter students by selected program and department
  const filteredData = useMemo(() => {
    let filtered = studentData;
    if (selectedProgram) {
      filtered = filtered.filter((s) => s.programme === selectedProgram);
    }
    if (selectedDept) {
      filtered = filtered.filter((s) => s.department === selectedDept);
    }
    return filtered;
  }, [studentData, selectedProgram, selectedDept]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setStudentData([]);
    const fetchUrl = `${host}/dep/api/student-directory/${branch}/`;
    console.log("Fetching students from:", fetchUrl);

    fetch(fetchUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("authToken")}`,
      },
    })
      .then((res) => {
        console.log("Response status:", res.status);
        return res.ok ? res.json() : Promise.reject(new Error(`API Error: ${res.status}`));
      })
      .then((data) => {
        console.log("Student data received:", data);
        // Handle paginated response
        const results = Array.isArray(data) ? data : data.results || [];
        setStudentData(results);
        setSelectedProgram(null);
        setSelectedDept(null);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Student fetch error:", error);
        setError(error.message);
        setLoading(false);
      });
  }, [branch]);

  return (
    <Stack gap="md">
      {/* Filters Row */}
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
        <Select
          label="Filter by Programme"
          placeholder="Select a programme"
          value={selectedProgram}
          onChange={setSelectedProgram}
          clearable
          searchable
          data={programs.map((prog) => ({ value: prog, label: prog }))}
          style={{ minWidth: "250px" }}
        />
        {(selectedProgram || selectedDept) && (
          <Text size="sm" c="dimmed">
            Showing {filteredData.length} of {studentData.length} students
          </Text>
        )}
      </Group>

      <Title order={3} fw={300} c="blue.7" mb="md">
        Students
      </Title>

      {error && (
        <Text color="red" size="sm" mb="md">
          Error loading students: {error}
        </Text>
      )}

      {loading ? (
        <Text>Loading data...</Text>
      ) : filteredData.length === 0 ? (
        <Text>{selectedProgram ? `No students found in ${selectedProgram}` : `No students found for ${branch}`}</Text>
      ) : (
        <SpecialTable
          title="Student"
          columns={columns}
          data={filteredData}
          rowOptions={["20", "50", "100"]}
        />
      )}
    </Stack>
  );
}

export default Studentcat;

Studentcat.propTypes = {
  branch: PropTypes.string.isRequired,
};
