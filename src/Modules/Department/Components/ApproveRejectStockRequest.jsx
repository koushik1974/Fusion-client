import React, { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import { host } from "../../../routes/globalRoutes";

export default function ApproveRejectStockRequest({ role = "", isHOD = false, branch = "" }) {
  const normalizedRole = String(role || "").toLowerCase();
  // Accept isHOD as prop OR check role format
  const hasPermission =
    isHOD ||
    normalizedRole.includes("hod") ||
    normalizedRole.includes("head of department") ||
    normalizedRole === "hod";

  if (!hasPermission) {
    return null;
  }
  const [requests, setRequests] = useState([]);
  const [remarksById, setRemarksById] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [completedDecisions, setCompletedDecisions] = useState({});

  const authToken = localStorage.getItem("authToken");

  const loadRequests = async () => {
    if (!authToken) return;
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await axios.get(`${host}/dep/api/stock/requests/`, {
        headers: {
          Authorization: `Token ${authToken}`,
        },
      });
      const all = Array.isArray(response.data) 
        ? response.data 
        : (response.data.results || []);
      setRequests(all.filter((item) => item.status === "PENDING"));
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || "Unable to load requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const updateDecision = async (id, decision) => {
    try {
      setProcessingId(id);
      await axios.post(
        `${host}/dep/api/stock/requests/${id}/decision/`,
        {
          decision,
          remarks: remarksById[id] || "",
        },
        {
          headers: {
            Authorization: `Token ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );
      
      // Mark as completed with decision
      setCompletedDecisions((prev) => ({...prev, [id]: decision}));
      
      // Show success notification
      notifications.show({
        title: "Success",
        message: `Request ${decision.toLowerCase()} successfully`,
        color: "green",
        autoClose: 3000,
      });
      
      // Reset after 2 seconds and reload
      setTimeout(() => {
        setCompletedDecisions((prev) => {const copy = {...prev}; delete copy[id]; return copy;});
        loadRequests();
      }, 2000);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.detail || "Unable to update stock request.",
      );
      setProcessingId(null);
      
      // Show error notification
      notifications.show({
        title: "Error",
        message: error.response?.data?.detail || "Failed to update stock request",
        color: "red",
        autoClose: 3000,
      });
    }
  };

  return (
    <Container size="md" py="xl">
      <Title order={2} mb="md" fw={300} c="blue.7" align="center">
        Approve or Reject Stock Request
      </Title>

      {errorMessage && (
        <Paper withBorder radius="md" p="md" mb="md" style={{ borderColor: "#fa5252" }}>
          <Text c="red.7">{errorMessage}</Text>
        </Paper>
      )}

      <Stack spacing="md">
        {loading && <Text c="dimmed">Loading requests...</Text>}

        {!loading && requests.length === 0 && (
          <Paper withBorder radius="md" p="lg">
            <Text c="dimmed">No pending stock requests.</Text>
          </Paper>
        )}

        {requests.map((item) => (
          <Paper key={item.id} withBorder radius="md" p="md">
            <Group position="apart" mb="xs">
              <Text fw={500}>{item.stock_item_name}</Text>
              <Badge color="yellow" variant="light">
                {item.status}
              </Badge>
            </Group>

            <Text size="sm" mb="xs">
              Requested by: {item.request_maker || "Unknown"}
            </Text>
            <Text size="sm" mb="xs">
              Lab: {item.lab || "-"}
            </Text>
            <Text size="sm" mb="xs">
              Quantity: {item.quantity}
            </Text>
            <Text size="sm" mb="md">
              {item.request_details}
            </Text>

            <Textarea
              label="Remarks"
              placeholder="Optional remarks for approval/rejection"
              value={remarksById[item.id] || ""}
              onChange={(event) =>
                setRemarksById((prev) => ({
                  ...prev,
                  [item.id]: event.target.value,
                }))
              }
              autosize
              minRows={2}
              mb="md"
            />

            <Group grow>
              <Button 
                color={completedDecisions[item.id] === "APPROVED" ? "green" : "green"}
                onClick={() => updateDecision(item.id, "APPROVED")}
                loading={processingId === item.id}
              >
                {completedDecisions[item.id] === "APPROVED" ? "Approved!" : "Approve"}
              </Button>
              <Button 
                color={completedDecisions[item.id] === "REJECTED" ? "red" : "red"}
                variant={completedDecisions[item.id] === "REJECTED" ? "filled" : "light"}
                onClick={() => updateDecision(item.id, "REJECTED")}
                loading={processingId === item.id}
              >
                {completedDecisions[item.id] === "REJECTED" ? "Rejected!" : "Reject"}
              </Button>
            </Group>
          </Paper>
        ))}
      </Stack>
    </Container>
  );
}
