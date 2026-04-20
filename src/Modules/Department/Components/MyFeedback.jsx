import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Paper,
  Stack,
  Text,
  Loader,
  Badge,
  Group,
  Title,
  Timeline,
  ThemeIcon,
  Alert,
  ActionIcon,
  Button,
} from "@mantine/core";
import { IconCheck, IconAlertCircle, IconClock, IconX, IconEye } from "@tabler/icons-react";
import { host } from "../../../routes/globalRoutes";
import classes from "../styles/Departmentmodule.module.css";

export default function MyFeedback() {
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [readItems, setReadItems] = useState(new Set());
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    fetchMyFeedback();
  }, []);

  const fetchMyFeedback = async () => {
    if (!token) {
      setError("Authentication token not found.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${host}/dep/api/feedback/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      const feedbackData = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      // Filter to show only this student's feedback
      setFeedbackItems(feedbackData);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to load your feedback.");
      console.error("Error fetching feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "RESOLVED":
        return "green";
      case "NEW":
        return "blue";
      default:
        return "gray";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "RESOLVED":
        return <IconCheck size={16} />;
      case "NEW":
        return <IconClock size={16} />;
      default:
        return <IconAlertCircle size={16} />;
    }
  };

  const handleMarkAsRead = (itemId) => {
    setReadItems((prev) => new Set(prev).add(itemId));
  };

  const handleDeleteFeedback = (itemId) => {
    setFeedbackItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  if (loading) {
    return (
      <Container size="md" py="xl">
        <Loader />
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={2} mb="xs" fw={300} c="blue.7">
            My Feedback
          </Title>
          <Text c="dimmed" size="sm">
            Track the status of your submitted feedback and view resolutions
          </Text>
        </div>

        {error && (
          <Alert color="red" icon={<IconAlertCircle size={16} />} title="Error">
            {error}
          </Alert>
        )}

        {!loading && feedbackItems.length === 0 && (
          <Paper p="lg" radius="md" withBorder>
            <Text c="dimmed">You haven't submitted any feedback yet.</Text>
          </Paper>
        )}

        {feedbackItems.map((item) => (
          <Paper 
            key={item.id} 
            className={classes.tabPanelPaper} 
            p="lg" 
            radius="md" 
            withBorder
            style={{ opacity: readItems.has(item.id) ? 0.7 : 1 }}
          >
            <Group justify="space-between" mb="md" align="flex-start">
              <div style={{ flex: 1 }}>
                <Title order={4} mb="xs">
                  {item.subject}
                </Title>
                <Text size="sm" c="dimmed">
                  Submitted on {formatDate(item.submitted_at)}
                </Text>
              </div>
              <Group gap="xs">
                <Badge
                  color={getStatusColor(item.status)}
                  leftSection={
                    <ThemeIcon
                      size="xs"
                      color={getStatusColor(item.status)}
                      radius="xl"
                      variant="light"
                    >
                      {getStatusIcon(item.status)}
                    </ThemeIcon>
                  }
                >
                  {item.status}
                </Badge>
                {!readItems.has(item.id) && (
                  <ActionIcon
                    variant="light"
                    color="blue"
                    title="Mark as read"
                    onClick={() => handleMarkAsRead(item.id)}
                  >
                    <IconEye size={16} />
                  </ActionIcon>
                )}
                <ActionIcon
                  variant="light"
                  color="red"
                  title="Remove from list"
                  onClick={() => handleDeleteFeedback(item.id)}
                >
                  <IconX size={16} />
                </ActionIcon>
              </Group>
            </Group>

            {item.is_confidential && (
              <Badge color="gray" mb="md" size="sm">
                Confidential
              </Badge>
            )}

            <Paper bg="rgba(0,0,0,0.03)" p="md" radius="md" mb="md">
              <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                {item.description}
              </Text>
            </Paper>

            <Timeline active={item.status === "RESOLVED" ? 2 : 1} bulletSize={24} lineWidth={2}>
              <Timeline.Item bullet={<IconClock size={12} />} title="Submitted">
                <Text c="dimmed" size="sm" mt="sm">
                  Your feedback was submitted on {formatDate(item.submitted_at)}
                </Text>
              </Timeline.Item>

              <Timeline.Item
                bullet={
                  item.status === "RESOLVED" ? (
                    <IconCheck size={12} />
                  ) : (
                    <IconClock size={12} />
                  )
                }
                title={item.status === "RESOLVED" ? "Resolved" : "Pending Review"}
              >
                {item.status === "RESOLVED" ? (
                  <Stack gap="xs" mt="sm">
                    <Text c="dimmed" size="sm">
                      Your feedback was resolved on {formatDate(item.resolved_at)}
                    </Text>
                    {item.resolved_by && (
                      <Text c="dimmed" size="sm">
                        By: {item.resolved_by}
                      </Text>
                    )}
                  </Stack>
                ) : (
                  <Text c="dimmed" size="sm" mt="sm">
                    Your feedback is being reviewed. You'll be notified once it's resolved.
                  </Text>
                )}
              </Timeline.Item>
            </Timeline>

            {item.status === "RESOLVED" && item.resolution_remarks && (
              <Paper
                bg="rgba(34, 139, 34, 0.1)"
                p="md"
                radius="md"
                mt="md"
                style={{ border: "2px solid #228B22" }}
              >
                <Group mb="xs" gap="xs">
                  <ThemeIcon color="green" size="lg" radius="md">
                    <IconCheck size={18} />
                  </ThemeIcon>
                  <Text fw={600} c="green">
                    Resolution
                  </Text>
                </Group>
                <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                  {item.resolution_remarks}
                </Text>
              </Paper>
            )}

            {item.status === "RESOLVED" && !item.resolution_remarks && (
              <Alert
                color="blue"
                title="Resolved"
                mt="md"
                icon={<IconCheck size={16} />}
              >
                Your feedback has been reviewed and resolved.
              </Alert>
            )}
          </Paper>
        ))}
      </Stack>
    </Container>
  );
}
