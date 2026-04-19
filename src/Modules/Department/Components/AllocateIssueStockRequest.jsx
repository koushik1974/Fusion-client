import React, { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Container,
  Group,
  NumberInput,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import { useSelector } from "react-redux";
import { host } from "../../../routes/globalRoutes";

export default function AllocateIssueStockRequest() {
  const role = useSelector((state) => state.user.role || "");
  const isDeptAdmin = String(role).toLowerCase().includes("dept_admin") || String(role).toLowerCase().includes("department_admin");

  if (!isDeptAdmin) {
    return null;
  }
  const [requests, setRequests] = useState([]);
  const [issuedQuantityById, setIssuedQuantityById] = useState({});
  const [remarksById, setRemarksById] = useState({});
  const [actionById, setActionById] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [completedActions, setCompletedActions] = useState({});

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
      const all = Array.isArray(response.data) ? response.data : [];
      setRequests(all.filter((item) => item.status === "APPROVED"));
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || "Unable to load requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const submitIssue = async (item) => {
    const requestId = item.id;
    const issuedQuantity = issuedQuantityById[requestId] || item.quantity;
    const action = actionById[requestId] || "ISSUE";

    try {
      setProcessingId(requestId);
      await axios.post(
        `${host}/dep/api/stock/requests/${requestId}/issue/`,
        {
          action,
          issued_quantity: issuedQuantity,
          remarks: remarksById[requestId] || "",
        },
        {
          headers: {
            Authorization: `Token ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );
      
      // Mark as completed
      setCompletedActions((prev) => ({...prev, [requestId]: true}));
      
      // Show success notification
      notifications.show({
        title: "Success",
        message: `Stock request ${action.toLowerCase()} successfully`,
        color: "green",
        autoClose: 3000,
      });
      
      // Reset after 2 seconds and reload
      setTimeout(() => {
        setCompletedActions((prev) => {const copy = {...prev}; delete copy[requestId]; return copy;});
        loadRequests();
      }, 2000);
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || "Unable to allocate/issue request.");
      setProcessingId(null);
      
      // Show error notification
      notifications.show({
        title: "Error",
        message: error.response?.data?.detail || "Failed to submit stock request",
        color: "red",
        autoClose: 3000,
      });
    }
  };

  return (
    <Container size="md" py="xl">
      <Title order={2} mb="md" fw={400}>
        Allocate and Issue Stock Request
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
            <Text c="dimmed">No approved stock requests available for allocation/issue.</Text>
          </Paper>
        )}

        {requests.map((item) => (
          <Paper key={item.id} withBorder radius="md" p="md">
            <Group position="apart" mb="xs">
              <Text fw={500}>{item.stock_item_name}</Text>
              <Badge color="green" variant="light">
                {item.status}
              </Badge>
            </Group>

            <Text size="sm" mb="xs">
              Requested by: {item.request_maker || "Unknown"}
            </Text>
            <Text size="sm" mb="xs">
              Lab: {item.lab || "-"}
            </Text>
            <Text size="sm" mb="md">
              Requested quantity: {item.quantity}
            </Text>

            <SegmentedControl
              value={actionById[item.id] || "ISSUE"}
              onChange={(value) =>
                setActionById((prev) => ({
                  ...prev,
                  [item.id]: value,
                }))
              }
              data={[
                { label: "Allocate", value: "ALLOCATE" },
                { label: "Issue", value: "ISSUE" },
              ]}
              mb="md"
            />

            <NumberInput
              label="Issued Quantity"
              min={1}
              max={item.quantity}
              value={issuedQuantityById[item.id] || item.quantity}
              onChange={(value) =>
                setIssuedQuantityById((prev) => ({
                  ...prev,
                  [item.id]: Number(value) || item.quantity,
                }))
              }
              mb="md"
            />

            <Textarea
              label="Remarks"
              placeholder="Optional remarks"
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

            <Button 
              onClick={() => submitIssue(item)}
              loading={processingId === item.id}
              color={completedActions[item.id] ? "green" : "blue"}
              fullWidth
            >
              {completedActions[item.id] ? "Submitted!" : "Submit"}
            </Button>
          </Paper>
        ))}
      </Stack>
    </Container>
  );
}
