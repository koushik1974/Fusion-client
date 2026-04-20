// Role-based announcement read/dismissed tracking
// Each role has its own read status - completely isolated

const getStorageKey = (role) => `fusion_announcements_read_${String(role || "").toLowerCase()}`;

export function getReadAnnouncements(role) {
  try {
    const key = getStorageKey(role);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function markAnnouncementAsRead(announcementId, role) {
  try {
    const key = getStorageKey(role);
    const readAnnouncements = getReadAnnouncements(role);
    readAnnouncements[announcementId] = true;
    localStorage.setItem(key, JSON.stringify(readAnnouncements));
  } catch {
    console.error("Failed to mark announcement as read");
  }
}

export function dismissAnnouncementFromUI(announcementId, role) {
  try {
    const key = getStorageKey(role);
    const readAnnouncements = getReadAnnouncements(role);
    readAnnouncements[announcementId] = { read: true, dismissed: true };
    localStorage.setItem(key, JSON.stringify(readAnnouncements));
  } catch {
    console.error("Failed to dismiss announcement");
  }
}

export function isAnnouncementRead(announcementId, role) {
  const readAnnouncements = getReadAnnouncements(role);
  const status = readAnnouncements[announcementId];
  if (typeof status === "boolean") return status;
  if (typeof status === "object") return status?.read === true;
  return false;
}

export function isAnnouncementDismissed(announcementId, role) {
  const readAnnouncements = getReadAnnouncements(role);
  const status = readAnnouncements[announcementId];
  if (typeof status === "object") return status?.dismissed === true;
  return false;
}

export function shouldShowAnnouncement(announcementId, role) {
  const dismissed = isAnnouncementDismissed(announcementId, role);
  return !dismissed;
}
