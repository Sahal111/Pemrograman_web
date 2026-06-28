import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    invite_code: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await api.post("/register", form);
      setSuccessMsg(
        res.data.message || "Registrasi berhasil! Menunggu approval."
      );
      setForm({
        username: "",
        email: "",
        password: "",
        invite_code: "",
      });
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        setError(Object.values(errors)[0][0]);
      } else {
        setError(err.response?.data?.message || "Registrasi gagal.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen min-h-screen bg-[#F8FAFC] text-[#141b2b] font-sans antialiased overflow-hidden">
      {/* ── LEFT: Illustration Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-white relative border-r border-gray-100 items-center justify-center p-12">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 to-white pointer-events-none" />

        {/* Decorative blobs */}
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute bottom-[-60px] right-[-40px] w-56 h-56 rounded-full bg-indigo-100/30 blur-2xl" />

        <div className="relative z-10 w-full max-w-lg text-center space-y-8">
          {/* Brand mark */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-white text-[22px]">layers</span>
            </div>
            <span className="text-2xl font-black text-blue-600 tracking-tight">TaskFlow</span>
          </div>

          {/* Illustration SVG */}
          <div className="relative mx-auto w-full max-w-sm">
            {/* Kanban board illustration */}
            <svg viewBox="0 0 420 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-xl">
              {/* Background card */}
              <rect x="10" y="20" width="400" height="280" rx="16" fill="white" stroke="#E5E7EB" strokeWidth="1.5"/>

              {/* Top bar */}
              <rect x="10" y="20" width="400" height="44" rx="16" fill="#F9FAFB"/>
              <rect x="10" y="48" width="400" height="16" fill="#F9FAFB"/>
              <circle cx="38" cy="42" r="8" fill="#EF4444"/>
              <circle cx="62" cy="42" r="8" fill="#F59E0B"/>
              <circle cx="86" cy="42" r="8" fill="#22C55E"/>
              <rect x="116" y="34" width="120" height="16" rx="8" fill="#E5E7EB"/>

              {/* Column headers */}
              <rect x="28" y="80" width="108" height="24" rx="6" fill="#EFF6FF"/>
              <rect x="32" y="87" width="60" height="10" rx="5" fill="#93C5FD"/>

              <rect x="156" y="80" width="108" height="24" rx="6" fill="#FFF7ED"/>
              <rect x="160" y="87" width="50" height="10" rx="5" fill="#FCA5A5"/>

              <rect x="284" y="80" width="108" height="24" rx="6" fill="#F0FDF4"/>
              <rect x="288" y="87" width="55" height="10" rx="5" fill="#86EFAC"/>

              {/* Column 1 – cards */}
              <rect x="28" y="116" width="108" height="64" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1"/>
              <rect x="38" y="126" width="70" height="8" rx="4" fill="#1D4ED8"/>
              <rect x="38" y="142" width="88" height="6" rx="3" fill="#E5E7EB"/>
              <rect x="38" y="154" width="60" height="6" rx="3" fill="#E5E7EB"/>
              <circle cx="38" cy="170" r="6" fill="#93C5FD"/>
              <circle cx="52" cy="170" r="6" fill="#C7D2FE"/>

              <rect x="28" y="192" width="108" height="56" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1"/>
              <rect x="38" y="202" width="55" height="8" rx="4" fill="#1D4ED8"/>
              <rect x="38" y="218" width="88" height="6" rx="3" fill="#E5E7EB"/>
              <rect x="38" y="230" width="44" height="6" rx="3" fill="#E5E7EB"/>

              {/* Column 2 – cards */}
              <rect x="156" y="116" width="108" height="72" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1"/>
              <rect x="166" y="126" width="60" height="8" rx="4" fill="#D97706"/>
              <rect x="166" y="142" width="88" height="6" rx="3" fill="#E5E7EB"/>
              <rect x="166" y="154" width="72" height="6" rx="3" fill="#E5E7EB"/>
              <rect x="166" y="164" width="50" height="14" rx="7" fill="#FEF3C7"/>
              <rect x="170" y="168" width="38" height="6" rx="3" fill="#F59E0B"/>

              <rect x="156" y="200" width="108" height="52" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1"/>
              <rect x="166" y="210" width="78" height="8" rx="4" fill="#D97706"/>
              <rect x="166" y="226" width="88" height="6" rx="3" fill="#E5E7EB"/>

              {/* Column 3 – cards */}
              <rect x="284" y="116" width="108" height="60" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1"/>
              <rect x="294" y="126" width="65" height="8" rx="4" fill="#15803D"/>
              <rect x="294" y="142" width="88" height="6" rx="3" fill="#E5E7EB"/>
              <rect x="294" y="154" width="50" height="14" rx="7" fill="#DCFCE7"/>
              <rect x="298" y="158" width="36" height="6" rx="3" fill="#22C55E"/>

              {/* Floating avatar group */}
              <circle cx="348" cy="270" r="14" fill="#2563EB" stroke="white" strokeWidth="2"/>
              <circle cx="330" cy="270" r="14" fill="#7C3AED" stroke="white" strokeWidth="2"/>
              <circle cx="312" cy="270" r="14" fill="#DB2777" stroke="white" strokeWidth="2"/>
              <rect x="290" y="258" width="80" height="0" rx="0" fill="none"/>
            </svg>
          </div>

          {/* Tagline */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Manage projects effortlessly</h2>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
              Collaborate, track progress, and deliver on time — all in one place.
            </p>
          </div>

          {/* Social proof dots */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-600" />
            <div className="w-2 h-2 rounded-full bg-blue-200" />
            <div className="w-2 h-2 rounded-full bg-blue-200" />
          </div>
        </div>
      </div>

      {/* ── RIGHT: Register Form ── */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-20 xl:px-24 bg-white overflow-y-auto">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow">
              <span className="material-symbols-outlined text-white text-[18px]">layers</span>
            </div>
            <span className="text-xl font-black text-blue-600">TaskFlow</span>
          </div>

          {/* Header */}
          <div>
            <h1 className="hidden lg:block text-3xl font-black text-blue-600 tracking-tight mb-2">TaskFlow</h1>
            <h2 className="mt-6 text-2xl font-bold text-gray-900 tracking-tight">Create an account</h2>
            <p className="mt-2 text-sm text-gray-500">Sign up to join your team's workspace.</p>
          </div>

          {/* Form */}
          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-5" id="registerForm">
              {/* Success alert */}
              {successMsg && (
                <div className="flex items-start gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                  <span className="material-symbols-outlined text-[18px] mt-0.5 flex-shrink-0">check_circle</span>
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Error alert */}
              {error && (
                <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  <span className="material-symbols-outlined text-[18px] mt-0.5 flex-shrink-0">error</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 tracking-wide uppercase">
                  Username
                </label>
                <input
                  name="username"
                  type="text"
                  required
                  value={form.username}
                  onChange={handleChange}
                  placeholder="johndoe"
                  className="block w-full h-11 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 tracking-wide uppercase">
                  Email address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  className="block w-full h-11 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 tracking-wide uppercase">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="block w-full h-11 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                />
              </div>

              {/* Invite Code */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 tracking-wide uppercase">
                  Invite Code
                </label>
                <input
                  name="invite_code"
                  type="text"
                  required
                  value={form.invite_code}
                  onChange={handleChange}
                  placeholder="Enter code from PM"
                  className="block w-full h-11 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 uppercase"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="relative flex w-full items-center justify-center h-11 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:scale-[0.98] transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden mt-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Processing…
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Login link */}
            <p className="mt-8 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

