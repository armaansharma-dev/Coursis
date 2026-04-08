import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ENDPOINTS } from "../config/api";
import { FaUser, FaLock, FaEnvelope, FaArrowLeft, FaCheckCircle, FaCalendar, FaShieldAlt, FaPen, FaTimes } from "react-icons/fa";

type UserProfile = {
  _id: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
};

export default function EditProfile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states for editing
  const [editNameModal, setEditNameModal] = useState(false);
  const [editEmailModal, setEditEmailModal] = useState(false);
  const [editPasswordModal, setEditPasswordModal] = useState(false);

  // Name editing
  const [newName, setNewName] = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSuccess, setNameSuccess] = useState(false);

  // Email editing
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);

  // Password editing
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchProfile();
  }, [token, navigate]);

  const fetchProfile = async () => {
    try {
      setError(null);
      const res = await fetch(ENDPOINTS.myProfile, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Handle user deleted/not found
      if (res.status === 401 || res.status === 404) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      const data = await res.json();
      if (res.ok && data.data) {
        setProfile(data.data);
        setNewName(data.data.name);
        setNewEmail(data.data.email);
      } else {
        setError(data.message || "Failed to load profile");
      }
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(null);

    if (!newName.trim() || newName.trim().length < 2) {
      setNameError("Name must be at least 2 characters");
      return;
    }

    setNameLoading(true);
    try {
      const res = await fetch(ENDPOINTS.updateProfile, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName.trim() }),
      });

      // Handle user deleted/not found
      if (res.status === 401 || res.status === 404) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      const data = await res.json();
      if (res.ok && data.data) {
        setProfile(data.data);
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        user.name = data.data.name;
        localStorage.setItem("user", JSON.stringify(user));
        setNameSuccess(true);
        setTimeout(() => {
          setNameSuccess(false);
          setEditNameModal(false);
        }, 1500);
      } else {
        setNameError(data.message || "Failed to update name");
      }
    } catch (err) {
      setNameError("Error updating name");
    } finally {
      setNameLoading(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);

    if (!newEmail.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!emailPassword.trim()) {
      setEmailError("Password is required");
      return;
    }

    setEmailLoading(true);
    try {
      const res = await fetch(ENDPOINTS.changeEmail, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newMail: newEmail.trim(), password: emailPassword }),
      });

      // Handle user deleted/not found
      if (res.status === 401 || res.status === 404) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      const data = await res.json();
      if (res.ok && data.data) {
        setProfile(data.data);
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        user.email = data.data.email;
        localStorage.setItem("user", JSON.stringify(user));
        setEmailPassword("");
        setEmailSuccess(true);
        setTimeout(() => {
          setEmailSuccess(false);
          setEditEmailModal(false);
        }, 1500);
      } else {
        setEmailError(data.message || "Failed to update email");
      }
    } catch (err) {
      setEmailError("Error updating email");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch(ENDPOINTS.changePassword, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmNewPassword: confirmPassword,
        }),
      });

      // Handle user deleted/not found
      if (res.status === 401 || res.status === 404) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      const data = await res.json();
      if (res.ok) {
        setPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          alert("Password changed successfully. Please log in again.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        }, 1500);
      } else {
        setPasswordError(data.message || "Failed to change password");
      }
    } catch (err) {
      setPasswordError("Error changing password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-indigo-50 mb-4">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-indigo-600"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Profile</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchProfile}
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-indigo-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-5xl mx-auto px-6 md:px-8 flex items-center justify-between h-16">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium transition"
          >
            <FaArrowLeft className="text-sm" /> Back
          </button>
          <h1 className="text-lg font-bold text-gray-900">Account Settings</h1>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 md:px-8 py-12">
        {/* Profile Header Card */}
        <div className="mb-12 bg-white rounded-2xl shadow-sm border border-gray-200 p-8 relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          </div>

          <div className="relative flex items-center gap-8">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-4xl font-bold text-white">{getInitials(profile.name)}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="mb-2 flex items-center gap-3">
                <h2 className="text-3xl font-bold text-gray-900">{profile.name}</h2>
              </div>
              <p className="text-gray-600 mb-4">{profile.email}</p>

              {/* Status Badges */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100/80 text-indigo-700 rounded-xl text-sm font-semibold border border-indigo-200/50 backdrop-blur-sm">
                  <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                  {profile.role?.charAt(0).toUpperCase() + (profile.role?.slice(1) || "User")}
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100/80 text-gray-700 rounded-xl text-sm font-semibold border border-gray-200/50 backdrop-blur-sm">
                  <FaCalendar className="text-xs opacity-60" />
                  Joined {formatDate(profile.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="space-y-8">
          {/* Personal Information Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                <FaUser className="text-indigo-600 text-lg" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
            </div>

            <div className="space-y-3">
              {/* Name Card */}
              <div className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-indigo-300 hover:shadow-md transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-indigo-50 to-transparent pointer-events-none"></div>

                <div className="relative flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Full Name</p>
                    <p className="text-lg font-semibold text-gray-900">{profile.name}</p>
                  </div>
                  <button
                    onClick={() => setEditNameModal(true)}
                    className="ml-4 p-2.5 text-gray-400 group-hover:text-indigo-600 bg-gray-100 group-hover:bg-indigo-100 rounded-lg transition-all duration-200 flex-shrink-0"
                  >
                    <FaPen className="text-sm" />
                  </button>
                </div>
              </div>

              {/* Email Card */}
              <div className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-indigo-300 hover:shadow-md transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-indigo-50 to-transparent pointer-events-none"></div>

                <div className="relative flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Email Address</p>
                    <p className="text-lg font-semibold text-gray-900 truncate">{profile.email}</p>
                  </div>
                  <button
                    onClick={() => setEditEmailModal(true)}
                    className="ml-4 p-2.5 text-gray-400 group-hover:text-indigo-600 bg-gray-100 group-hover:bg-indigo-100 rounded-lg transition-all duration-200 flex-shrink-0"
                  >
                    <FaPen className="text-sm" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="pt-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-100 to-red-100 rounded-lg flex items-center justify-center">
                <FaLock className="text-red-600 text-lg" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Security</h3>
            </div>

            <div className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-indigo-300 hover:shadow-md transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-indigo-50 to-transparent pointer-events-none"></div>

              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Password</p>
                  <p className="text-lg font-semibold text-gray-900">••••••••</p>
                </div>
                <button
                  onClick={() => setEditPasswordModal(true)}
                  className="p-2.5 text-gray-400 group-hover:text-indigo-600 bg-gray-100 group-hover:bg-indigo-100 rounded-lg transition-all duration-200 flex-shrink-0"
                >
                  <FaPen className="text-sm" />
                </button>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">💡 Keep your password strong and unique for better security</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Name Modal */}
      {editNameModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full sm:animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-transparent">
              <h3 className="text-xl font-bold text-gray-900">Edit Full Name</h3>
              <button onClick={() => setEditNameModal(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition">
                <FaTimes className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleUpdateName} className="p-6 space-y-4">
              {nameSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                  <FaCheckCircle className="text-green-600 text-lg flex-shrink-0" />
                  <p className="text-green-700 font-medium text-sm">Updated successfully</p>
                </div>
              )}

              {nameError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{nameError}</p>
                </div>
              )}

              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
              />

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditNameModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={nameLoading}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-indigo-700 disabled:opacity-50 transition text-sm shadow-md hover:shadow-lg"
                >
                  {nameLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Email Modal */}
      {editEmailModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full sm:animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-transparent">
              <h3 className="text-xl font-bold text-gray-900">Edit Email Address</h3>
              <button onClick={() => setEditEmailModal(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition">
                <FaTimes className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleChangeEmail} className="p-6 space-y-4">
              {emailSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                  <FaCheckCircle className="text-green-600 text-lg flex-shrink-0" />
                  <p className="text-green-700 font-medium text-sm">Updated successfully</p>
                </div>
              )}

              {emailError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{emailError}</p>
                </div>
              )}

              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="New email address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
              />
              <input
                type="password"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                placeholder="Confirm with password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
              />

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditEmailModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={emailLoading}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-indigo-700 disabled:opacity-50 transition text-sm shadow-md hover:shadow-lg"
                >
                  {emailLoading ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Password Modal */}
      {editPasswordModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full sm:animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-transparent">
              <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
              <button onClick={() => setEditPasswordModal(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition">
                <FaTimes className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              {passwordSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                  <FaCheckCircle className="text-green-600 text-lg flex-shrink-0" />
                  <p className="text-green-700 font-medium text-sm">Updated successfully</p>
                </div>
              )}

              {passwordError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{passwordError}</p>
                </div>
              )}

              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 8 characters)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
              />

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditPasswordModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-indigo-700 disabled:opacity-50 transition text-sm shadow-md hover:shadow-lg"
                >
                  {passwordLoading ? "Updating..." : "Change"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
