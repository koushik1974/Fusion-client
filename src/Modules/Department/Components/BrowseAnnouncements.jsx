import React, { useRef, useState, Suspense, lazy, memo, useEffect } from "react";
import {
  Container,
  Grid,
  Button,
  Group,
  Paper,
  Box,
  Loader,
} from "@mantine/core";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import classes from "../../Dashboard/Dashboard.module.css";

const Announcements = lazy(() => import("./Announcements"));

const tabItems = ["ALL", "CSE", "ECE", "ME", "SM"];

function BrowseAnnouncements() {
  const [activeTab, setActiveTab] = useState("0");
  const [refreshKey, setRefreshKey] = useState(0);
  const tabsListRef = useRef(null);
  
  // Listen for storage events when announcement is published
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "force_refresh_announcements" && e.newValue === "true") {
        console.log("🔄 Storage event detected - refreshing announcements");
        setRefreshKey(prev => prev + 1);
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleTabChange = (direction) => {
    const newIndex =
      direction === "next"
        ? Math.min(+activeTab + 1, tabItems.length - 1)
        : Math.max(+activeTab - 1, 0);
    setActiveTab(String(newIndex));
  };

  const renderTabContent = () => (
    <Suspense fallback={<Loader />}>
      <Paper withBorder p="lg" radius="md" shadow="sm" mt="md">
        <Announcements 
          key={refreshKey}
          branch={tabItems[+activeTab]} 
          isAllTab={tabItems[+activeTab] === "ALL"}
        />
      </Paper>
    </Suspense>
  );

  return (
    <Container size="xl" py="sm">
      <Grid>
        <Grid.Col span={12}>
          <Group
            position="apart"
            align="center"
            mb="md"
            style={{ flexWrap: "nowrap", width: "100%" }}
          >
            <Button
              onClick={() => handleTabChange("prev")}
              variant="subtle"
              p={0}
              mr="xs"
              className={classes.navArrowButton}
            >
              <CaretLeft size={24} />
            </Button>

            {/* Box that holds the tabs, filling the space */}
            <Box
              style={{
                whiteSpace: "nowrap",
                display: "inline-block",
                width: "100%", // Ensure it fills the available space
              }}
              ref={tabsListRef}
            >
              <Group spacing="sm">
                {tabItems.map((item, index) => (
                  <Button
                    key={index}
                    variant="light"
                    className={
                      activeTab === String(index)
                        ? classes.fusionActiveRecentTab
                        : classes.tabActionButton
                    }
                    color="blue"
                    onClick={() => setActiveTab(String(index))}
                    style={{ fontWeight: 400 }}
                  >
                    {item}
                  </Button>
                ))}
              </Group>
            </Box>

            <Button
              onClick={() => handleTabChange("next")}
              variant="subtle"
              p={0}
              ml="xs"
              className={classes.navArrowButton}
            >
              <CaretRight size={24} />
            </Button>
          </Group>
        </Grid.Col>
        <Grid.Col span={12}>
          <Paper withBorder p="lg" radius="md" shadow="sm" mt="sm" className={classes.tabPanelPaper}>
            {renderTabContent()}
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

export default memo(BrowseAnnouncements);