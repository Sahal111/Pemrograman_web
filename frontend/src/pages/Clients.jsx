import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import DashboardLayout from "../DasboardLayout/DashboardLayout";

/* ─── Helper Functions ─── */
// const getInitials = (name = "") =>
//   name
//     .split(" ")
//     .map((w) => w[0])
//     .join("")
//     .toUpperCase()
//     .slice(0, 2);

// const getAvatarColor = (index) => {
//   const colors = [
//     "bg-blue-100 text-blue-700",
//     "bg-purple-100 text-purple-700",
//     "bg-pink-100 text-pink-700",
//     "bg-orange-100 text-orange-700",
//     "bg-green-100 text-green-700",
//     "bg-indigo-100 text-indigo-700",
//   ];
//   return colors[index % colors.length];
// };

/* ─── Add Client Modal ─── */
// function AddClientModal({ open, onClose, onAdded }) {
//   const [form, setForm] = useState({
//     nama_client: "",
//     company: "",
//     email: "",
//     phone: "",
//     status: "active",
//   });
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState("");

//   const handleClose = () => {
//     onClose();
//     setError("");
//     setForm({
//       nama_client: "",
//       company: "",
//       email: "",
//       phone: "",
//       status: "active",
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSubmitting(true);
//     try {
//       // Assuming you have a clients API endpoint
//       await api.post("/clients", form);
//       onAdded();
//       handleClose();
//     } catch (err) {
//       const errors = err.response?.data?.errors;
//       setError(errors ? Object.values(errors)[0][0] : "Failed to add client.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (!open) return null;
//   return (
//     <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
//       <div
//         className="absolute inset-0 bg-black/40 backdrop-blur-sm"
//         onClick={handleClose}
//       />
//       <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
//         <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
//           <div className="flex items-center gap-3">
//             <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
//               <span className="material-symbols-outlined text-white text-[18px]">
//                 person_add
//               </span>
//             </div>
//             <div>
//               <h3 className="text-sm font-bold text-gray-900">
//                 Add New Client
//               </h3>
//               <p className="text-xs text-gray-400">
//                 Create a new client record
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={handleClose}
//             className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 transition"
//           >
//             <span className="material-symbols-outlined text-[18px]">close</span>
//           </button>
//         </div>
//         <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
//           {error && (
//             <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
//               <span className="material-symbols-outlined text-[16px]">
//                 error
//               </span>{" "}
//               {error}
//             </div>
//           )}
//           <div>
//             <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
//               Contact Name *
//             </label>
//             <input
//               required
//               type="text"
//               value={form.nama_client}
//               onChange={(e) =>
//                 setForm({ ...form, nama_client: e.target.value })
//               }
//               placeholder="e.g. John Doe"
//               className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//             />
//           </div>
//           <div>
//             <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
//               Company *
//             </label>
//             <input
//               required
//               type="text"
//               value={form.company}
//               onChange={(e) => setForm({ ...form, company: e.target.value })}
//               placeholder="e.g. Acme Corp"
//               className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//             />
//           </div>
//           <div>
//             <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
//               Email *
//             </label>
//             <input
//               required
//               type="email"
//               value={form.email}
//               onChange={(e) => setForm({ ...form, email: e.target.value })}
//               placeholder="e.g. contact@company.com"
//               className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//             />
//           </div>
//           <div>
//             <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
//               Phone
//             </label>
//             <input
//               type="tel"
//               value={form.phone}
//               onChange={(e) => setForm({ ...form, phone: e.target.value })}
//               placeholder="e.g. +1 (555) 123-4567"
//               className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//             />
//           </div>
//           <div>
//             <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
//               Status
//             </label>
//             <select
//               value={form.status}
//               onChange={(e) => setForm({ ...form, status: e.target.value })}
//               className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
//             >
//               <option value="active">Active</option>
//               <option value="lead">Lead</option>
//               <option value="inactive">Inactive</option>
//             </select>
//           </div>
//           <div className="flex gap-3 pt-1">
//             <button
//               type="button"
//               onClick={handleClose}
//               className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={submitting}
//               className="flex-1 h-10 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
//             >
//               {submitting && (
//                 <svg
//                   className="animate-spin h-3.5 w-3.5"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                   />
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8v8z"
//                   />
//                 </svg>
//               )}
//               {submitting ? "Adding…" : "Add Client"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  // const [showAddClient, setShowAddClient] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isPM = currentUser.role === "pm";

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/projects");
      const projects = res.data.data ?? res.data;

      const clientMap = new Map();
      projects.forEach((project) => {
        if (!project.client) return;
        const clientKey = project.client.toLowerCase();

        if (!clientMap.has(clientKey)) {
          clientMap.set(clientKey, {
            id: clientKey,
            company: project.client,
            projects: [],
          });
        }
        clientMap.get(clientKey).projects.push(project);
      });

      const clientList = Array.from(clientMap.values()).map((c) => ({
        ...c,
        active_projects: c.projects.filter((p) => p.status === "ongoing")
          .length,
        total_projects: c.projects.length,
      }));

      setClients(clientList);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else setError("Failed to load clients.");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchClients();
  }, []);

  /* ── Search Filter ── */
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredClients(clients);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredClients(
        clients.filter((client) =>
          client.company?.toLowerCase().includes(query),
        ),
      );
    }
    setCurrentPage(1);
  }, [searchQuery, clients]);

  /* ── Pagination ── */
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClients = filteredClients.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  /* ── Status Badge ── */
  // const getStatusBadge = (status) => {
  //   switch (status) {
  //     case "active":
  //       return "bg-green-50 text-green-600";
  //     case "lead":
  //       return "bg-yellow-50 text-yellow-600";
  //     case "inactive":
  //       return "bg-gray-100 text-gray-500";
  //     default:
  //       return "bg-gray-100 text-gray-500";
  //   }
  // };

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Clients
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your B2B directory and client relationships.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clients..."
                className="w-full h-9 pl-10 pr-4 rounded-lg bg-white border border-gray-300 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
            {isPM && (
              <button
                onClick={() => navigate("/projects")}
                className="shrink-0 h-9 px-4 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">
                  add
                </span>
                New Project for Client
              </button>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-red-400">
                error_outline
              </span>
            </div>
            <h3 className="text-base font-semibold text-gray-900">
              Failed to Load Clients
            </h3>
            <p className="text-sm text-gray-500 mt-1">{error}</p>
            <button
              onClick={fetchClients}
              className="mt-5 h-9 px-5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <svg
                className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-3"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              <p className="text-sm text-gray-500">Loading clients...</p>
            </div>
          </div>
        )}

        {/* Client Directory Table */}
        {!loading && !error && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="py-4 px-6">Client Company</th>
                    <th className="py-4 px-6 text-center">Total Projects</th>
                    <th className="py-4 px-6 text-center">Active Projects</th>
                    <th className="py-4 px-6">Projects</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-900 divide-y divide-gray-100">
                  {currentClients.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-16 text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                          <span className="material-symbols-outlined text-3xl text-gray-400">
                            domain
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">
                          No Clients Found
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {searchQuery
                            ? "Try adjusting your search query"
                            : "Add your first client to get started"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    currentClients.map((client) => (
                      <tr
                        key={client.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Company */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded border border-gray-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                              <span className="material-symbols-outlined text-gray-400 text-[24px]">
                                domain
                              </span>
                            </div>
                            <div className="font-medium text-gray-900">
                              {client.company}
                            </div>
                          </div>
                        </td>

                        {/* Total Projects */}
                        <td className="py-4 px-6 text-center text-gray-700 font-medium">
                          {client.total_projects}
                        </td>

                        {/* Active Projects */}
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-medium text-xs ${
                              client.active_projects > 0
                                ? "bg-blue-100 text-blue-600"
                                : "bg-gray-50 text-gray-400 border border-gray-200"
                            }`}
                          >
                            {client.active_projects}
                          </span>
                        </td>

                        {/* Project list */}
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1">
                            {client.projects.slice(0, 3).map((p) => (
                              <span
                                key={p.id}
                                onClick={() => navigate(`/projects/${p.id}`)}
                                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition"
                              >
                                {p.nama_proyek}
                              </span>
                            ))}
                            {client.projects.length > 3 && (
                              <span className="text-xs text-gray-400">
                                +{client.projects.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredClients.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(endIndex, filteredClients.length)} of{" "}
                  {filteredClients.length} clients
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1 rounded text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      chevron_left
                    </span>
                  </button>

                  {/* Page numbers */}
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => goToPage(pageNum)}
                        className={`w-8 h-8 rounded text-sm font-medium flex items-center justify-center transition-colors ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="text-gray-500 px-1">...</span>
                      <button
                        onClick={() => goToPage(totalPages)}
                        className="w-8 h-8 rounded text-gray-700 hover:bg-gray-200 text-sm font-medium flex items-center justify-center transition-colors"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      chevron_right
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
