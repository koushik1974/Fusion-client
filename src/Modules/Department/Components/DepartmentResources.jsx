import { useEffect, useState } from "react";
import axios from "axios";
import {
  Badge,
  Divider,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Avatar,
  Center,
  Card,
  Button,
  Anchor,
  Grid,
} from "@mantine/core";
import { host } from "../../../routes/globalRoutes";
import StockViewList from "./StockViewList";
import classes from "../styles/Departmentmodule.module.css";

export default function DepartmentResources() {
  const [labs, setLabs] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [departmentLabs, setDepartmentLabs] = useState([]);
  const [hodDetails, setHodDetails] = useState(null);

  useEffect(() => {
    const loadResources = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const [labsResponse, facilitiesResponse, departmentResourcesResponse] = await Promise.all([
          axios.get(`${host}/dep/api/labs/`, {
            headers: { Authorization: `Token ${token}` },
          }),
          axios.get(`${host}/dep/api/facilities/`, {
            headers: { Authorization: `Token ${token}` },
          }),
          axios.get(`${host}/dep/api/department-resources/`, {
            headers: { Authorization: `Token ${token}` },
          }),
        ]);

        setLabs(Array.isArray(labsResponse.data) ? labsResponse.data : []);
        setFacilities(Array.isArray(facilitiesResponse.data) ? facilitiesResponse.data : []);
        setDepartmentLabs(Array.isArray(departmentResourcesResponse.data?.department_labs) ? departmentResourcesResponse.data.department_labs : []);
        setHodDetails(departmentResourcesResponse.data?.hod_details || null);
      } catch (error) {
        setErrorMessage(
          error?.response?.data?.detail || "Unable to load department resources.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, []);

  return (
    <Stack gap="lg">
      <Paper className={classes.tabPanelPaper} p="lg" radius="md" withBorder>
        <Stack gap="md">
          <div>
            <Title order={3} fw={300} c="blue.7">
              Department Resources
            </Title>
            <Text size="sm" c="dimmed" mt={4}>
              Labs and allocated facilities are loaded from the backend and kept in sync with stock approvals.
            </Text>
          </div>

          <Divider />

          {loading ? (
            <Group justify="center" py="xl">
              <Loader />
            </Group>
          ) : errorMessage ? (
            <Text c="red">{errorMessage}</Text>
          ) : (
            <Stack gap="lg">
              {/* Department-Specific Labs Section */}
              {departmentLabs && departmentLabs.length > 0 && (
                <div>
                  <Title order={4} fw={300} c="blue.7" mb="xs">
                    Department Labs
                  </Title>
                  <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                    {departmentLabs.map((lab) => (
                      <Paper key={lab.id} p="md" radius="md" withBorder>
                        <Stack gap={6}>
                          <Text fw={500}>{lab.name}</Text>
                          <Group gap="xs">
                            <Badge variant="light">{lab.day}</Badge>
                            <Badge variant="light">{lab.start_time} - {lab.end_time}</Badge>
                          </Group>
                          <Text size="sm" c="dimmed">
                            Instructor: {lab.instructor || "-"}
                          </Text>
                        </Stack>
                      </Paper>
                    ))}
                  </SimpleGrid>
                </div>
              )}

              {/* HOD Details Section */}
              {hodDetails ? (
                <div>
                  <Title order={4} fw={300} c="blue.7" mb="xs">
                    Head of Department
                  </Title>
                  <Paper p="md" radius="md" withBorder>
                    <Stack gap="md">
                      <Group justify="space-between" wrap="wrap">
                        <Group gap="md">
                          <Avatar size={60} radius={120} />
                          <Stack gap={4}>
                            <Text fw={600} size="lg">
                              {hodDetails.name}
                            </Text>
                            <Text size="sm" c="dimmed">
                              {hodDetails.designation}
                            </Text>
                            <Text size="sm" c="dimmed">
                              Department: {hodDetails.department}
                            </Text>
                          </Stack>
                        </Group>
                      </Group>
                      <Divider my="xs" />
                      <Stack gap="xs">
                        {hodDetails.email && (
                          <Group gap="xs">
                            <Text size="sm" fw={500} w={80}>
                              Email:
                            </Text>
                            <Anchor href={`mailto:${hodDetails.email}`} size="sm">
                              {hodDetails.email}
                            </Anchor>
                          </Group>
                        )}
                        {hodDetails.phone && (
                          <Group gap="xs">
                            <Text size="sm" fw={500} w={80}>
                              Phone:
                            </Text>
                            <Anchor href={`tel:${hodDetails.phone}`} size="sm">
                              {hodDetails.phone}
                            </Anchor>
                          </Group>
                        )}
                        {hodDetails.username && (
                          <Group gap="xs">
                            <Text size="sm" fw={500} w={80}>
                              Username:
                            </Text>
                            <Text size="sm">{hodDetails.username}</Text>
                          </Group>
                        )}
                      </Stack>
                    </Stack>
                  </Paper>
                </div>
              ) : (
                <div>
                  <Title order={4} fw={300} c="blue.7" mb="xs">
                    Head of Department
                  </Title>
                  <Paper p="md" radius="md" withBorder>
                    <Text c="dimmed">No Data</Text>
                  </Paper>
                </div>
              )}

              <div>
                <Title order={4} fw={300} c="blue.7" mb="xs">
                  Labs
                </Title>
                {labs.length === 0 ? (
                  <Center py="lg">
                    <Text c="dimmed" size="md">
                      No lab records available.
                    </Text>
                  </Center>
                ) : (
                  <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                    {labs.map((lab) => (
                      <Card key={lab.id} shadow="md" padding="md" radius="md" withBorder>
                        <Stack gap="sm">
                          <Group justify="space-between">
                            <Text fw={600} size="md">
                              {lab.name}
                            </Text>
                            <Badge size="sm" variant="light" color="blue">
                              Lab
                            </Badge>
                          </Group>
                          <Divider my="xs" />
                          {(lab.day || lab.start_time) && (
                            <Group gap="xs">
                              {lab.day && <Badge variant="outline" size="sm">{lab.day}</Badge>}
                              {lab.start_time && (
                                <Badge variant="outline" size="sm">
                                  {lab.start_time} - {lab.end_time}
                                </Badge>
                              )}
                            </Group>
                          )}
                          {lab.instructor && (
                            <Text size="sm" c="dimmed">
                              <strong>Instructor:</strong> {lab.instructor}
                            </Text>
                          )}
                          {lab.capacity && (
                            <Text size="sm" c="dimmed">
                              <strong>Capacity:</strong> {lab.capacity}
                            </Text>
                          )}
                        </Stack>
                      </Card>
                    ))}
                  </SimpleGrid>
                )}
              </div>

              <div>
                <Title order={4} fw={300} c="blue.7" mb="xs">
                  Facilities
                </Title>
                {facilities.length === 0 ? (
                  <Center py="lg">
                    <Text c="dimmed" size="md">
                      No facility records available yet.
                    </Text>
                  </Center>
                ) : (
                  <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                    {facilities.map((facility) => (
                      <Card key={facility.id} shadow="md" padding="md" radius="md" withBorder>
                        <Stack gap="sm">
                          <Group justify="space-between">
                            <Text fw={600} size="md">
                              {facility.name}
                            </Text>
                            <Badge size="sm" variant="light" color="pink">
                              Facility
                            </Badge>
                          </Group>
                          <Divider my="xs" />
                          {facility.branch && (
                            <Badge variant="outline" size="sm">
                              {facility.branch}
                            </Badge>
                          )}
                          {facility.location && (
                            <Text size="sm" c="dimmed">
                              <strong>Location:</strong> {facility.location}
                            </Text>
                          )}
                          {facility.amount && (
                            <Text size="sm" c="dimmed">
                              <strong>Amount:</strong> {facility.amount}
                            </Text>
                          )}
                          {facility.lab && (
                            <Text size="sm" c="dimmed">
                              <strong>Lab:</strong> {facility.lab}
                            </Text>
                          )}
                        </Stack>
                      </Card>
                    ))}
                  </SimpleGrid>
                )}
              </div>
            </Stack>
          )}
        </Stack>
      </Paper>

      <Paper className={classes.tabPanelPaper} p="lg" radius="md" withBorder>
        <StockViewList />
      </Paper>
    </Stack>
  );
}
