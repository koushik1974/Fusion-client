import React, { useState } from "react";
import {
  Button,
  Container,
  NumberInput,
  Paper,
  Stack,
  Textarea,
  TextInput,
  Title,
  Group,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import { host } from "../../../routes/globalRoutes";

export default function RequestStockItem() {
  const [brief, setBrief] = useState("");
  const [stockItemName, setStockItemName] = useState("");
  const [lab, setLab] = useState("");
  const [requestDetails, setRequestDetails] = useState("");
  const [requestReceiver, setRequestReceiver] = useState("");
  const [remarks, setRemarks] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(false);
    setSuccess(false);

    const token = localStorage.getItem("authToken");

    try {
      await axios.post(
        `${host}/dep/api/stock/requests/`,
        {
          brief,
          stock_item_name: stockItemName,
          lab,
          request_details: requestDetails,
          request_receiver: requestReceiver,
          quantity,
          remarks,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      setBrief("");
      setStockItemName("");
      setLab("");
      setRequestDetails("");
      setRequestReceiver("");
      setRemarks("");
      setQuantity(1);
      setSuccess(true);
      
      // Show success notification
      notifications.show({
        title: "Success",
        message: "Stock request submitted successfully",
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
        message: error.response?.data?.detail || "Failed to submit stock request",
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
        <Title order={2} mb="lg">
          Request Stock Item
        </Title>

        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            <TextInput
              label="Brief"
              placeholder="e.g., Lab Consumables"
              value={brief}
              onChange={(event) => setBrief(event.target.value)}
              required
            />

            <TextInput
              label="Stock Item Name"
              placeholder="e.g., Printer Paper"
              value={stockItemName}
              onChange={(event) => setStockItemName(event.target.value)}
              required
            />

            <TextInput
              label="Lab/Location"
              placeholder="e.g., CC Lab"
              value={lab}
              onChange={(event) => setLab(event.target.value)}
              required
            />

            <NumberInput
              label="Quantity"
              placeholder="Minimum 1"
              min={1}
              value={quantity}
              onChange={(value) => setQuantity(Number(value) || 1)}
              required
            />

            <TextInput
              label="Request Receiver"
              placeholder="e.g., Department Admin"
              value={requestReceiver}
              onChange={(event) => setRequestReceiver(event.target.value)}
              required
            />

            <Textarea
              label="Request Details"
              placeholder="Explain why this stock is needed..."
              value={requestDetails}
              onChange={(event) => setRequestDetails(event.target.value)}
              autosize
              minRows={3}
              required
            />

            <Textarea
              label="Remarks (Optional)"
              placeholder="Any additional notes..."
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              autosize
              minRows={2}
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
      </Paper>
    </Container>
  );
}
