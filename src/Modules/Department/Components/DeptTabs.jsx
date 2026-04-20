import React, { useState, Suspense, lazy } from "react";
import { Button, Flex, Tabs, Text, Title, Box, Paper } from "@mantine/core";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import dashboardClasses from "../../Dashboard/Dashboard.module.css";

// Lazy load components
const AboutUs = lazy(() => import("./AboutUs"));
const Faculty = lazy(() => import("./Faculty"));
const Studentcat = lazy(() => import("./Studentcat"));
const Announcements = lazy(() => import("./Announcements"));
const Alumnicat = lazy(() => import("./Alumnicat"));

function DeptTabs({ branch }) {
  const [activeTab, setActiveTab] = useState("0");

  const role = useSelector((state) => state.user.role);

  const tabItems = [
    { title: "About Us" },
    { title: "Announcements", id: "4", department: branch },
    { title: "Faculty", id: "2" },
    { title: "Students", id: "3", department: branch },
    { title: "Alumni" },
  ];

  const handleTabChange = (direction) => {
    const newIndex =
      direction === "next"
        ? Math.min(+activeTab + 1, tabItems.length - 1)
        : Math.max(+activeTab - 1, 0);
    setActiveTab(String(newIndex));
  };

  const renderTabContent = () => {
    const components = {
      "0": <AboutUs branch={branch} />,
      "1": <Announcements branch={branch} />,
      "2": <Faculty branch={branch} />,
      "3": <Studentcat branch={branch} />,
      "4": <Alumnicat branch={branch} />,
    };
    return components[activeTab] || null;
  };

  return (
    <Box px="md" py="md">
      <Title order={2} mb="xl" fw={300} c="blue.7" align="center">
        Welcome to {branch} Department
      </Title>

      <Flex align="center" justify="center" gap="xs" mb="lg">
        <Button
          onClick={() => handleTabChange("prev")}
          variant="light"
          size="sm"
          color="blue"
        >
          <CaretLeft size={20} />
        </Button>

        <Box
          style={{
            display: "flex",
            flexWrap: "nowrap",
            overflowX: "auto",
            overflowY: "hidden",
            scrollBehavior: "smooth",
            gap: "8px",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={setActiveTab}
            color="blue"
            radius="lg"
            keepMounted={false}
            style={{ whiteSpace: "nowrap" }}
          >
            <Tabs.List
              className={dashboardClasses.tabsList}
              style={{ flexWrap: "nowrap", gap: "8px", padding: "0 4px" }}
            >
              {tabItems.map((item, index) => (
                <Tabs.Tab
                  value={String(index)}
                  key={index}
                  className={
                    activeTab === String(index)
                      ? dashboardClasses.fusionActiveRecentTab
                      : ""
                  }
                  style={{ marginRight: 8, fontWeight: 400 }}
                >
                  {item.title}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>
        </Box>

        <Button
          onClick={() => handleTabChange("next")}
          variant="light"
          size="sm"
          color="blue"
        >
          <CaretRight size={20} />
        </Button>
      </Flex>

      <Paper withBorder shadow="sm" radius="md" p="md" w="100%" mt="xs">
        <Suspense fallback={<Text c="dimmed">Loading content...</Text>}>
          {renderTabContent()}
        </Suspense>
      </Paper>
    </Box>
  );
}

DeptTabs.propTypes = {
  branch: PropTypes.string.isRequired,
};

export default DeptTabs;
