/* eslint-disable no-return-assign */
import React, { lazy, Suspense, useRef, useState, useEffect } from "react";
import {
  Container,
  Grid,
  Menu,
  Button,
  Group,
  Box,
  Tabs,
  Loader,
  Text,
  Paper,
  Badge,
} from "@mantine/core";
import {
  CaretDown,
  CaretUp,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import { useSelector } from "react-redux";
import axios from "axios";
import { host } from "../../../routes/globalRoutes";
import CustomBreadcrumbs from "../../../components/Breadcrumbs.jsx";
import dashboardClasses from "../../Dashboard/Dashboard.module.css";
import classes from "../styles/Departmentmodule.module.css";

// Lazy load components
const MakeAnnouncement = lazy(() => import("./MakeAnnouncement"));
const BrowseAnnouncements = lazy(() => import("./BrowseAnnouncements"));
const FeedbackForm = lazy(() => import("./FeedbackForm"));
const RequestStockItem = lazy(() => import("./RequestStockItem"));
const ApproveRejectStockRequest = lazy(() => import("./ApproveRejectStockRequest"));
const AllocateIssueStockRequest = lazy(() => import("./AllocateIssueStockRequest"));
const StockViewList = lazy(() => import("./StockViewList"));
const TimetableCreate = lazy(() => import("./TimetableCreate"));
const TimetableView = lazy(() => import("./TimetableView"));
const ProfileDepartmentEditor = lazy(() => import("./ProfileDepartmentEditor"));
const DepartmentProfileChangeReview = lazy(() => import("./DepartmentProfileChangeReview"));
const DepartmentResources = lazy(() => import("./DepartmentResources"));
const DeptTabs = lazy(() => import("./DeptTabs"));

const departments = [
  { title: "CSE Department", id: "3", code: "CSE" },
  { title: "ECE Department", id: "4", code: "ECE" },
  { title: "ME Department", id: "5", code: "ME" },
  { title: "SM Department", id: "6", code: "SM" },
  { title: "Design Department", id: "7", code: "DS" },
  { title: "Liberal Arts Department", id: "8", code: "LA" },
  { title: "NaturalScience", id: "9", code: "NS" },
];

export default function LandingPage() {
  const selectedRole = useSelector((state) => state.user.role);
  const [serverRole, setServerRole] = useState(null);
  const [serverRoleTokens, setServerRoleTokens] = useState([]);
  const [branch, setBranch] = useState(null);
  const [activeTab, setActiveTab] = useState("1"); // Default active tab
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [actionTabStart, setActionTabStart] = useState(0);
  const [error, setError] = useState(null);
  const tabsListRef = useRef(null);
  
  // SIMPLIFIED ROLE DETECTION - Check Redux role FIRST
  const reduxRoleNorm = (selectedRole || "").toLowerCase().trim();
  
  // Log the raw role for debugging
  console.log("🔍 RAW selectedRole:", selectedRole, "| Normalized:", reduxRoleNorm);
  
  // Primary role detection from Redux
  const isStudent = reduxRoleNorm.includes("student");
  const isDeptAdmin = reduxRoleNorm === "deptadmin" || 
                      reduxRoleNorm === "dept_admin" ||
                      reduxRoleNorm === "department admin" ||
                      reduxRoleNorm === "dept admin";
  // HOD detection - more flexible
  const isHOD = reduxRoleNorm === "hod" || 
                reduxRoleNorm.includes("head of department") ||
                reduxRoleNorm.includes("headofdepartment") ||
                (reduxRoleNorm.includes("head") && reduxRoleNorm.includes("dept")) ||
                reduxRoleNorm.startsWith("hod") ||
                reduxRoleNorm.includes("hod");
  const isAssistantProfessor = reduxRoleNorm.includes("assistant professor") ||
                               reduxRoleNorm.includes("faculty") ||
                               (reduxRoleNorm.includes("professor") && !isHOD && !reduxRoleNorm.includes("head"));
  
  // Fallback to API tokens if Redux role not recognized
  const effectiveRole = serverRole || selectedRole;
  const canRequestStock = isAssistantProfessor;
  const canReviewProfileChanges = isHOD || isDeptAdmin;
  const canMakeAnnouncement = isHOD || isAssistantProfessor;
  
  // Define tabs per role (check more specific roles first)
  let baseActionTabs = [];
  if (isDeptAdmin && !isHOD) {
    // Dept Admin: make announcements, browse announcements, allocate/reject stock, stock list,
    // resolve feedback, create timetable, view timetable, profile edit, resources
    baseActionTabs = [
      "0",                // Make Announcement
      "1",                // Browse Announcements
      "stock-issue",      // Allocate or Reject Stock
      "stock-view",       // Stock List
      "feedback-resolve", // Resolve Feedback
      "timetable-create", // Manage Timetable
      "timetable-view",   // View Timetable
      "profile-edit",     // Profile & Department Details
      "resources",        // Resources
    ];
  } else if (isHOD) {
    // HOD: make announcements, browse announcements, approve/reject stock, stock list,
    // resolve feedback, profile edit, approve profile changes, resources
    baseActionTabs = [
      "0",                     // Make Announcement
      "1",                     // Browse Announcements
      "stock-decision",        // Approve or Reject Stock Request
      "stock-view",            // Stock List
      "feedback-resolve",      // Resolve Feedback
      "profile-edit",          // User Profile & Department Details
      "profile-change-review", // Approve Official Department Changes
      "resources",             // Resources
    ];
  } else if (isAssistantProfessor) {
    // Faculty: make announcements, browse announcements, resources, request stock, stock list
    baseActionTabs = [
      "0",             // Make Announcement
      "1",             // Browse Announcements
      "resources",     // Resources
      "stock-request", // Request Stock Item
      "stock-view",    // Stock List
    ];
  } else if (isStudent) {
    // Student: browse announcements, student feedback, resources only
    baseActionTabs = [
      "1",                // Browse Announcements
      "feedback-student", // Student Feedback
      "resources",        // Resources
    ];
  } else {
    // Fallback: minimal tabs (browse announcements, feedback, resources)
    // This should rarely happen with proper role detection
    baseActionTabs = [
      "1",                // Browse Announcements
      "feedback-student", // Submit Feedback
      "resources",        // Resources
    ];
  }
  
  const actionTabs = baseActionTabs;
  const visibleActionTabs = actionTabs;
  
  // Debug logs - more visible
  useEffect(() => {
    console.log("=== DEPARTMENT ROLE DEBUG ===");
    console.log("selectedRole (Redux):", selectedRole);
    console.log("reduxRoleNorm:", reduxRoleNorm);
    console.log("effectiveRole:", effectiveRole);
    console.log("---ROLE FLAGS---");
    console.log("isStudent:", isStudent);
    console.log("isAssistantProfessor:", isAssistantProfessor);
    console.log("isDeptAdmin:", isDeptAdmin);
    console.log("isHOD:", isHOD);
    console.log("---ACTIVE TABS---");
    console.log("baseActionTabs:", baseActionTabs);
    console.log("activeTab:", activeTab);
    console.log("=============================");
  }, [selectedRole, isStudent, isAssistantProfessor, isDeptAdmin, isHOD]);

  // Set initial tab when role data is loaded
  useEffect(() => {
    if (serverRoleTokens && serverRoleTokens.length > 0 && activeTab === "1") {
      // If we're still on default "1", set to first role-appropriate tab
      if (baseActionTabs.length > 0 && !baseActionTabs.includes("1")) {
        setActiveTab(baseActionTabs[0]);
      }
    }
  }, [serverRoleTokens]);
  
  const feedbackTab = isStudent ? "feedback-student" : "feedback-resolve";
  const feedbackLabel = isStudent ? "Student Feedback" : "Resolve Feedback";

  const normalizeDepartmentCode = (departmentName) => {
    if (!departmentName) return null;
    const name = String(departmentName).trim().toUpperCase();
    if (name === "DESIGN") return "DS";
    if (name === "LIBERAL ARTS") return "LA";
    if (name === "NATURAL SCIENCE") return "NS";
    return name;
  };

  useEffect(() => {
    const fetchUserDepartment = async () => {
      const token = localStorage.getItem("authToken");
      const headers = {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      };

      const parseDepartmentContext = (data) => {
        const designation =
          data?.current?.[0]?.designation?.name ||
          data?.designation?.[0]?.designation?.name ||
          data?.profile?.user_type ||
          null;
        const currentDesignationTokens = Array.isArray(data?.current)
          ? data.current
              .map((item) => item?.designation?.name || item?.designation?.full_name)
              .filter(Boolean)
          : [];
        const designationTokens = Array.isArray(data?.designation)
          ? data.designation
              .map((item) => item?.designation?.name || item?.designation?.full_name || item)
              .filter(Boolean)
          : [];
        const roleTokens = [
          ...currentDesignationTokens,
          ...designationTokens,
          data?.profile?.user_type,
        ].filter(Boolean);
        const department = normalizeDepartmentCode(data?.profile?.department?.name);
        return { designation, roleTokens, department };
      };

      const applyDepartmentContext = (designation, roleTokens, department) => {
        const resolvedRole = designation || null;
        const resolvedDepartment = department || "CSE";
        setServerRole(resolvedRole);
        setServerRoleTokens(Array.isArray(roleTokens) ? roleTokens : []);
        setBranch(resolvedDepartment);
        const deptTab = departments.find((d) => d.code === resolvedDepartment)?.id;
        // Don't automatically set department tab, let role-based logic set the first tab
        // setActiveTab(deptTab || "3");
        setActionTabStart(0);
        setError(null);
      };

      try {
        const profileResponse = await axios.get(`${host}/api/profile/`, { headers });
        const { designation, roleTokens, department } = parseDepartmentContext(profileResponse.data);
        applyDepartmentContext(designation, roleTokens, department);
      } catch (err) {
        try {
          const eisResponse = await axios.get(`${host}/eis/api/profile/`, { headers });
          const { designation, roleTokens, department } = parseDepartmentContext(eisResponse.data);
          applyDepartmentContext(designation, roleTokens, department);
        } catch (eisErr) {
          try {
            const dashboardResponse = await axios.get(`${host}/api/dashboard/`, {
              headers,
            });
            const designation =
              dashboardResponse.data?.designation_info?.[0] ||
              dashboardResponse.data?.desgination_info?.[0] ||
              null;
            const roleTokens =
              dashboardResponse.data?.designation_info ||
              dashboardResponse.data?.desgination_info ||
              [];
            applyDepartmentContext(designation, roleTokens, "CSE");
          } catch (dashboardErr) {
            console.error("Error fetching user department:", dashboardErr);
            setError("Failed to fetch department data");
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUserDepartment();
  }, [selectedRole]);

  const handleTabChange = (direction) => {
    const currentIndex = actionTabs.indexOf(activeTab);
    let nextTabIndex;
    
    if (direction === "next") {
      nextTabIndex = Math.min(currentIndex + 1, actionTabs.length - 1);
    } else {
      nextTabIndex = Math.max(currentIndex - 1, 0);
    }
    
    if (nextTabIndex >= 0 && nextTabIndex < actionTabs.length) {
      const nextTab = actionTabs[nextTabIndex];
      setActiveTab(nextTab);
      
      // Scroll the tab into view if needed
      setTimeout(() => {
        if (tabsListRef.current) {
          const activeTabElement = tabsListRef.current.querySelector('[data-active="true"]');
          if (activeTabElement) {
            activeTabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
        }
      }, 0);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      handleTabChange("next");
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      handleTabChange("prev");
    }
  };

  const handleWheel = (e) => {
    if (tabsListRef.current) {
      e.preventDefault();
      tabsListRef.current.scrollLeft += e.deltaY > 0 ? 100 : -100;
    }
  };

  const renderTabContent = () => (
    <Suspense fallback={<Loader />}>
      {activeTab === "0" && (
        <MakeAnnouncement />
      )}
      {activeTab === "1" && <BrowseAnnouncements />}
      {activeTab === "feedback-student" && <FeedbackForm branch={branch} mode="student" />}
      {activeTab === "feedback-resolve" && <FeedbackForm branch={branch} mode="resolve" />}
      {activeTab === "stock-view" && <StockViewList />}
      {activeTab === "stock-request" && <RequestStockItem />}
      {activeTab === "stock-decision" && <ApproveRejectStockRequest isHOD={isHOD} role={effectiveRole} branch={branch} />}
      {activeTab === "stock-issue" && <AllocateIssueStockRequest />}
      {activeTab === "timetable-create" && <TimetableCreate branch={branch} />}
      {activeTab === "timetable-view" && <TimetableView branch={branch} />}
      {activeTab === "profile-edit" && (
        <ProfileDepartmentEditor role={effectiveRole} branch={branch} />
      )}
      {activeTab === "profile-change-review" && (
        <DepartmentProfileChangeReview />
      )}
      {activeTab === "resources" && <DepartmentResources />}
      {departments.map((dept) =>
        activeTab === dept.id ? (
          <DeptTabs key={dept.id} branch={dept.code} initialTab="about" />
        ) : null,
      )}
    </Suspense>
  );

  if (loading) return <Loader />;
  if (error)
    return (
      <Paper className={classes.errorPanel} p="md" radius="md" withBorder>
        <Text fw={400}>{error}</Text>
      </Paper>
    );

  const currentDept = departments.find((d) => d.code === branch) || 
                      departments.find((d) => d.id === activeTab);
  const goToAboutSection = () => {
    const deptTab = departments.find((d) => d.code === branch)?.id;
    setActiveTab(deptTab || "3");
  };

  // Generate dynamic breadcrumbs based on active tab
  const getTabTitle = () => {
    const tabTitleMap = {
      "0": "Make Announcement",
      "1": "Browse Announcements",
      "feedback-student": "Submit Feedback",
      "feedback-resolve": "Resolve Feedback",
      "stock-view": "View Stock Requests",
      "stock-request": "Request Stock",
      "stock-decision": "Approve/Reject Stock",
      "stock-issue": "Allocate or Reject Stock",
      "timetable-create": "Create Timetable",
      "timetable-view": "View Timetable",
      "profile-edit": "Edit Profile",
      "profile-change-review": "Review Profile Changes",
      "resources": "Department Resources",
    };
    
    if (tabTitleMap[activeTab]) {
      return tabTitleMap[activeTab];
    }
    
    const dept = departments.find((d) => d.id === activeTab);
    if (dept) {
      return dept.title;
    }
    
    return "Department";
  };

  // Get role badge info for display
  const getRoleBadgeInfo = () => {
    if (isHOD) return { label: "Head of Department", color: "red", warning: false };
    if (isDeptAdmin) return { label: "Department Admin", color: "blue", warning: false };
    if (isAssistantProfessor) return { label: "Faculty", color: "cyan", warning: false };
    if (isStudent) return { label: "Student", color: "grape", warning: false };
    return { label: "Guest - Limited Access", color: "gray", warning: true };
  };

  const breadcrumbItems = [
    <Text key="home" className={dashboardClasses.fusionText} fw={400}>
      Home
    </Text>,
    <Text key="department" className={dashboardClasses.fusionText} fw={400}>
      Department
    </Text>,
    <Text key="section" className={dashboardClasses.fusionText} fw={600}>
      {getTabTitle()}
    </Text>,
  ];

  return (
    <Container fluid className={`${classes.pageContainer} ${classes.dashboardFont}`}>
      <Box mb="lg">
        <Group justify="space-between" align="center">
          <CustomBreadcrumbs breadCrumbs={breadcrumbItems} />
          <Badge 
            size="lg" 
            color={getRoleBadgeInfo().color}
            variant={getRoleBadgeInfo().warning ? "outline" : "filled"}
            title={`Current Role: ${effectiveRole || 'Not Detected'}${getRoleBadgeInfo().warning ? ' - Please contact admin if this is incorrect' : ''}`}
          >
            {getRoleBadgeInfo().label}
            {getRoleBadgeInfo().warning && " ⚠️"}
          </Badge>
        </Group>
      </Box>

      <Grid>
        <Grid.Col span={12}>
          <Box
            mb="xl"
            mt="lg"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              gap: "24px",
              flexWrap: "nowrap",
            }}
          >
            <Group spacing="sm" style={{ marginLeft: 0, flexWrap: "nowrap", minWidth: 0, flex: 1 }}>
              <Button
                onClick={goToAboutSection}
                variant="light"
                size="sm"
                className={
                  currentDept && activeTab === currentDept.id
                    ? dashboardClasses.fusionActiveRecentTab
                    : classes.tabActionButton
                }
                style={{ fontWeight: 400 }}
              >
                About
              </Button>

              <Button
                onClick={() => handleTabChange("prev")}
                variant="subtle"
                p={0}
                mr="xs"
                className={classes.navArrowButton}
              >
                <CaretLeft size={24} />
              </Button>

              <Box
                className={classes.departmentTabsScrollArea}
                ref={tabsListRef}
                onKeyDown={handleKeyDown}
                onWheel={handleWheel}
                tabIndex={0}
                style={{ outline: "none", flex: 1, overflowX: "auto", overflowY: "hidden", scrollBehavior: "smooth" }}
              >
                <Tabs value={activeTab} onChange={setActiveTab}>
                  <Tabs.List
                    className={`${dashboardClasses.tabsList} ${classes.departmentTabsList}`}
                    style={{ 
                      flexWrap: "nowrap", 
                      gap: "8px", 
                      padding: "0 4px",
                      borderBottomColor: "transparent"
                    }}
                  >
                    {/* ANNOUNCEMENTS GROUP */}
                    {visibleActionTabs.includes("0") && (
                      <Tabs.Tab
                        value="0"
                        className={
                          activeTab === "0"
                            ? dashboardClasses.fusionActiveRecentTab
                            : ""
                        }
                        style={{ 
                          fontWeight: 400, 
                          fontSize: "0.95rem", 
                          marginRight: 8,
                          borderBottomColor: activeTab === "0" ? "#1971c2" : "transparent",
                          borderBottomWidth: "3px",
                          borderBottomStyle: "solid"
                        }}
                        data-active={activeTab === "0"}
                      >
                        Make Announcement
                      </Tabs.Tab>
                    )}
                    {visibleActionTabs.includes("1") && (
                      <Tabs.Tab
                        value="1"
                        className={
                          activeTab === "1"
                            ? dashboardClasses.fusionActiveRecentTab
                            : ""
                        }
                        style={{ 
                          fontWeight: 400, 
                          fontSize: "0.95rem", 
                          marginRight: 8,
                          borderBottomColor: activeTab === "1" ? "#1971c2" : "transparent",
                          borderBottomWidth: "3px",
                          borderBottomStyle: "solid"
                        }}
                        data-active={activeTab === "1"}
                      >
                        Browse Announcements
                      </Tabs.Tab>
                    )}
                    
                    {/* DIVIDER */}
                    {(visibleActionTabs.includes("0") || visibleActionTabs.includes("1")) && 
                     (visibleActionTabs.includes("feedback-student") || visibleActionTabs.includes("feedback-resolve") || visibleActionTabs.includes("stock-view")) && (
                      <Box style={{ width: 1, height: 24, background: "#ddd", margin: "0 4px" }} />
                    )}

                    {/* FEEDBACK GROUP */}
                    {visibleActionTabs.includes("feedback-student") && (
                      <Tabs.Tab
                        value="feedback-student"
                        className={
                          activeTab === "feedback-student"
                            ? dashboardClasses.fusionActiveRecentTab
                            : ""
                        }
                        style={{ 
                          fontWeight: 400, 
                          fontSize: "0.95rem", 
                          marginRight: 8,
                          borderBottomColor: activeTab === "feedback-student" ? "#1971c2" : "transparent",
                          borderBottomWidth: "3px",
                          borderBottomStyle: "solid"
                        }}
                        data-active={activeTab === "feedback-student"}
                      >
                        {feedbackLabel}
                      </Tabs.Tab>
                    )}
                    {visibleActionTabs.includes("feedback-resolve") && (
                      <Tabs.Tab
                        value="feedback-resolve"
                        className={
                          activeTab === "feedback-resolve"
                            ? dashboardClasses.fusionActiveRecentTab
                            : ""
                        }
                        style={{ 
                          fontWeight: 400, 
                          fontSize: "0.95rem", 
                          marginRight: 8,
                          borderBottomColor: activeTab === "feedback-resolve" ? "#1971c2" : "transparent",
                          borderBottomWidth: "3px",
                          borderBottomStyle: "solid"
                        }}
                        data-active={activeTab === "feedback-resolve"}
                      >
                        {feedbackLabel}
                      </Tabs.Tab>
                    )}

                    {/* DIVIDER */}
                    {(visibleActionTabs.includes("feedback-student") || visibleActionTabs.includes("feedback-resolve")) && 
                     visibleActionTabs.includes("stock-view") && (
                      <Box style={{ width: 1, height: 24, background: "#ddd", margin: "0 4px" }} />
                    )}

                    {/* STOCK GROUP */}
                    {visibleActionTabs.includes("stock-view") && (
                      <Tabs.Tab
                        value="stock-view"
                        className={
                          activeTab === "stock-view"
                            ? dashboardClasses.fusionActiveRecentTab
                            : ""
                        }
                        style={{ 
                          fontWeight: 400, 
                          fontSize: "0.95rem", 
                          marginRight: 8,
                          borderBottomColor: activeTab === "stock-view" ? "#1971c2" : "transparent",
                          borderBottomWidth: "3px",
                          borderBottomStyle: "solid"
                        }}
                        data-active={activeTab === "stock-view"}
                      >
                        Stock List
                      </Tabs.Tab>
                    )}
                    {visibleActionTabs.includes("stock-request") && (
                      <Tabs.Tab
                        value="stock-request"
                        className={
                          activeTab === "stock-request"
                            ? dashboardClasses.fusionActiveRecentTab
                            : ""
                        }
                        style={{ 
                          fontWeight: 400, 
                          fontSize: "0.95rem", 
                          marginRight: 8,
                          borderBottomColor: activeTab === "stock-request" ? "#1971c2" : "transparent",
                          borderBottomWidth: "3px",
                          borderBottomStyle: "solid"
                        }}
                        data-active={activeTab === "stock-request"}
                      >
                        Request Stock Item
                      </Tabs.Tab>
                    )}
                    
                    {/* DIVIDER BEFORE STOCK-DECISION */}
                    {(visibleActionTabs.includes("stock-request") || visibleActionTabs.includes("stock-view")) && visibleActionTabs.includes("stock-decision") && (
                      <Box style={{ width: 1, height: 24, background: "#ddd", margin: "0 4px" }} />
                    )}
                    
                    {visibleActionTabs.includes("stock-decision") && (
                      <Tabs.Tab
                        value="stock-decision"
                        className={
                          activeTab === "stock-decision"
                            ? dashboardClasses.fusionActiveRecentTab
                            : ""
                        }
                        style={{ 
                          fontWeight: 400, 
                          fontSize: "0.95rem", 
                          marginRight: 8,
                          borderBottomColor: activeTab === "stock-decision" ? "#1971c2" : "transparent",
                          borderBottomWidth: "3px",
                          borderBottomStyle: "solid"
                        }}
                        data-active={activeTab === "stock-decision"}
                      >
                        Approve or Reject Stock Request
                      </Tabs.Tab>
                    )}
                    {visibleActionTabs.includes("stock-issue") && (
                      <Tabs.Tab
                        value="stock-issue"
                        className={
                          activeTab === "stock-issue"
                            ? dashboardClasses.fusionActiveRecentTab
                            : ""
                        }
                        style={{ 
                          fontWeight: 400, 
                          fontSize: "0.95rem", 
                          marginRight: 8,
                          borderBottomColor: activeTab === "stock-issue" ? "#1971c2" : "transparent",
                          borderBottomWidth: "3px",
                          borderBottomStyle: "solid"
                        }}
                        data-active={activeTab === "stock-issue"}
                      >
                        Allocate or Reject Stock Request
                      </Tabs.Tab>
                    )}

                    {/* DIVIDER */}
                    {visibleActionTabs.includes("stock-issue") && visibleActionTabs.includes("timetable-create") && (
                      <Box style={{ width: 1, height: 24, background: "#ddd", margin: "0 4px" }} />
                    )}
                    {visibleActionTabs.includes("timetable-create") && (
                      <Tabs.Tab
                        value="timetable-create"
                        className={
                          activeTab === "timetable-create"
                            ? dashboardClasses.fusionActiveRecentTab
                            : ""
                        }
                        style={{ 
                          fontWeight: 400, 
                          fontSize: "0.95rem", 
                          marginRight: 8,
                          borderBottomColor: activeTab === "timetable-create" ? "#1971c2" : "transparent",
                          borderBottomWidth: "3px",
                          borderBottomStyle: "solid"
                        }}
                        data-active={activeTab === "timetable-create"}
                      >
                        Create Timetable
                      </Tabs.Tab>
                    )}
                    {visibleActionTabs.includes("timetable-view") && (
                      <Tabs.Tab
                        value="timetable-view"
                        className={
                          activeTab === "timetable-view"
                            ? dashboardClasses.fusionActiveRecentTab
                            : ""
                        }
                        style={{ 
                          fontWeight: 400, 
                          fontSize: "0.95rem", 
                          marginRight: 8,
                          borderBottomColor: activeTab === "timetable-view" ? "#1971c2" : "transparent",
                          borderBottomWidth: "3px",
                          borderBottomStyle: "solid"
                        }}
                        data-active={activeTab === "timetable-view"}
                      >
                        View Timetable
                      </Tabs.Tab>
                    )}

                    {/* DIVIDER */}
                    {visibleActionTabs.includes("timetable-view") && visibleActionTabs.includes("profile-edit") && (
                      <Box style={{ width: 1, height: 24, background: "#ddd", margin: "0 4px" }} />
                    )}

                    {/* PROFILE GROUP */}
                    {visibleActionTabs.includes("profile-edit") && (
                      <Tabs.Tab
                        value="profile-edit"
                        className={
                          activeTab === "profile-edit"
                            ? dashboardClasses.fusionActiveRecentTab
                            : ""
                        }
                        style={{ 
                          fontWeight: 400, 
                          fontSize: "0.95rem", 
                          marginRight: 8,
                          borderBottomColor: activeTab === "profile-edit" ? "#1971c2" : "transparent",
                          borderBottomWidth: "3px",
                          borderBottomStyle: "solid"
                        }}
                        data-active={activeTab === "profile-edit"}
                      >
                        Profile & Department Details
                      </Tabs.Tab>
                    )}
                    {visibleActionTabs.includes("profile-change-review") && (
                      <Tabs.Tab
                        value="profile-change-review"
                        className={
                          activeTab === "profile-change-review"
                            ? dashboardClasses.fusionActiveRecentTab
                            : ""
                        }
                        style={{ 
                          fontWeight: 400, 
                          fontSize: "0.95rem", 
                          marginRight: 8,
                          borderBottomColor: activeTab === "profile-change-review" ? "#1971c2" : "transparent",
                          borderBottomWidth: "3px",
                          borderBottomStyle: "solid"
                        }}
                        data-active={activeTab === "profile-change-review"}
                      >
                        Approve or Reject Profile Changes
                      </Tabs.Tab>
                    )}

                    {/* DIVIDER */}
                    {(visibleActionTabs.includes("profile-edit") || visibleActionTabs.includes("profile-change-review")) && visibleActionTabs.includes("resources") && (
                      <Box style={{ width: 1, height: 24, background: "#ddd", margin: "0 4px" }} />
                    )}
                    {visibleActionTabs.includes("resources") && (
                      <Tabs.Tab
                        value="resources"
                        className={
                          activeTab === "resources"
                            ? dashboardClasses.fusionActiveRecentTab
                            : ""
                        }
                        style={{ 
                          fontWeight: 400, 
                          fontSize: "0.95rem", 
                          marginRight: 8,
                          borderBottomColor: activeTab === "resources" ? "#1971c2" : "transparent",
                          borderBottomWidth: "3px",
                          borderBottomStyle: "solid"
                        }}
                        data-active={activeTab === "resources"}
                      >
                        Resources
                      </Tabs.Tab>
                    )}
                  </Tabs.List>
                </Tabs>
              </Box>

              <Group spacing={0} style={{ flexShrink: 0 }}>
                <Button
                  onClick={() => handleTabChange("next")}
                  variant="subtle"
                  p={0}
                  className={classes.navArrowButton}
                >
                  <CaretRight size={24} />
                </Button>

                <Menu position="bottom-end" withinPortal>
              <Menu.Target>
                <Button
                  variant="subtle"
                  className={classes.departmentSelectButton}
                  style={{ fontSize: "16px", marginLeft: "auto", flexShrink: 0 }}
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                >
                  {currentDept?.title || "Select Department"}
                  {isDropdownOpen ? (
                    <CaretUp size={20} style={{ marginLeft: "10px" }} />
                  ) : (
                    <CaretDown size={20} style={{ marginLeft: "10px" }} />
                  )}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                {departments.map((dept) => (
                  <Menu.Item
                    key={dept.id}
                    onClick={() => {
                      setActiveTab(dept.id);
                      setBranch(dept.code);
                      setIsDropdownOpen(false);
                    }}
                    fw={400}
                  >
                    {dept.title}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
              </Group>
            </Group>
          </Box>
        </Grid.Col>
        <Grid.Col span={12}>
          <Paper className={classes.tabPanelPaper} p="md" radius="md" withBorder>
            {activeTab !== null ? (
              renderTabContent()
            ) : (
              <Text>Select a department or action to view content</Text>
            )}
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
