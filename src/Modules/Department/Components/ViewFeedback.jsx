/* eslint-disable no-use-before-define */
import React, { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import {
  IconThumbUp,
  IconThumbDown,
  IconMoodNeutral,
} from "@tabler/icons-react";
import {
  Container,
  Title,
  Grid,
  Card,
  Text,
  Loader,
  Notification,
  Stack,
  Progress,
  Badge,
  Group,
  Button,
} from "@mantine/core";
import { host } from "../../../routes/globalRoutes";

export default function ViewFeedback({ branch }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [progressValues, setProgressValues] = useState([]);
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await axios.get(
          `${host}/dep/api/feedback/`,
          {
            headers: {
              Authorization: `Token ${authToken}`,
            },
          },
        );

        const feedbackData = Array.isArray(response.data) 
          ? response.data 
          : (response.data.results || []);
        const filteredFeedback = feedbackData.filter(
          (item) => item.category === branch,
        );
        setData(filteredFeedback);
        setProgressValues(new Array(filteredFeedback.length).fill(0));

        setTimeout(() => {
          setProgressValues(
            filteredFeedback.map((feedback) =>
              getProgressValue(feedback.rating),
            ),
          );
        }, 100);
      } catch (error) {
          const errorResponse = error.response?.data;
        setErrorMessage(errorResponse.detail || "Error fetching feedback.");
        console.error("Error fetching feedback:", errorResponse);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [branch, authToken]);

  const getProgressValue = (rating) => {
    if (rating === "Excellent") return 100;
    if (rating === "Good") return 66;
    if (rating === "Poor") return 33;
    return 0;
  };

  if (loading) {
    return (
      <Container size="sm" py="xl" style={{ textAlign: "center" }}>
        <Loader size="xl" variant="dots" />
      </Container>
    );
  }

  return (
    <Container
      size="xl"
      py="xl"
      style={{
        background: "#f7f7f7",
        color: "#333",
        paddingTop: "40px",
      }}
    >
      {errorMessage && (
        <Notification
          color="red"
          title="Error"
          mb="md"
          style={{
            borderRadius: "12px",
            backgroundColor: "#e74c3c",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          {errorMessage}
        </Notification>
      )}

      <Grid mb="lg" justify="center">
        <Grid.Col span={12}>
          <Title
            order={1}
            align="center"
            style={{
              fontWeight: 400,
              fontSize: "32px",
              color: "#2C3E50",
              letterSpacing: "1px",
              marginBottom: "20px",
            }}
          >
            Feedback for {branch}
          </Title>
        </Grid.Col>
      </Grid>

      <Grid gutter="md" justify="center" style={{ paddingTop: "30px" }}>
        {data.map((feedback, index) => (
          <Grid.Col span={12} sm={6} md={4} key={index}>
            <Card
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              style={{
                background: "#fff",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0 15px 20px rgba(0, 0, 0, 0.15)",
                },
              }}
            >
              <Stack spacing="sm" align="center">
                <Text
                  weight={400}
                  size="md"
                  style={{
                    lineHeight: 1.5,
                    color: "#333",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "16px",
                  }}
                >
                  {feedback.remark}
                </Text>

                <Group position="apart" style={{ width: "100%" }}>
                  <Progress
                    value={progressValues[index]}
                    label={feedback.rating}
                    size="md"
                    color={
                      feedback.rating === "Excellent"
                        ? "teal"
                        : feedback.rating === "Good"
                          ? "yellow"
                          : "red"
                    }
                    style={{
                      flex: 1,
                      marginTop: "15px",
                      background: "rgba(0, 0, 0, 0.1)",
                      borderRadius: "10px",
                    }}
                  />
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {feedback.rating === "Excellent" && (
                      <IconThumbUp size={30} color="teal" />
                    )}
                    {feedback.rating === "Good" && (
                      <IconMoodNeutral size={30} color="#B8860B" />
                    )}
                    {feedback.rating === "Poor" && (
                      <IconThumbDown size={30} color="red" />
                    )}
                  </div>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      {errorMessage && (
        <Group position="center" mt="md">
          <Button
            variant="outline"
            color="blue"
            onClick={() => setLoading(true)}
          >
            Retry
          </Button>
        </Group>
      )}
    </Container>
  );
}

ViewFeedback.propTypes = {
  branch: PropTypes.string.isRequired,
};
