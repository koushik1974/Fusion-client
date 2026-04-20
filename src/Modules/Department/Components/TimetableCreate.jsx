import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Container,
  Notification,
  Paper,
  Select,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { host } from "../../../routes/globalRoutes";

export default function TimetableCreate({ branch }) {
  const [department, setDepartment] = useState(branch || "CSE");
  const [programme, setProgramme] = useState("B.Tech");
  const [batch, setBatch] = useState("2021");
  const [dayOfWeek, setDayOfWeek] = useState("Monday");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [subject, setSubject] = useState("");
  const [faculty, setFaculty] = useState("");
  const [roomNo, setRoomNo] = useState("");
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [semester, setSemester] = useState("1");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (branch) {
      setDepartment(branch);
    }
  }, [branch]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const token = localStorage.getItem("authToken");
    if (!token) {
      setErrorMessage("Authentication token is missing.");
      setLoading(false);
      return;
    }

    if (!startTime || !endTime || !subject || !faculty || !roomNo) {
      setErrorMessage("Please fill all required fields.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${host}/dep/api/timetable/`,
        {
          department,
          programme,
          batch,
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
          subject,
          faculty,
          room_no: roomNo,
          academic_year: academicYear,
          semester,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      setSuccessMessage(`Timetable entry created successfully. Entry ID: ${response.data.id}`);
      setStartTime("");
      setEndTime("");
      setSubject("");
      setFaculty("");
      setRoomNo("");
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || "Unable to create timetable entry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="md" py="xl">
      <Paper shadow="md" radius="md" p="xl" withBorder>
        <Title order={2} mb="md" fw={300} c="blue.7" align="center">
          Create Timetable
        </Title>

        {errorMessage && (
          <Notification color="red" title="Error" mb="md">
            {errorMessage}
          </Notification>
        )}

        {successMessage && (
          <Notification color="green" title="Success" mb="md">
            {successMessage}
          </Notification>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            <Select
              label="Department"
              value={department}
              onChange={setDepartment}
              data={[
                { value: "CSE", label: "CSE" },
                { value: "ECE", label: "ECE" },
                { value: "ME", label: "ME" },
                { value: "SM", label: "SM" },
                { value: "DS", label: "Design" },
                { value: "LA", label: "Liberal Arts" },
                { value: "NS", label: "Natural Science" },
              ]}
              required
            />

            <Select
              label="Programme"
              value={programme}
              onChange={setProgramme}
              data={[
                { value: "B.Tech", label: "B.Tech" },
                { value: "M.Tech", label: "M.Tech" },
                { value: "PhD", label: "PhD" },
              ]}
              required
            />

            <Select
              label="Batch"
              value={batch}
              onChange={setBatch}
              data={[
                { value: "2021", label: "2021" },
                { value: "2022", label: "2022" },
                { value: "2023", label: "2023" },
                { value: "2024", label: "2024" },
                { value: "2025", label: "2025" },
              ]}
              required
            />

            <Select
              label="Day of Week"
              value={dayOfWeek}
              onChange={setDayOfWeek}
              data={[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ]}
              required
            />

            <TextInput
              label="Start Time"
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              required
            />

            <TextInput
              label="End Time"
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              required
            />

            <TextInput
              label="Subject"
              placeholder="Enter subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              required
            />

            <TextInput
              label="Faculty"
              placeholder="Enter faculty name"
              value={faculty}
              onChange={(event) => setFaculty(event.target.value)}
              required
            />

            <TextInput
              label="Room No"
              placeholder="Enter room number"
              value={roomNo}
              onChange={(event) => setRoomNo(event.target.value)}
              required
            />

            <TextInput
              label="Academic Year"
              value={academicYear}
              onChange={(event) => setAcademicYear(event.target.value)}
              required
            />

            <Select
              label="Semester"
              value={semester}
              onChange={setSemester}
              data={[
                { value: "1", label: "1" },
                { value: "2", label: "2" },
                { value: "3", label: "3" },
                { value: "4", label: "4" },
                { value: "5", label: "5" },
                { value: "6", label: "6" },
                { value: "7", label: "7" },
                { value: "8", label: "8" },
              ]}
              required
            />

            <Button type="submit" fullWidth loading={loading} size="md">
              {loading ? "Saving..." : "Create Timetable Entry"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
