import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import DashboardLayout from "../DasboardLayout/DashboardLayout";

/* ─── Helper Functions ─── */
const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Settings() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeSection, setActiveSection] = useState("general");

  const [form, setForm] = useState({
    username: "",
    email: "",
    job_title: "",
    department: "",
    bio: "",
    phone: "",
    timezone: "(GMT-08:00) Pacific Time (US & Canada)",
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  /* ── Fetch User Data ── */
  const fetchUserData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/me");
      const userData = res.data.data ?? res.data;
      setUser(userData);
      
      setForm({
        username: userData.username || "",
        email: userData.email || "",
        job_title: userData.job_title || "",
        department: userData.department || "",
        bio: userData.bio || "",
        phone: userData.phone || "",
        timezone: userData.timezone || "(GMT-08:00) Pacific Time (US & Canada)",
      });
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else setError("Failed to load user data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  /* ── Save Profile Changes ── */
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const res = await api.put("/me", form);
      const updatedUser = res.data.data ?? res.data;
      setUser(updatedUser);
      
      // Update localStorage user
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors ? Object.values(errors)[0][0] : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Change Password ── */
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      await api.post("/change-password", {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setSuccess("Password changed successfully!");
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors ? Object.values(errors)[0][0] : "Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Upload Profile Photo ── */
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const res = await api.post("/me/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const updatedUser = res.data.data ?? res.data;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setSuccess("Profile photo updated!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to upload photo.");
    }
  };

  /* ── Loading State ── */
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-sm text-gray-500">Loading settings...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your account settings and preferences</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Settings Navigation Sidebar */}
          <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-1">
            <button
              onClick={() => setActiveSection("general")}
              className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all text-sm font-medium ${
                activeSection === "general"
                  ? "bg-blue-50 border border-blue-200 text-blue-600 shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]" style={activeSection === "general" ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  person
                </span>
                General
              </div>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
            <button
              onClick={() => setActiveSection("security")}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${
                activeSection === "security"
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-white hover:border hover:border-gray-200"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">lock</span>
              Security
            </button>
          </aside>

          {/* Settings Content */}
          <div className="flex-1 flex flex-col gap-6">
            {/* General Settings */}
            {activeSection === "general" && (
              <>
                {/* Profile Information */}
                <section className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Profile Information</h3>
                  
                  <form onSubmit={handleSaveProfile}>
                    <div className="flex flex-col sm:flex-row gap-6 mb-8">
                      {/* Profile Photo */}
                      <div className="shrink-0 flex flex-col items-center gap-3">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-blue-100 bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                          {user?.photo ? (
                            <img src={`http://127.0.0.1:8000/storage/${user.photo}`} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            getInitials(user?.username || user?.email || "U")
                          )}
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-medium bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-1.5 px-3 rounded-lg flex items-center gap-2 transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                          Change Photo
                        </button>
                      </div>

                      {/* Form Fields */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Full Name</label>
                          <input
                            type="text"
                            value={form.username}
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                            className="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Job Title</label>
                          <input
                            type="text"
                            value={form.job_title}
                            onChange={(e) => setForm({ ...form, job_title: e.target.value })}
                            placeholder="e.g. Senior Project Manager"
                            className="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Department</label>
                          <input
                            type="text"
                            value={form.department}
                            onChange={(e) => setForm({ ...form, department: e.target.value })}
                            placeholder="e.g. Engineering Ops"
                            className="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Bio</label>
                          <textarea
                            value={form.bio}
                            onChange={(e) => setForm({ ...form, bio: e.target.value })}
                            rows={3}
                            placeholder="Tell us about yourself..."
                            className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Contact & Regional */}
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Contact & Regional</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email Address</label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-gray-50"
                          disabled
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Phone Number</label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="+1 (555) 123-4567"
                          className="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Timezone</label>
                        <select
                          value={form.timezone}
                          onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                          className="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none bg-white"
                        >
                          <option>(GMT-08:00) Pacific Time (US & Canada)</option>
                          <option>(GMT-05:00) Eastern Time (US & Canada)</option>
                          <option>(GMT+00:00) Greenwich Mean Time</option>
                          <option>(GMT+01:00) Central European Time</option>
                          <option>(GMT+07:00) Western Indonesia Time</option>
                          <option>(GMT+08:00) Singapore Time</option>
                          <option>(GMT+09:00) Japan Standard Time</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end pt-6">
                      <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 text-white h-11 px-6 rounded-lg font-semibold text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-sm disabled:opacity-60 flex items-center gap-2"
                      >
                        {saving && (
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                        )}
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </section>
              </>
            )}

            {/* Security Settings */}
            {activeSection === "security" && (
              <section className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Change Password</h3>
                
                <form onSubmit={handleChangePassword}>
                  <div className="space-y-4 max-w-md">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Current Password</label>
                      <input
                        type="password"
                        value={passwordForm.current_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                        required
                        className="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">New Password</label>
                      <input
                        type="password"
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                        required
                        minLength={8}
                        className="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordForm.confirm_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                        required
                        minLength={8}
                        className="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      />
                    </div>
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 text-white h-11 px-6 rounded-lg font-semibold text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-sm disabled:opacity-60 flex items-center gap-2"
                      >
                        {saving && (
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                        )}
                        {saving ? "Updating..." : "Change Password"}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Account Security Info */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Account Security</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-green-600 text-[20px]">verified_user</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                          <p className="text-xs text-gray-500">Add extra security to your account</p>
                        </div>
                      </div>
                      <button className="text-xs font-medium text-blue-600 hover:underline">Enable</button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-blue-600 text-[20px]">devices</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Active Sessions</p>
                          <p className="text-xs text-gray-500">Manage devices where you're logged in</p>
                        </div>
                      </div>
                      <button className="text-xs font-medium text-blue-600 hover:underline">View All</button>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
