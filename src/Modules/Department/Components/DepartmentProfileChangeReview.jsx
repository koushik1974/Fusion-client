import { useEffect, useState } from "react";
import axios from "axios";
import {
  Badge,
  Button,
  Divider,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { host } from "../../../routes/globalRoutes";
import classes from "../styles/Departmentmodule.module.css";

function DepartmentProfileChangeReview() {
  const [loading, setLoading] = useState(true);
  const [decisionLoadingId, setDecisionLoadingId] = useState(null);
  const [requests, setRequests] = useState([]);
  const [remarksById, setRemarksById] = useState({});

  const fetchRequests = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      notifications.show({ message: "Authentication token not found.", color: "red" });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${host}/dep/api/profile-change-requests/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const items = Array.isArray(response.data) ? response.data : [];
      setRequests(items.filter((item) => (item.status || "").toLowerCase() === "pending"));
    } catch (error) {
      notifications.show({
        message: error?.response?.data?.detail || "Unable to fetch profile change requests.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateDecision = async (requestId, decision) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      notifications.show({ message: "Authentication token not found.", color: "red" });
      return;
    }

    setDecisionLoadingId(requestId);
    try {
      await axios.post(
        `${host}/dep/api/profile-change-requests/${requestId}/decision/`,
        {
          decision,
          remarks: remarksById[requestId] || "",
        },
        { headers: { Authorization: `Token ${token}` } },
      );

      notifications.show({
        message: decision === "APPROVED" ? "Change approved and applied." : "Change rejected.",
        color: "green",
      });
      await fetchRequests();
    } catch (error) {
      notifications.show({
        message: error?.response?.data?.detail || "Unable to update decision.",
        color: "red",
      });
    } finally {
      setDecisionLoadingId(null);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <Paper className={classes.tabPanelPaper} p="lg" radius="md" withBorder>
      <Stack gap="md">
        <div>
          <Text fw={500} size="lg" className={classes.sectionTitle}>
            Review Profile Change Requests
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            Dept Admin and HOD can review, approve, or reject department-level profile updates.
          </Text>
        </div>

        <Divider />

        {!requests.length ? (
          <Text c="dimmed">No pending profile change requests.</Text>
        ) : (
          requests.map((item) => {
            const changes = item.changes || {};
            const changeRows = Object.entries(changes);

            return (
              <Paper key={item.id} p="md" withBorder radius="md">
                <Stack gap="sm">
                  <Group justify="space-between" align="center">
                    <Text fw={500}>Request #{item.id}</Text>
                    <Badge color="yellow" variant="light">
                      Pending
                    </Badge>
                  </Group>

                  <Text size="sm">Target: {(item.target_type || "-").toUpperCase()} - {item.target_id || "-"}</Text>
                  <Text size="sm">Requested by: {item.request_maker || "-"}</Text>

                  {!changeRows.length ? (
                    <Text size="sm" c="dimmed">No changes in payload.</Text>
                  ) : (
                    <Stack gap={4}>
                      {changeRows.map(([key, value]) => (
                        <Text key={key} size="sm">
                          {key}: {String(value ?? "")}
                        </Text>
                      ))}
                    </Stack>
                  )}

                  <Textarea
                    label="Reviewer Remarks"
                    placeholder="Optional remarks"
                    value={remarksById[item.id] || ""}
                    onChange={(event) =>
                      setRemarksById((prev) => ({ ...prev, [item.id]: event.currentTarget.value }))
                    }
                    minRows={2}
                    autosize
                  />

                  <Group justify="flex-end">
                    <Button
                      color="green"
                      onClick={() => updateDecision(item.id, "APPROVED")}
                      loading={decisionLoadingId === item.id}
                    >
                      Approve
                    </Button>
                    <Button
                      color="red"
                      variant="light"
                      onClick={() => updateDecision(item.id, "REJECTED")}
                      loading={decisionLoadingId === item.id}
                    >
                      Reject
                    </Button>
                  </Group>
                </Stack>
              </Paper>
            );
          })
        )}
      </Stack>
    </Paper>
  );
}

export default DepartmentProfileChangeReview;
