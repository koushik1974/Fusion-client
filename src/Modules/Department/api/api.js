import axios from "axios";
import { host } from "../../../routes/globalRoutes";

const BASE_URL = host;

/**
 * Get the authentication token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

/**
 * Get request headers with authentication
 */
const getHeaders = () => {
  const token = getAuthToken();
  return {
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// ============================================
// ANNOUNCEMENTS API
// ============================================

export const fetchAnnouncements = async (branch = "ALL") => {
  try {
    const response = await axios.get(
      `${BASE_URL}/dep/api/ann-data/${branch}/`,
      getHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching announcements:", error);
    throw error;
  }
};

export const createAnnouncement = async (announcementData) => {
  try {
    const formData = new FormData();
    formData.append("programme", announcementData.programme);
    formData.append("batch", announcementData.batch);
    formData.append("department", announcementData.department);
    formData.append("message", announcementData.message);

    if (announcementData.upload_announcement) {
      formData.append("upload_announcement", announcementData.upload_announcement);
    }

    const token = getAuthToken();
    const response = await axios.post(
      `${BASE_URL}/dep/api/announcements/`,
      formData,
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error creating announcement:", error);
    throw error;
  }
};

export const deleteAnnouncement = async (announcementId) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/dep/api/announcements/${announcementId}/`,
      getHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting announcement:", error);
    throw error;
  }
};

// ============================================
// LABS API
// ============================================

export const fetchLabs = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/dep/api/labs/`,
      getHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching labs:", error);
    throw error;
  }
};

// ============================================
// FACILITIES API
// ============================================

export const fetchFacilities = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/dep/api/facilities/`,
      getHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching facilities:", error);
    throw error;
  }
};

export const createFacility = async (facilityData) => {
  try {
    const formData = new FormData();
    formData.append("name", facilityData.name);

    if (facilityData.branch) formData.append("branch", facilityData.branch);
    if (facilityData.location) formData.append("location", facilityData.location);
    if (facilityData.lab) formData.append("lab", facilityData.lab);
    if (facilityData.amount) formData.append("amount", facilityData.amount);
    if (facilityData.picture) formData.append("picture", facilityData.picture);
    if (facilityData.stock_request_id)
      formData.append("stock_request_id", facilityData.stock_request_id);

    const token = getAuthToken();
    const response = await axios.post(
      `${BASE_URL}/dep/api/facilities/`,
      formData,
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error creating facility:", error);
    throw error;
  }
};

export const deleteFacility = async (facilityId) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/dep/api/facilities/${facilityId}/`,
      getHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting facility:", error);
    throw error;
  }
};

// ============================================
// FEEDBACK API
// ============================================

export const fetchFeedback = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/dep/api/feedback/`,
      getHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching feedback:", error);
    throw error;
  }
};

export const createFeedback = async (feedbackData) => {
  try {
    const formData = new FormData();
    formData.append("subject", feedbackData.subject);
    formData.append("description", feedbackData.description);

    if (feedbackData.category) formData.append("category", feedbackData.category);
    if (feedbackData.upload_feedback)
      formData.append("upload_feedback", feedbackData.upload_feedback);

    const token = getAuthToken();
    const response = await axios.post(
      `${BASE_URL}/dep/api/feedback/`,
      formData,
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error creating feedback:", error);
    throw error;
  }
};

export const resolveFeedback = async (feedbackId, resolutionData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/dep/api/feedback/${feedbackId}/resolve/`,
      resolutionData,
      getHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error resolving feedback:", error);
    throw error;
  }
};

// ============================================
// TIMETABLE API
// ============================================

export const fetchTimetable = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/dep/api/timetable/`,
      getHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching timetable:", error);
    throw error;
  }
};

export const fetchTimetableDetail = async (timetableId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/dep/api/timetable/${timetableId}/`,
      getHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching timetable detail:", error);
    throw error;
  }
};

// ============================================
// STOCK REQUESTS API
// ============================================

export const fetchStockRequests = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/dep/api/stock/requests/`,
      getHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching stock requests:", error);
    throw error;
  }
};

export const createStockRequest = async (stockData) => {
  try {
    const formData = new FormData();
    formData.append("brief", stockData.brief);
    formData.append("request_details", stockData.request_details);
    formData.append("stock_item_name", stockData.stock_item_name);
    formData.append("quantity", stockData.quantity);
    formData.append("request_receiver", stockData.request_receiver);

    if (stockData.lab) formData.append("lab", stockData.lab);
    if (stockData.upload_request) formData.append("upload_request", stockData.upload_request);

    const token = getAuthToken();
    const response = await axios.post(
      `${BASE_URL}/dep/api/stock/requests/`,
      formData,
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error creating stock request:", error);
    throw error;
  }
};

export const makeStockDecision = async (stockId, decisionData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/dep/api/stock/requests/${stockId}/decision/`,
      decisionData,
      getHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error making stock decision:", error);
    throw error;
  }
};

export const issueStock = async (stockId, issueData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/dep/api/stock/requests/${stockId}/issue/`,
      issueData,
      getHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error issuing stock:", error);
    throw error;
  }
};

// ============================================
// PROFILE ENDPOINTS
// ============================================

export const fetchStudentProfile = async (rollNo) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/dep/api/student-profile/${rollNo}/`,
      getHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching student profile:", error);
    throw error;
  }
};

export const fetchFacultyProfile = async (username) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/dep/api/faculty-profile/${username}/`,
      getHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching faculty profile:", error);
    throw error;
  }
};

// ============================================
// PROFILE CHANGE REQUESTS API
// ============================================

export const fetchProfileChangeRequests = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/dep/api/profile-change-requests/`,
      getHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching profile change requests:", error);
    throw error;
  }
};

export const makeProfileChangeRequestDecision = async (requestId, decisionData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/dep/api/profile-change-requests/${requestId}/decision/`,
      decisionData,
      getHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error making profile change request decision:", error);
    throw error;
  }
};

// ============================================
// DIRECTORY ENDPOINTS
// ============================================

export const fetchFacultyDirectory = async (branch) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/dep/api/faculty-directory/${branch}/`,
      getHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching faculty directory:", error);
    throw error;
  }
};

export const fetchStudentDirectory = async (branch) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/dep/api/student-directory/${branch}/`,
      getHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching student directory:", error);
    throw error;
  }
};

export const fetchAlumniDirectory = async (branch) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/dep/api/alumni-directory/${branch}/`,
      getHeaders(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching alumni directory:", error);
    throw error;
  }
};

// ============================================
// ERROR HANDLER UTILITY
// ============================================

export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    console.error("Server Error:", error.response.status, error.response.data);
    return {
      status: error.response.status,
      message: error.response.data?.detail || "An error occurred",
      data: error.response.data,
    };
  } else if (error.request) {
    // Request made but no response
    console.error("Network Error:", error.request);
    return {
      status: null,
      message: "Network error - no response from server",
      data: null,
    };
  } else {
    // Error in request setup
    console.error("Error:", error.message);
    return {
      status: null,
      message: error.message,
      data: null,
    };
  }
};
