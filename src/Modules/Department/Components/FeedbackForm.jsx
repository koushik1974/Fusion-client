import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Badge,
  Button,
  Checkbox,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import { host } from "../../../routes/globalRoutes";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function FeedbackForm({ branch, mode }) {
  const role = useSelector((state) => state.user.role || "");
  const isStudent = mode ? mode === "student" : String(role).toLowerCase().includes("student");

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(branch || "CSE");
  const [isConfidential, setIsConfidential] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState(null);

  const [feedbackItems, setFeedbackItems] = useState([]);
  const [resolutionRemarks, setResolutionRemarks] = useState({});
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  const token = localStorage.getItem("authToken");
  const resolvedCategory = useMemo(() => branch || category || "CSE", [branch, category]);

  useEffect(() => {
    setCategory(branch || "CSE");
  }, [branch]);

  useEffect(() => {
    if (!isStudent) {
      loadFeedbackItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStudent, branch]);

  const loadFeedbackItems = async () => {
    if (!token) return;

    setLoadingList(true);

    try {
      const response = await axios.get(`${host}/dep/api/feedback/?category=${resolvedCategory}`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setFeedbackItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoadingList(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(false);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("description", description);
      formData.append("category", resolvedCategory);
      formData.append("is_confidential", String(isConfidential));
      if (uploadFeedback) {
        formData.append("upload_feedback", uploadFeedback);
      }

      await axios.post(`${host}/dep/api/feedback/`, formData, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSubject("");
      setDescription("");
      setIsConfidential(false);
      setUploadFeedback(null);
      setSuccess(true);

      // Show success notification
      notifications.show({
        title: "Success",
        message: "Feedback submitted successfully",
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
        message: error.response?.data?.detail || "Failed to submit feedback",
        color: "red",
        autoClose: 3000,
      });
      
      // Reset error state after 3 seconds
      setTimeout(() => setError(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (feedbackId) => {
    try {
      await axios.post(
        `${host}/dep/api/feedback/${feedbackId}/resolve/`,
        {
          status: "RESOLVED",
          resolution_remarks: resolutionRemarks[feedbackId] || "",
        },
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      loadFeedbackItems();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Container size="md" py="xl">
      <Paper shadow="md" radius="md" p="xl" withBorder>
        <Title order={2} mb="lg">
          {isStudent ? "Submit Feedback" : "Resolve Feedback"}
        </Title>

        {isStudent ? (
          <form onSubmit={handleSubmit}>
            <Stack spacing="md">
              <TextInput
                label="Subject"
                placeholder="Enter subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                required
              />

              <Textarea
                label="Description"
                placeholder="Describe your feedback..."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                autosize
                minRows={4}
                required
              />

              <Checkbox
                label="Mark as confidential"
                checked={isConfidential}
                onChange={(event) => setIsConfidential(event.currentTarget.checked)}
              />

              <Group mt="lg">
                <Button 
                  type="submit" 
                  loading={loading}
                  color={success ? "green" : error ? "red" : "blue"}
                  fullWidth
                >
                  {success ? "Submitted!" : error ? "Failed!" : loading ? "Submitting..." : "Submit"}
                </Button>
              </Group>
            </Stack>
          </form>
        ) : (
          <Stack spacing="md">
            {loadingList && <Text>Loading feedback...</Text>}

            {!loadingList && feedbackItems.length === 0 && (
              <Text>No feedback found.</Text>
            )}

            {feedbackItems.map((item) => (
              <Paper key={item.id} withBorder p="md">
                <Group justify="space-between" mb="md">
                  <Text fw={600}>{item.subject}</Text>
                  <Badge color={item.status === "RESOLVED" ? "green" : "yellow"}>
                    {item.status}
                  </Badge>
                </Group>

                <Text size="sm" mb="sm">
                  From: {item.is_confidential ? "Confidential" : item.submitter || "Unknown"}
                </Text>
                
                <Text size="sm" mb="md">
                  {item.description}
                </Text>

                {item.resolution_remarks && (
                  <Paper bg="#f0f9ff" p="sm" mb="md" style={{ border: "1px solid #15abff" }}>
                    <Text size="sm" c="#15abff" fw={500} mb="xs">✓ Resolution</Text>
                    <Text size="sm">{item.resolution_remarks}</Text>
                  </Paper>
                )}

                {item.status !== "RESOLVED" && (
                  <>
                    <Text size="sm" fw={600} mb="sm" c="#15abff">
                      Add Resolution
                    </Text>
                    <Textarea
                      placeholder="Provide resolution remarks..."
                      value={resolutionRemarks[item.id] || ""}
                      onChange={(event) =>
                        setResolutionRemarks((prev) => ({
                          ...prev,
                          [item.id]: event.target.value,
                        }))
                      }
                      autosize
                      minRows={2}
                      maxRows={4}
                      mb="md"
                    />

                    <Button 
                      onClick={() => handleResolve(item.id)}
                      size="sm"
                      fullWidth
                    >
                      Mark as Resolved
                    </Button>
                  </>
                )}
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>
    </Container>
  );
}
