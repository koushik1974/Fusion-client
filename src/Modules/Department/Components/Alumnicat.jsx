import {
  Text,
  Title,
  Select,
  Group,
  Stack,
} from "@mantine/core"; // Use Mantine components
import React, { useState, useEffect, Suspense, lazy, useMemo } from "react";
import PropTypes from "prop-types";
import { host } from "../../../routes/globalRoutes/index.jsx";

// Lazy load the SpecialTable component
const SpecialTable = lazy(() => import("./SpecialTable"));

const columns = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "department", header: "Department" },
  { accessorKey: "programme", header: "Programme" },
  { accessorKey: "contact", header: "Contact" },
  { accessorKey: "email", header: "Email" },
];

function Alumnicat({ branch }) {
  const [alumniData, setAlumniData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);

  // Get unique programs from alumni data
  const programs = useMemo(() => {
    const progs = alumniData
      .map((a) => a.programme)
      .filter((v, i, a) => v && a.indexOf(v) === i)
      .sort();
    return progs;
  }, [alumniData]);

  // Get unique departments from alumni data
  const departments = useMemo(() => {
    const depts = alumniData
      .map((a) => a.department)
      .filter((v, i, a) => v && a.indexOf(v) === i)
      .sort();
    return depts;
  }, [alumniData]);

  // Filter alumni by selected program and department
  const filteredData = useMemo(() => {
    let filtered = alumniData;
    if (selectedProgram) {
      filtered = filtered.filter((a) => a.programme === selectedProgram);
    }
    if (selectedDept) {
      filtered = filtered.filter((a) => a.department === selectedDept);
    }
    return filtered;
  }, [alumniData, selectedProgram, selectedDept]);

  // Helper function to extract batch year from roll number (e.g., "21BCS123" -> 2021)
  const getBatchYearFromRoll = (rollNo) => {
    if (!rollNo) return null;
    const match = rollNo.match(/^(\d{2})/);
    if (match) {
      const yearSuffix = parseInt(match[1]);
      // Convert 2-digit year to 4-digit (e.g., 21 -> 2021)
      return yearSuffix < 50 ? 2000 + yearSuffix : 1900 + yearSuffix;
    }
    return null;
  };

  // Filter students to get alumni (graduated students)
  const filterAlumni = (students) => {
    const currentYear = 2026;
    const courseYears = 4; // Assuming 4-year course
    const graduationYear = currentYear - courseYears; // 2022

    return students.filter((student) => {
      const batchYear = getBatchYearFromRoll(student.id); // Using id (roll_no) from API
      if (!batchYear) return false;
      // Alumni are those who have graduated (batch year + course years < current year)
      // Or show students from batch 2022 and earlier
      return batchYear <= graduationYear;
    });
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Fetch from student-directory and filter for alumni based on batch
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
        // Filter to get only alumni
        const alumni = filterAlumni(results);
        console.log(`Filtered ${alumni.length} alumni from ${results.length} students`);
        setAlumniData(alumni);
        setSelectedProgram(null);
        setSelectedDept(null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Alumni fetch error:", err);
        setError("Failed to load alumni data");
        setAlumniData([]);
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
            Showing {filteredData.length} of {alumniData.length} alumni
          </Text>
        )}
      </Group>

      <div style={{ margin: "20px" }}>
        <Title order={4} fw={300} c="blue.7" mb="xs">
          Alumni
        </Title>
        <Text size="sm" color="dimmed" mb="md">
          Showing graduates from batch 2022 and earlier (current year: 2026)
        </Text>

      {error && (
        <Text color="red" size="sm" mb="md">
          {error}
        </Text>
      )}

      {loading ? (
        <Text>Loading data...</Text>
      ) : filteredData.length === 0 ? (
        <Text>{selectedProgram ? `No alumni found in ${selectedProgram}` : `No alumni found for ${branch}`}</Text>
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
              data={filteredData}
              rowOptions={["10", "20", "50"]}
            />
          </div>
        </Suspense>
      )}
      </div>
    </Stack>
  );
}

Alumnicat.propTypes = {
  branch: PropTypes.string.isRequired,
};

export default Alumnicat;
