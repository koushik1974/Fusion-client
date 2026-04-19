import React, { useState } from "react";
import axios from "axios";
import {
  Textarea,
  Select,
  Button,
  Title,
  Paper,
  Stack,
  Container,
  Group,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import { host } from "../../../routes/globalRoutes";

export default function MakeAnnouncement() {
  const role = useSelector((state) => state.user.role || "");
  const isStudent = String(role).toLowerCase().includes("student");

  if (isStudent) {
    return null;
  }
  const [programme, setProgramme] = useState("");
  const [batch, setBatch] = useState("");
  const [department, setDepartment] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    setSuccess(false);

    const token = localStorage.getItem("authToken");

    const url = `${host}/dep/api/announcements/`;
    const formData = new FormData();
    formData.append("programme", programme);
    formData.append("batch", batch);
    formData.append("department", department);
    formData.append("message", announcement);

    try {
      await axios.post(url, formData, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      setProgramme("");
      setBatch("");
      setDepartment("");
      setAnnouncement("");
      setSuccess(true);
      
      // Show success notification
      notifications.show({
        title: "Success",
        message: "Announcement published successfully",
        color: "green",
        autoClose: 3000,
      });
      
      // Reset success state after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error:", error);
      setError(true);
      
      // Show error notification
      notifications.show({
        title: "Error",
        message: error.response?.data?.detail || "Failed to publish announcement",
        color: "red",
        autoClose: 3000,
      });
      
      // Reset error state after 3 seconds
      setTimeout(() => setError(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Paper shadow="md" radius="md" p="xl" withBorder>
        <Title order={2} mb="lg">Make an Announcement</Title>

        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            <Select
              label="Programme"
              placeholder="Select programme"
              value={programme}
              onChange={setProgramme}
              data={["M.Tech", "B.Tech", "PhD", "Other"]}
              searchable
              clearable
              required
            />

            <Select
              label="Batch"
              placeholder="Select batch"
              value={batch}
              onChange={setBatch}
              data={["All", "Year-1", "Year-2", "Year-3", "Year-4"]}
              searchable
              clearable
              required
            />

            <Select
              label="Department"
              placeholder="Select department"
              value={department}
              onChange={setDepartment}
              data={["ALL", "CSE", "ECE", "ME", "SM", "Natural Science", "Design"]}
              searchable
              clearable
              required
            />

            <Textarea
              label="Announcement"
              placeholder="Write your announcement..."
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              autosize
              minRows={4}
              required
            />

            <Group mt="lg">
              <Button 
                type="submit" 
                loading={loading}
                color={success ? "green" : error ? "red" : "blue"}
                fullWidth
              >
                {success ? "Published!" : error ? "Failed!" : loading ? "Publishing..." : "Publish"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
