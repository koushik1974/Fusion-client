import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Badge,
  Container,
  Group,
  Notification,
  Paper,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { host } from "../../../routes/globalRoutes";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function StockViewList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const token = localStorage.getItem("authToken");

  const loadStockItems = async () => {
    if (!token) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.get(`${host}/dep/api/stock/requests/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      const stockItems = Array.isArray(response.data) 
        ? response.data 
        : (response.data.results || []);
      const filtered = stockItems.filter((item) => {
        const currentStatus = String(item.status || "").toUpperCase();
        const allowedStatuses = ["APPROVED", "REJECTED", "ALLOCATED", "ISSUED"];
        if (!allowedStatuses.includes(currentStatus)) return false;
        if (statusFilter === "ALL") return true;
        return currentStatus === statusFilter;
      });
      setItems(filtered);
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || "Unable to load stock list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStockItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  return (
    <Container size="xl" py="xl">
      <Paper shadow="md" radius="md" p="xl" withBorder>
        <Title order={2} mb="md" fw={300} c="blue.7" align="center">
          Stock List
        </Title>

        {errorMessage && (
          <Notification color="red" title="Error" mb="md">
            {errorMessage}
          </Notification>
        )}

        <Group mb="md" gap="sm">
          {["ALL", "APPROVED", "REJECTED", "ALLOCATED", "ISSUED"].map((status) => (
            <Badge
              key={status}
              variant={statusFilter === status ? "filled" : "light"}
              color={status === "APPROVED" ? "green" : status === "REJECTED" ? "red" : status === "ALLOCATED" ? "blue" : status === "ISSUED" ? "teal" : "gray"}
              style={{ cursor: "pointer" }}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </Badge>
          ))}
        </Group>

        {loading ? (
          <Text c="dimmed">Loading stock entries...</Text>
        ) : items.length === 0 ? (
          <Text c="dimmed">No stock entries found for the selected status.</Text>
        ) : (
          <Stack spacing="md">
            <div style={{ overflowX: "auto" }}>
              <Table highlightOnHover withTableBorder withColumnBorders>
                <Table.Thead>
                  <Table.Tr style={{ backgroundColor: "#f8f9fa" }}>
                    <Table.Th style={{ fontWeight: 600 }}>Item</Table.Th>
                    <Table.Th style={{ fontWeight: 600 }}>Lab</Table.Th>
                    <Table.Th style={{ fontWeight: 600 }}>Requester</Table.Th>
                    <Table.Th style={{ fontWeight: 600 }}>Receiver</Table.Th>
                    <Table.Th style={{ fontWeight: 600 }}>Qty</Table.Th>
                    <Table.Th style={{ fontWeight: 600 }}>Status</Table.Th>
                    <Table.Th style={{ fontWeight: 600 }}>Remarks</Table.Th>
                    <Table.Th style={{ fontWeight: 600 }}>Issued By</Table.Th>
                    <Table.Th style={{ fontWeight: 600 }}>Issued Qty</Table.Th>
                    <Table.Th style={{ fontWeight: 600 }}>Updated</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {items.map((item) => (
                    <Table.Tr key={item.id} style={{ backgroundColor: "white", transition: "background-color 0.2s ease" }}>
                      <Table.Td style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis" }}>
                        <Text size="sm" fw={500}>{item.stock_item_name}</Text>
                      </Table.Td>
                      <Table.Td>{item.lab || "-"}</Table.Td>
                      <Table.Td>{item.request_maker || "-"}</Table.Td>
                      <Table.Td>{item.request_receiver || "-"}</Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={500}>{item.quantity}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          size="sm"
                          color={
                            item.status === "APPROVED"
                              ? "green"
                              : item.status === "REJECTED"
                                ? "red"
                                : item.status === "ALLOCATED"
                                  ? "blue"
                                  : "teal"
                          }
                          variant="filled"
                        >
                          {item.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                        <Text size="xs" c="dimmed">{item.remarks || "-"}</Text>
                      </Table.Td>
                      <Table.Td>{item.issued_by || "-"}</Table.Td>
                      <Table.Td>
                        {item.issued_quantity !== null && item.issued_quantity !== undefined ? (
                          <Text size="sm" fw={500}>{item.issued_quantity}</Text>
                        ) : (
                          <Text size="sm" c="dimmed">-</Text>
                        )}
                      </Table.Td>
                      <Table.Td style={{ fontSize: "0.85rem" }}>
                        <Text size="xs" c="dimmed">{formatDate(item.issued_date || item.request_date)}</Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </div>
          </Stack>
        )}
      </Paper>
    </Container>
  );
}
