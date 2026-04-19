import { host } from "../globalRoutes";

// Main department views
export const departmentMainRoute = `${host}/dep/`;
export const facultyViewRoute = `${host}/dep/facView/`;
export const staffViewRoute = `${host}/dep/staffView/`;
export const allStudentsRoute = `${host}/dep/All_Students/`;
export const approvedRoute = `${host}/dep/approved/`;
export const denyRoute = `${host}/dep/deny/`;

// Announcements endpoints
export const announcementsCreateRoute = `${host}/dep/api/announcements/`;
export const announcementsDataRoute = `${host}/dep/api/ann-data/`;
export const announcementDeleteRoute = `${host}/dep/api/announcements/`;

// Labs endpoints
export const labsRoute = `${host}/dep/api/labs/`;

// Facilities endpoints
export const facilitiesRoute = `${host}/dep/api/facilities/`;
export const facilitiesDeleteRoute = `${host}/dep/api/facilities/delete/`;

// Feedback endpoints
export const feedbackRoute = `${host}/dep/api/feedback/`;
export const feedbackResolveRoute = `${host}/dep/api/feedback/`;

// Timetable endpoints
export const timetableRoute = `${host}/dep/api/timetable/`;
export const timetableDetailRoute = `${host}/dep/api/timetable/`;

// Stock/Inventory endpoints
export const stockRequestsRoute = `${host}/dep/api/stock/requests/`;
export const stockDecisionRoute = `${host}/dep/api/stock/requests/`;
export const stockIssueRoute = `${host}/dep/api/stock/requests/`;

// Profile endpoints
export const studentProfileRoute = `${host}/dep/api/student-profile/`;
export const facultyProfileRoute = `${host}/dep/api/faculty-profile/`;
export const profileChangeRequestsRoute = `${host}/dep/api/profile-change-requests/`;
export const profileChangeRequestDecisionRoute = `${host}/dep/api/profile-change-requests/`;

// Directory endpoints
export const facultyDirectoryRoute = `${host}/dep/api/faculty-directory/`;
export const studentDirectoryRoute = `${host}/dep/api/student-directory/`;
export const alumniDirectoryRoute = `${host}/dep/api/alumni-directory/`;
