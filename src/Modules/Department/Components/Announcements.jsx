import React, { useEffect, useState, Suspense, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Grid,
  Paper,
  Flex,
  Text,
  Divider,
  Badge,
  Title,
  Box,
  ActionIcon,
  Tooltip,
  Group,
  SegmentedControl,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Trash, Check, X } from "@phosphor-icons/react";
import axios from "axios";
import { useSelector } from "react-redux";
import { host } from "../../../routes/globalRoutes";
import {
  markAnnouncementAsRead,
  dismissAnnouncementFromUI,
  isAnnouncementRead,
  shouldShowAnnouncement,
} from "./announcementUtils";

// Format date
function formatDateWithPeriod(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  const options = { year: "numeric", month: "short", day: "numeric" };
  const formattedDate = date.toLocaleDateString("en-US", options);
  return formattedDate.replace(/(\w+)\s/, "$1. ");
}

// Cache for announcements data to avoid unnecessary API calls
const announcementCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function Announcements({ branch, isAllTab }) {
  const [announcementsData, setAnnouncementsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");
  const authToken = localStorage.getItem("authToken");
  const role = useSelector((state) => state.user.role || "");
  const normalizedRole = String(role).toLowerCase();
  // Only HOD can delete announcements from database
  const canDelete = normalizedRole.startsWith("hod") || normalizedRole.includes("hod ");

  // ✅ Filter announcements by date range
  const filteredAnnouncements = useMemo(() => {
    if (dateFilter === "all") return announcementsData;

    const now = new Date();
    const daysAgo = dateFilter === "7" ? 7 : dateFilter === "30" ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    return announcementsData.filter((ann) => {
      const annDate = new Date(ann.ann_date);
      return annDate >= cutoffDate;
    });
  }, [announcementsData, dateFilter]);

  const loadAnnouncements = () => {
    // Check if data is in cache and not expired
    const cacheKey = `${branch}_${authToken}`;
    const cachedData = announcementCache.get(cacheKey);
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      console.log(`📦 Loading announcements for ${branch} from cache`);
      setAnnouncementsData(cachedData.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log(`⬇️  Fetching announcements for ${branch}...`);
    
    fetch(`${host}/dep/api/ann-data/${branch}/`, {
      method: "GET",
      headers: {
        Authorization: `Token ${authToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const formattedData =
          data?.map((announcement) => ({
            ...announcement,
            ann_date: formatDateWithPeriod(announcement.ann_date),
          })) || [];
        
        // Store in cache
        announcementCache.set(cacheKey, {
          data: formattedData,
          timestamp: Date.now(),
        });
        
        setAnnouncementsData(formattedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching announcements data:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    // Check if we need to force refresh
    const forceRefresh = localStorage.getItem("force_refresh_announcements");
    if (forceRefresh) {
      // Clear cache immediately
      const cacheKey = `${branch}_${authToken}`;
      announcementCache.delete(cacheKey);
      localStorage.removeItem("force_refresh_announcements");
      console.log("🔄 FORCE refresh - clearing cache and reloading");
    }
    
    // Also check the old flag for backward compatibility
    const lastPublished = localStorage.getItem("announcement_published");
    if (lastPublished) {
      const cacheKey = `${branch}_${authToken}`;
      announcementCache.delete(cacheKey);
      localStorage.removeItem("announcement_published");
      console.log("🔄 Cache cleared - fetching fresh announcements");
    }
    
    loadAnnouncements();
  }, [authToken, branch]);

  const handleDelete = async (announcementId) => {
    const confirmDelete = window.confirm(
      "Delete this announcement? This cannot be undone.",
    );
    if (!confirmDelete) return;

    // ✅ OPTIMISTIC UI: Remove from UI immediately
    const updatedAnnouncements = announcementsData.filter(
      (ann) => ann.id !== announcementId
    );
    setAnnouncementsData(updatedAnnouncements);

    // ✅ Show success notification
    const toastId = notifications.show({
      title: "Announcement Deleted",
      message: "The announcement has been removed.",
      color: "red",
      autoClose: 3000,
    });

    // ✅ Delete from database in background
    try {
      await axios.delete(`${host}/dep/api/announcements/${announcementId}/`, {
        headers: {
          Authorization: `Token ${authToken}`,
        },
        timeout: 120000,
      });
      console.log("✅ Announcement deleted from database");
    } catch (error) {
      console.error("Error deleting announcement:", error);
      
      // ✅ Restore the announcement if deletion failed
      setAnnouncementsData(announcementsData);
      
      const errorMsg =
        error.response?.data?.detail ||
        "You are not allowed to delete this announcement.";
      
      notifications.show({
        title: "Error",
        message: errorMsg,
        color: "red",
        autoClose: false,
      });
    }
  };

  const handleMarkAsRead = (announcementId) => {
    markAnnouncementAsRead(announcementId, role);
    setAnnouncementsData([...announcementsData]);
  };

  const handleDismiss = (announcementId) => {
    dismissAnnouncementFromUI(announcementId, role);
    setAnnouncementsData([...announcementsData]);
  };

  return (
    <Suspense fallback={<Text>Loading announcements...</Text>}>
      <Box>
        {/* Date Filter Control - Expanded Layout */}
        <Group justify="space-between" align="center" mb="xl" p="md" bg="blue.0" radius="md">
          <Group gap="md" align="center">
            <Text size="sm" fw={600} c="blue.7">Show:</Text>
            <SegmentedControl
              value={dateFilter}
              onChange={setDateFilter}
              data={[
                { label: "All", value: "all" },
                { label: "Last 7 days", value: "7" },
                { label: "Last 30 days", value: "30" },
                { label: "Last 90 days", value: "90" },
              ]}
              size="sm"
            />
          </Group>
          
          {filteredAnnouncements.length > 0 && (
            <Text size="sm" fw={500} c="blue.7">
              {filteredAnnouncements.length} announcement{filteredAnnouncements.length !== 1 ? "s" : ""}
            </Text>
          )}
        </Group>

        <Grid gutter="md">
          {" "}
          {/* Add gutter between grid items */}
          {filteredAnnouncements.filter((ann) => shouldShowAnnouncement(ann.id, role)).length > 0 ? (
            filteredAnnouncements
              .filter((ann) => shouldShowAnnouncement(ann.id, role))
              .map((announcement) => {
                const isRead = isAnnouncementRead(announcement.id, role);
                return (
                  <Grid.Col span={{ base: 12, md: 6 }} key={announcement.id}>
                    <Box mb="sm">
                    <Paper
                      shadow="sm"
                      radius="md"
                      withBorder
                      p="md"
                      style={{
                        borderLeft: `6px solid ${isRead ? "#ADB5BD" : "#228BE6"}`,
                        transition: "all 0.2s ease",
                        backgroundColor: isRead ? "#F8F9FA" : "white",
                        opacity: isRead ? 0.7 : 1,
                      }}
                    >
                      <Flex direction="column" gap="xs">
                        <Flex justify="space-between" align="flex-start">
                          <Box style={{ flex: 1 }}>
                            <Title order={5} color={isRead ? "dimmed" : "blue.7"}>
                              {`${branch} Announcement`}
                            </Title>
                            <Text size="xs" color="dimmed">
                              {announcement.ann_date}
                            </Text>
                          </Box>
                          {isRead && (
                            <Tooltip label="Marked as read" withinPortal>
                              <Check size={18} color="#51CF66" style={{ marginLeft: "8px" }} />
                            </Tooltip>
                          )}
                        </Flex>

                        <Divider mt="xs" mb="sm" />

                        <Flex gap="xs" align="flex-start">
                          <Text size="sm" fw={600} style={{ minWidth: "90px" }}>
                            Description:
                          </Text>
                          <Text size="sm" mb="sm" color={isRead ? "dimmed" : "inherit"}>
                            {announcement.message || "No details available."}
                          </Text>
                        </Flex>

                        <Flex gap="xs" align="center">
                          <Text size="sm" fw={600} style={{ minWidth: "90px" }}>
                            Batch:
                          </Text>
                          <Text size="sm" color={isRead ? "dimmed" : "inherit"}>
                            {announcement.batch || "Year 1"}
                          </Text>
                        </Flex>

                        <Flex gap="xs" align="center">
                          <Text size="sm" fw={600} style={{ minWidth: "90px" }}>
                            Department:
                          </Text>
                          <Text size="sm" color={isRead ? "dimmed" : "inherit"}>
                            {isAllTab ? (announcement.department || announcement.branch || "All") : branch}
                          </Text>
                        </Flex>

                        <Flex gap="xs" align="center">
                          <Text size="sm" fw={600} style={{ minWidth: "90px" }}>
                            Program:
                          </Text>
                          <Text size="sm" color={isRead ? "dimmed" : "inherit"}>
                            {announcement.program || "MTech"}
                          </Text>
                        </Flex>

                        <Flex justify="space-between" align="center" gap="sm" style={{ flexWrap: "wrap" }}>
                          <Badge color={isRead ? "gray" : "blue"} variant="light">
                            {announcement.maker_id || "Unknown"}
                          </Badge>

                          <Flex gap="xs">
                            {!isRead && (
                              <Tooltip label="Mark as read" withinPortal>
                                <ActionIcon
                                  variant="subtle"
                                  color="green"
                                  onClick={() => handleMarkAsRead(announcement.id)}
                                  aria-label="Mark as read"
                                >
                                  <Check size={18} />
                                </ActionIcon>
                              </Tooltip>
                            )}

                            <Tooltip label="Remove from view" withinPortal>
                              <ActionIcon
                                variant="subtle"
                                color="gray"
                                onClick={() => handleDismiss(announcement.id)}
                                aria-label="Remove from view"
                              >
                                <X size={18} />
                              </ActionIcon>
                            </Tooltip>

                            {canDelete && (
                              <Tooltip label="Delete announcement" withinPortal>
                                <ActionIcon
                                  variant="subtle"
                                  color="red"
                                  onClick={() => handleDelete(announcement.id)}
                                  aria-label="Delete announcement"
                                >
                                  <Trash size={18} />
                                </ActionIcon>
                              </Tooltip>
                            )}
                          </Flex>
                        </Flex>
                      </Flex>
                    </Paper>
                  </Box>
                </Grid.Col>
              );
            })
        ) : (
          <Grid.Col span={12}>
            <Text color="dimmed">
              No announcements available for this branch.
            </Text>
          </Grid.Col>
        )}
        </Grid>
      </Box>
    </Suspense>
  );
}

Announcements.propTypes = {
  branch: PropTypes.string.isRequired,
  isAllTab: PropTypes.bool,
};
