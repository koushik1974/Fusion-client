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
  const [resolvingId, setResolvingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const token = localStorage.getItem("authToken");
  const resolvedCategory = useMemo(() => branch || category || "CSE", [branch, category]);

  // ✅ Compute feedback statistics
  const feedbackStats = useMemo(() => {
    const stats = {
      total: feedbackItems.length,
      resolved: feedbackItems.filter(f => f.status === "RESOLVED").length,
      open: feedbackItems.filter(f => f.status !== "RESOLVED").length,
    };
    return stats;
  }, [feedbackItems]);

  // ✅ Pagination: 8 items per page
  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.ceil(feedbackItems.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIdx = startIdx + ITEMS_PER_PAGE;
    return feedbackItems.slice(startIdx, endIdx);
  }, [feedbackItems, currentPage]);

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
    setCurrentPage(1); // ✅ Reset to page 1 when loading new feedback

    try {
      const response = await axios.get(`${host}/dep/api/feedback/?category=${resolvedCategory}`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      const feedbackData = Array.isArray(response.data) 
        ? response.data 
        : (response.data.results || []);
      setFeedbackItems(feedbackData);
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

    // Input validation
    if (!subject?.trim()) {
      notifications.show({
        title: "Validation Error",
        message: "Subject is required",
        color: "yellow",
      });
      setLoading(false);
      return;
    }

    if (subject.trim().length < 5) {
      notifications.show({
        title: "Validation Error",
        message: "Subject must be at least 5 characters",
        color: "yellow",
      });
      setLoading(false);
      return;
    }

    if (!description?.trim()) {
      notifications.show({
        title: "Validation Error",
        message: "Description is required",
        color: "yellow",
      });
      setLoading(false);
      return;
    }

    if (description.trim().length < 10) {
      notifications.show({
        title: "Validation Error",
        message: "Description must be at least 10 characters",
        color: "yellow",
      });
      setLoading(false);
      return;
    }

    // ✅ BR Enforcement: Validate category is valid
    const validCategories = ["CSE", "ECE", "ME", "SM", "Natural Science", "Design", "ALL"];
    if (!validCategories.includes(resolvedCategory)) {
      notifications.show({
        title: "Validation Error",
        message: "Invalid feedback category selected",
        color: "yellow",
      });
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("subject", subject.trim());
      formData.append("description", description.trim());
      formData.append("category", resolvedCategory);
      formData.append("is_confidential", String(isConfidential));
      if (uploadFeedback) {
        formData.append("upload_feedback", uploadFeedback);
      }

      const response = await axios.post(`${host}/dep/api/feedback/`, formData, {
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
      
      console.log("Feedback submitted:", response.status);
      
      // Reset success state after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Feedback submission error:", {
        status: error.response?.status,
        detail: error.response?.data?.detail,
        message: error.message,
      });
      setError(true);
      
      const errorMsg = 
        error.response?.data?.detail ||
        error.response?.data?.message ||
        (error.response?.status === 400 ? "Invalid feedback data" : "Failed to submit feedback");
      
      // Show error notification
      notifications.show({
        title: "Error",
        message: errorMsg,
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
    const remarks = resolutionRemarks[feedbackId]?.trim();

    // Validation: remarks required
    if (!remarks) {
      notifications.show({
        title: "Validation Error",
        message: "Resolution remarks are required",
        color: "yellow",
      });
      return;
    }

    // Validation: minimum length
    if (remarks.length < 10) {
      notifications.show({
        title: "Validation Error",
        message: "Resolution remarks must be at least 10 characters",
        color: "yellow",
      });
      return;
    }

    setResolvingId(feedbackId);
    try {
      // ✅ Audit Logging - Attempt to resolve feedback
      console.log("[AUDIT] Attempting to resolve feedback:", {
        feedbackId,
        remarksLength: remarks.length,
        timestamp: new Date().toISOString(),
        userRole: role,
      });
      
      const response = await axios.post(
        `${host}/dep/api/feedback/${feedbackId}/resolve/`,
        {
          status: "RESOLVED",
          resolution_remarks: remarks,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 120000,
        },
      );

      console.log("Feedback resolved successfully:", response.status);
      
      // ✅ Audit Logging - Success
      console.log("[AUDIT] Feedback resolved successfully:", {
        feedbackId,
        status: response.status,
        timestamp: new Date().toISOString(),
      });
      
      notifications.show({
        title: "Success",
        message: "Feedback marked as resolved",
        color: "green",
        autoClose: 3000,
      });

      // Clear the remarks for this feedback
      setResolutionRemarks((prev) => ({
        ...prev,
        [feedbackId]: "",
      }));

      loadFeedbackItems();
    } catch (error) {
      console.error("Error resolving feedback:", {
        status: error.response?.status,
        detail: error.response?.data?.detail,
        message: error.message,
        timeout: error.code === "ECONNABORTED",
      });
      
      // ✅ Audit Logging - Error
      console.log("[AUDIT] Feedback resolution failed:", {
        feedbackId,
        errorStatus: error.response?.status,
        errorMessage: error.response?.data?.detail,
        timestamp: new Date().toISOString(),
      });
      
      let errorMsg = "Failed to mark feedback as resolved";
      
      if (error.response?.status === 403) {
        errorMsg = "You don't have permission to resolve feedback";
      } else if (error.response?.data?.detail) {
        errorMsg = error.response.data.detail;
      } else if (error.code === "ECONNABORTED") {
        errorMsg = "Request timeout - feedback may still be resolving";
      }
      
      notifications.show({
        title: "Error",
        message: errorMsg,
        color: "red",
        autoClose: false,
      });
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <Container size="md" py="xl">
      <Paper shadow="md" radius="md" p="xl" withBorder>
        <Title order={2} mb="lg" fw={300} c="blue.7" align="center">
          {isStudent ? "Submit Feedback" : "Resolve Feedback"}
        </Title>

        {isStudent ? (
          <form onSubmit={handleSubmit}>
            <Stack spacing="md">
              <div>
                <TextInput
                  label="Subject"
                  placeholder="Enter subject (min. 5 characters)"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  required
                  error={subject && subject.trim().length < 5 ? "At least 5 characters required" : null}
                />
                <Text size="xs" c="dimmed" mt={4}>
                  {subject.length} / 5 characters minimum
                </Text>
              </div>

              <div>
                <Textarea
                  label="Description"
                  placeholder="Describe your feedback... (min. 10 characters)"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  autosize
                  minRows={4}
                  required
                  error={description && description.trim().length < 10 ? "At least 10 characters required" : null}
                />
                <Text size="xs" c="dimmed" mt={4}>
                  {description.length} / 10 characters minimum
                </Text>
              </div>

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
            {/* Feedback Statistics - Spread Layout */}
            <Group justify="space-between" gap="xl" bg="blue.0" p="md" radius="md">
              <Group gap="xs">
                <Text fw={600} c="blue.7" size="lg">{feedbackStats.total}</Text>
                <Text size="sm" c="dimmed">total</Text>
              </Group>
              <Group gap="xs">
                <Text fw={600} c="yellow.7" size="lg">{feedbackStats.open}</Text>
                <Text size="sm" c="dimmed">open</Text>
              </Group>
              <Group gap="xs">
                <Text fw={600} c="green.7" size="lg">{feedbackStats.resolved}</Text>
                <Text size="sm" c="dimmed">resolved</Text>
              </Group>
            </Group>

            {loadingList && <Text>Loading feedback...</Text>}

            {!loadingList && feedbackItems.length === 0 && (
              <Text>No feedback found.</Text>
            )}

            {paginatedItems.map((item) => (
              <Paper key={item.id} withBorder p="md" style={{
                borderLeft: `4px solid ${item.status === "RESOLVED" ? "#51CF66" : "#FFC107"}`,
              }}>
                <Group justify="space-between" mb="md" align="flex-start">
                  <div style={{ flex: 1 }}>
                    <Text fw={600} size="lg">{item.subject}</Text>
                    <Text size="xs" c="dimmed" mt={4}>
                      {item.submitter && !item.is_confidential ? `From: ${item.submitter}` : "From: Confidential"}
                    </Text>
                  </div>
                  <Badge 
                    color={item.status === "RESOLVED" ? "green" : "yellow"}
                    variant="filled"
                    size="lg"
                    fw={400}
                  >
                    {item.status === "RESOLVED" ? "Resolved" : "Open"}
                  </Badge>
                </Group>

                <Text size="sm" mb="md">
                  {item.description}
                </Text>

                {item.resolution_remarks && (
                  <Paper bg="#f0f9ff" p="sm" mb="md" style={{ border: "1px solid #15abff" }}>
                    <Group gap="xs" mb="xs">
                      <div style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#15abff",
                      }} />
                      <Text size="sm" c="#15abff" fw={500}>Resolution</Text>
                    </Group>
                    <Text size="sm">{item.resolution_remarks}</Text>
                  </Paper>
                )}

                {item.status !== "RESOLVED" && (
                  <>
                    <Text size="sm" fw={600} mb="sm" c="#15abff">
                      Add Resolution (min. 10 characters)
                    </Text>
                    <Textarea
                      placeholder="Provide resolution remarks... (min. 10 characters)"
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
                      mb="xs"
                      error={
                        resolutionRemarks[item.id] && 
                        resolutionRemarks[item.id].trim().length < 10
                          ? "At least 10 characters required"
                          : null
                      }
                    />
                    <Text size="xs" c="dimmed" mb="md">
                      {(resolutionRemarks[item.id] || "").length} / 10 characters minimum
                    </Text>

                    <Button 
                      onClick={() => handleResolve(item.id)}
                      size="sm"
                      fullWidth
                      loading={resolvingId === item.id}
                      disabled={resolvingId !== null || !resolutionRemarks[item.id]?.trim() || resolutionRemarks[item.id].trim().length < 10}
                      color={resolutionRemarks[item.id]?.trim().length >= 10 ? "blue" : "gray"}
                    >
                      {resolvingId === item.id ? "Marking..." : "Mark as Resolved"}
                    </Button>
                  </>
                )}
              </Paper>
            ))}
            {/* ✅ Pagination Controls */}
            {totalPages > 1 && (
              <Group justify="center" gap="sm" mt="lg">
                <Button
                  variant="default"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </Button>
                <Text size="sm" c="dimmed" fw={600}>
                  Page {currentPage} of {totalPages}
                </Text>
                <Button
                  variant="default"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </Button>
              </Group>
            )}          </Stack>
        )}
      </Paper>
    </Container>
  );
}
