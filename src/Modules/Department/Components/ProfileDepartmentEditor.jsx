import { useState } from "react";
import axios from "axios";
import {
  Button,
  Divider,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { host } from "../../../routes/globalRoutes";
import classes from "../styles/Departmentmodule.module.css";

const departmentOptions = [
  { value: "CSE", label: "CSE" },
  { value: "ECE", label: "ECE" },
  { value: "ME", label: "ME" },
  { value: "SM", label: "SM" },
  { value: "Design", label: "Design" },
  { value: "Liberal Arts", label: "Liberal Arts" },
  { value: "Natural Science", label: "Natural Science" },
];

function ProfileDepartmentEditor() {
  const [targetType, setTargetType] = useState("student");
  const [targetId, setTargetId] = useState("");
  const [userId, setUserId] = useState(null); // Store numeric user ID
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [profileFound, setProfileFound] = useState(false);
  const [profileData, setProfileData] = useState({
    aboutMe: "",
    dateOfBirth: "",
    address: "",
    phoneNo: "",
    department: "",
    userName: "",
    programme: "",
    batch: "",
    facultyAbout: "",
    education: "",
    interest: "",
    contact: "",
    github: "",
    linkedin: "",
  });

  const handleChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const fetchProfile = async () => {
    if (!targetId.trim()) {
      notifications.show({ message: "Enter identifier.", color: "red" });
      return;
    }

    const token = localStorage.getItem("authToken");
    setLoading(true);
    setError(null);

    try {
      const endpoint =
        targetType === "faculty"
          ? `${host}/dep/api/faculty-profile/${encodeURIComponent(targetId.trim())}/`
          : `${host}/dep/api/student-profile/${encodeURIComponent(targetId.trim())}/`;

      const response = await axios.get(
        endpoint,
        { headers: { Authorization: `Token ${token}` } },
      );
      const data = response.data || {};
      setUserId(data.id || null); // Store numeric user ID
      setProfileData({
        aboutMe: data.about_me || "",
        dateOfBirth: data.date_of_birth || "",
        address: data.address || "",
        phoneNo: data.phone_no || "",
        department: data.department || "",
        userName: data.name || data.roll_no || data.username || "",
        programme: data.programme || "",
        batch: data.batch || "",
        facultyAbout: data.faculty_about || "",
        education: data.education || "",
        interest: data.interest || "",
        contact: data.contact || "",
        github: data.github || "",
        linkedin: data.linkedin || "",
      });
      setProfileFound(true);
      notifications.show({
        message: targetType === "faculty" ? "Faculty data loaded." : "Student data loaded.",
        color: "green",
      });
    } catch (fetchError) {
      setProfileFound(false);
      setError(
        fetchError?.response?.data?.detail || "Unable to fetch profile data.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForReview = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      notifications.show({
        message: "Authentication token not found.",
        color: "red",
      });
      return;
    }

    if (!userId) {
      notifications.show({
        message: "Please fetch a profile first before submitting changes.",
        color: "red",
      });
      return;
    }

    setSaving(true);
    try {
      const changes = {
        about_me: profileData.aboutMe,
        date_of_birth: profileData.dateOfBirth,
        address: profileData.address,
        phone_no: profileData.phoneNo,
        department: profileData.department,
      };

      if (targetType === "faculty") {
        changes.faculty_about = profileData.facultyAbout;
        changes.education = profileData.education;
        changes.interest = profileData.interest;
        changes.contact = profileData.contact;
        changes.github = profileData.github;
        changes.linkedin = profileData.linkedin;
      }

      const response = await axios.post(
        `${host}/dep/api/profile-change-requests/`,
        {
          target_type: targetType,
          target_id: String(userId), // Use numeric user ID instead of identifier
          changes,
        },
        {
          headers: { Authorization: `Token ${token}` },
        },
      );

      if (response.status === 201) {
        notifications.show({
          message: "Change request submitted for dept_admin/HOD approval.",
          color: "green",
        });
      } else {
        notifications.show({
          message: "Unable to submit change request.",
          color: "red",
        });
      }
    } catch (saveError) {
      notifications.show({
        message:
          saveError?.response?.data?.detail ||
          "Unable to submit change request.",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper className={classes.tabPanelPaper} p="lg" radius="md" withBorder>
      <Stack gap="md">
        <div>
          <Title order={3} fw={300} c="blue.7">
            Profile & Department Details
          </Title>
          <Text size="sm" c="dimmed" mt={4}>
            Choose student or faculty, fetch details, edit and submit official changes for approval.
          </Text>
        </div>

        <Divider />

        <Group align="flex-end" grow>
          <Select
            label="Profile Type"
            value={targetType}
            onChange={(value) => {
              const nextType = value || "student";
              setTargetType(nextType);
              setTargetId("");
              setUserId(null);
              setProfileFound(false);
              setError(null);
            }}
            data={[
              { value: "student", label: "Student" },
              { value: "faculty", label: "Faculty" },
            ]}
            allowDeselect={false}
          />
          <TextInput
            label={targetType === "faculty" ? "Faculty Username" : "Roll Number"}
            value={targetId}
            onChange={(event) => setTargetId(event.currentTarget.value)}
            placeholder={targetType === "faculty" ? "e.g. faculty1" : "e.g. 22BCS001"}
          />
          <Button onClick={fetchProfile} loading={loading}>
            Fetch
          </Button>
        </Group>

        {error && (
          <Paper className={classes.errorPanel} p="md" radius="md" withBorder>
            <Text fw={400}>{error}</Text>
          </Paper>
        )}

        {!profileFound ? null : (
          <>
            <Group grow align="flex-start" preventGrowOverflow={false}>
              <TextInput label="Name" value={profileData.userName} readOnly />
              {targetType === "student" && (
                <TextInput label="Programme" value={profileData.programme} readOnly />
              )}
              {targetType === "student" && (
                <TextInput label="Batch" value={String(profileData.batch || "")} readOnly />
              )}
            </Group>

            <Textarea
              label="About Me"
              value={profileData.aboutMe}
              onChange={(event) => handleChange("aboutMe", event.currentTarget.value)}
              minRows={4}
              autosize
            />

            <Group grow align="flex-start" preventGrowOverflow={false}>
              <TextInput
                label="Date of Birth"
                value={profileData.dateOfBirth}
                onChange={(event) =>
                  handleChange("dateOfBirth", event.currentTarget.value)
                }
                placeholder="YYYY-MM-DD"
              />
              <TextInput
                label="Contact Number"
                value={profileData.phoneNo}
                onChange={(event) => handleChange("phoneNo", event.currentTarget.value)}
              />
            </Group>

            <TextInput
              label="Address"
              value={profileData.address}
              onChange={(event) => handleChange("address", event.currentTarget.value)}
            />

            {targetType === "faculty" && (
              <Textarea
                label="Faculty About"
                value={profileData.facultyAbout}
                onChange={(event) => handleChange("facultyAbout", event.currentTarget.value)}
                minRows={3}
                autosize
              />
            )}

            {targetType === "faculty" && (
              <Group grow align="flex-start" preventGrowOverflow={false}>
                <TextInput
                  label="Education"
                  value={profileData.education}
                  onChange={(event) => handleChange("education", event.currentTarget.value)}
                />
                <TextInput
                  label="Interests"
                  value={profileData.interest}
                  onChange={(event) => handleChange("interest", event.currentTarget.value)}
                />
              </Group>
            )}

            {targetType === "faculty" && (
              <Group grow align="flex-start" preventGrowOverflow={false}>
                <TextInput
                  label="Profile Contact"
                  value={profileData.contact}
                  onChange={(event) => handleChange("contact", event.currentTarget.value)}
                />
                <TextInput
                  label="GitHub"
                  value={profileData.github}
                  onChange={(event) => handleChange("github", event.currentTarget.value)}
                />
                <TextInput
                  label="LinkedIn"
                  value={profileData.linkedin}
                  onChange={(event) => handleChange("linkedin", event.currentTarget.value)}
                />
              </Group>
            )}

            <Select
              label="Department"
              value={profileData.department}
              onChange={(value) => handleChange("department", value || "")}
              data={departmentOptions}
              placeholder="Select department"
              searchable
              clearable
            />

            <Group justify="flex-end" align="center" mt="sm">
              <Button onClick={handleSubmitForReview} loading={saving}>
                Submit For Approval
              </Button>
            </Group>
          </>
        )}
      </Stack>
    </Paper>
  );
}

ProfileDepartmentEditor.propTypes = {};

export default ProfileDepartmentEditor;
