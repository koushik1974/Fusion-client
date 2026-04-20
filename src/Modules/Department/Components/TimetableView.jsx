import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Badge,
  Button,
  Container,
  Group,
  Select,
  Notification,
  Paper,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { Trash } from "@phosphor-icons/react";
import { host } from "../../../routes/globalRoutes";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function TimetableView({ branch }) {
  const [items, setItems] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState(branch || "ALL");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const token = localStorage.getItem("authToken");

  const loadTimetable = async () => {
    if (!token) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.get(`${host}/dep/api/timetable/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      const timetableItems = Array.isArray(response.data) ? response.data : [];
      const filteredItems = departmentFilter && departmentFilter !== "ALL"
        ? timetableItems.filter((item) => String(item.department).toUpperCase() === String(departmentFilter).toUpperCase())
        : timetableItems;
      setItems(filteredItems);
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || "Unable to load timetable entries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimetable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentFilter]);

  const handleDelete = async (timetableId) => {
    const confirmDelete = window.confirm("Delete this timetable entry?");
    if (!confirmDelete) return;

    if (!token) {
      setErrorMessage("Authentication token is missing.");
      return;
    }

    setDeletingId(timetableId);
    try {
      await axios.delete(`${host}/dep/api/timetable/${timetableId}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setSuccessMessage("Timetable entry deleted successfully.");
      loadTimetable();
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || "Unable to delete timetable entry.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Container size="xl" py="xl">
      <Paper shadow="md" radius="md" p="xl" withBorder>
        <Title order={2} mb="md" fw={300} c="blue.7" align="center">
          View Timetable
        </Title>

        <Select
          label="Filter by Department"
          value={departmentFilter}
          onChange={setDepartmentFilter}
          data={[
            { value: "ALL", label: "All Departments" },
            { value: "CSE", label: "CSE" },
            { value: "ECE", label: "ECE" },
            { value: "ME", label: "ME" },
            { value: "SM", label: "SM" },
            { value: "DS", label: "Design" },
            { value: "LA", label: "Liberal Arts" },
            { value: "NS", label: "Natural Science" },
          ]}
          mb="md"
        />

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

        {loading ? (
          <Text c="dimmed">Loading timetable entries...</Text>
        ) : items.length === 0 ? (
          <Text c="dimmed">No timetable entries available.</Text>
        ) : (
          <Table highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead style={{ backgroundColor: "#f8f9fa" }}>
              <Table.Tr>
                <Table.Th style={{ fontWeight: 600 }}>Day</Table.Th>
                <Table.Th style={{ fontWeight: 600 }}>Time</Table.Th>
                <Table.Th style={{ fontWeight: 600 }}>Subject</Table.Th>
                <Table.Th style={{ fontWeight: 600 }}>Faculty</Table.Th>
                <Table.Th style={{ fontWeight: 600 }}>Room</Table.Th>
                <Table.Th style={{ fontWeight: 600 }}>Batch</Table.Th>
                <Table.Th style={{ fontWeight: 600 }}>Programme</Table.Th>
                <Table.Th style={{ fontWeight: 600 }}>Sem</Table.Th>
                <Table.Th style={{ fontWeight: 600 }}>Updated</Table.Th>
                <Table.Th style={{ fontWeight: 600 }}>Action</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {items.map((item) => (
                <Table.Tr key={item.id} style={{ backgroundColor: "white" }}>
                  <Table.Td>{item.day_of_week}</Table.Td>
                  <Table.Td>
                    {item.start_time} - {item.end_time}
                  </Table.Td>
                  <Table.Td>{item.subject}</Table.Td>
                  <Table.Td>{item.faculty}</Table.Td>
                  <Table.Td>{item.room_no}</Table.Td>
                  <Table.Td>{item.batch}</Table.Td>
                  <Table.Td>{item.programme}</Table.Td>
                  <Table.Td>{item.semester}</Table.Td>
                  <Table.Td>{formatDate(item.updated_at)}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Badge color="blue" variant="light">
                        {item.department}
                      </Badge>
                      <Button
                        variant="subtle"
                        color="red"
                        size="xs"
                        leftSection={<Trash size={14} />}
                        loading={deletingId === item.id}
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>
    </Container>
  );
}
