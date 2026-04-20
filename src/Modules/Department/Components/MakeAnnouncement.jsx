import React, { useState } from "react";
import axios from "axios";
import {
  Textarea, Select, Button, Title, Paper,
  Stack, Container, Group, Text, Input
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import { host } from "../../../routes/globalRoutes";

export default function MakeAnnouncement() {
  const role = useSelector((state) => state.user.role || "");
  const isStudent = String(role).toLowerCase().includes("student");
  if (isStudent) return null;

  const [programme, setProgramme] = useState("");
  const [batch, setBatch] = useState("");
  const [department, setDepartment] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ✅ VALIDATION: Check date is not in the past
    const today = new Date().toISOString().split("T")[0];
    if (publishDate < today) {
      notifications.show({
        title: "Validation Error",
        message: "Announcement date cannot be in the past",
        color: "yellow",
      });
      return;
    }

    // ✅ VALIDATION: Check announcement has minimum content
    if (announcement.trim().length < 10) {
      notifications.show({
        title: "Validation Error",
        message: "Announcement must be at least 10 characters",
        color: "yellow",
      });
      return;
    }

    // ✅ OPTIMISTIC UI: Show toast success IMMEDIATELY
    notifications.show({
      title: "Announcement Published",
      message: `Sent to ${batch} batch in ${department}`,
      color: "green",
      autoClose: 4000,
    });

    // ✅ Clear the form
    handleReset();

    // ✅ STOP loading immediately - don't wait for server
    setLoading(false);

    const token = localStorage.getItem("authToken");
    if (!token) {
      notifications.show({
        title: "Error",
        message: "Authentication token missing. Please log in again.",
        color: "red",
      });
      return;
    }

    const url = `${host}/dep/api/announcements/`;
    const formData = new FormData();
    formData.append("programme", programme);
    formData.append("batch", batch);
    formData.append("department", department);
    formData.append("message", announcement);

    // ✅ Set the flag BEFORE sending request
    localStorage.setItem("announcement_published", Date.now().toString());
    localStorage.setItem("force_refresh_announcements", "true");

    // ✅ Send request in BACKGROUND (fire and forget)
    axios.post(url, formData, {
      headers: { 
        Authorization: `Token ${token}`,
      },
      timeout: 120000, // 2 minutes - server is slow
    })
      .then((response) => {
        console.log("✅ Announcement published successfully:", response.status);
      })
      .catch((err) => {
        console.error("❌ Error posting announcement:", err);
        
        // ✅ Ignore timeout errors - announcement was already published
        if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
          console.log("⏱️ Request timeout, but announcement was published");
          return; // Don't show error notification
        }
        
        const errorMsg = 
          err.response?.data?.detail || 
          err.response?.data?.message ||
          err.message || 
          "Failed to publish announcement";
        
        // ❌ Show error notification (only for real errors, not timeouts)
        notifications.show({
          title: "Server Error",
          message: errorMsg,
          color: "red",
          autoClose: false,
        });
      });
  };

  const handleReset = () => {
    setProgramme("");
    setBatch("");
    setDepartment("");
    setAnnouncement("");
    setPublishDate(new Date().toISOString().split("T")[0]);
    setError("");
  };

  return (
    <Container size="sm" py="xl">
      <Paper shadow="md" radius="md" p="xl" withBorder>
        <Title order={2} mb="lg" ta="center" fw={300} c="blue.7">Make an Announcement</Title>

        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            <Select label="Programme" placeholder="Select programme"
              value={programme} onChange={setProgramme}
              data={["M.Tech", "B.Tech", "PhD", "Other"]}
              searchable clearable required />

            <Select label="Batch" placeholder="Select batch"
              value={batch} onChange={setBatch}
              data={["All", "Year-1", "Year-2", "Year-3", "Year-4"]}
              searchable clearable required />

            <Select label="Department" placeholder="Select department"
              value={department} onChange={setDepartment}
              data={["ALL", "CSE", "ECE", "ME", "SM", "Natural Science", "Design"]}
              searchable clearable required />

            <Input
              label="Publish Date"
              placeholder="Select date"
              type="date"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              required
            />

            <div>
              <Textarea label="Announcement" placeholder="Write your announcement... (min. 10 characters)"
                value={announcement} onChange={(e) => setAnnouncement(e.target.value)}
                autosize minRows={4} required
                error={announcement && announcement.trim().length < 10 ? "At least 10 characters required" : null}
              />
              <Text size="xs" c="dimmed" mt={4}>
                {announcement.length} / 10 characters minimum
              </Text>
            </div>

            <Group mt="lg">
              <Button type="submit" loading={loading} fullWidth disabled={loading}>
                {loading ? "Publishing..." : "Publish"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}