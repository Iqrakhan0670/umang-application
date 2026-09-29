import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

const ROLES = ["agent", "reviewer", "settlement_admin", "super_admin"];

export default function ManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("agent");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null); // { type: "ok" | "error", text }
  const [myEmail, setMyEmail] = useState("");

  const fetchAdmins = async () => {
    const { data } = await supabase
      .from("admin_users")
      .select("*")
      .order("created_at", { ascending: false });
    setAdmins(data || []);
  };

  useEffect(() => {
    fetchAdmins();
    supabase.auth.getUser().then(({ data }) => {
      setMyEmail((data.user?.email || "").toLowerCase());
    });
  }, []);

  const isSelf = (a) => a.email?.toLowerCase() === myEmail;

  const addAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const { error } = await supabase.from("admin_users").insert({
      email: email.trim().toLowerCase(),
      full_name: name.trim(),
      role,
      created_by: myEmail,
    });
    setLoading(false);
    if (error) {
      setMsg({
        type: "error",
        text: error.code === "23505" ? "Ye email pehle se admin hai." : "Error: " + error.message,
      });
    } else {
      setMsg({ type: "ok", text: "Admin add ho gaya." });
      setEmail("");
      setName("");
      fetchAdmins();
    }
  };

  const toggleActive = async (a) => {
    setMsg(null);
    if (isSelf(a) && a.is_active) {
      setMsg({ type: "error", text: "Aap apna khud ka account disable nahi kar sakte." });
      return;
    }
    const { error } = await supabase
      .from("admin_users")
      .update({ is_active: !a.is_active })
      .eq("id", a.id);
    if (error) {
      setMsg({ type: "error", text: error.message });
      return;
    }
    fetchAdmins();
  };

  const removeAdmin = async (a) => {
    setMsg(null);
    if (isSelf(a)) {
      setMsg({ type: "error", text: "Aap apna khud ka account delete nahi kar sakte." });
      return;
    }
    if (!window.confirm(`${a.email} ko permanently remove karna hai?`)) return;
    const { error } = await supabase.from("admin_users").delete().eq("id", a.id);
    if (error) {
      setMsg({ type: "error", text: error.message });
      return;
    }
    fetchAdmins();
  };

  return (
    <div>
      <form onSubmit={addAdmin} className="flex flex-wrap gap-2 mb-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border border-gray-200 bg-white px-3 py-2 text-sm rounded-md w-full sm:w-64"
        />
        <input
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-200 bg-white px-3 py-2 text-sm rounded-md w-full sm:w-48"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border border-gray-200 bg-white px-3 py-2 text-sm rounded-md"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading}
          className="text-sm font-semibold bg-emerald-950 text-white px-4 py-2 rounded-md hover:bg-emerald-900 transition disabled:opacity-50"
        >
          {loading ? "Adding…" : "Add admin"}
        </button>
      </form>

      {msg && (
        <p className={`text-sm mb-4 ${msg.type === "error" ? "text-rose-600" : "text-emerald-700"}`}>
          {msg.text}
        </p>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            <th className="py-2 font-medium">Email</th>
            <th className="py-2 font-medium">Name</th>
            <th className="py-2 font-medium">Role</th>
            <th className="py-2 font-medium">Status</th>
            <th className="py-2 font-medium text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((a) => (
            <tr key={a.id} className="border-b border-gray-100 hover:bg-emerald-50 transition">
              <td className="py-3">
                {a.email}
                {isSelf(a) && <span className="ml-2 text-[11px] text-gray-400">(you)</span>}
              </td>
              <td className="py-3 text-gray-600">{a.full_name}</td>
              <td className="py-3">{a.role.replace(/_/g, " ")}</td>
              <td className="py-3">
                <span
                  className={`inline-block text-[11px] font-medium px-2 py-1 rounded-full border ${
                    a.is_active
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : "bg-gray-100 text-gray-500 border-gray-200"
                  }`}
                >
                  {a.is_active ? "Active" : "Disabled"}
                </span>
              </td>
              <td className="py-3 text-right space-x-2">
                <button
                  onClick={() => toggleActive(a)}
                  disabled={isSelf(a) && a.is_active}
                  className="text-xs border border-gray-200 px-3 py-1.5 rounded-md hover:border-emerald-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {a.is_active ? "Disable" : "Enable"}
                </button>
                <button
                  onClick={() => removeAdmin(a)}
                  disabled={isSelf(a)}
                  className="text-xs border border-rose-200 text-rose-700 px-3 py-1.5 rounded-md hover:bg-rose-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}