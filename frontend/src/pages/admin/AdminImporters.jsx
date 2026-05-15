import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function AdminImporters() {
  const [users, setUsers] = useState([]);
  useEffect(() => { api.get("/admin/users").then((r) => setUsers((r.data || []).filter((u) => u.role !== "admin"))); }, []);

  return (
    <div className="space-y-6" data-testid="admin-importers-page">
      <div>
        <p className="label-eyebrow">Importer management</p>
        <h1 className="font-heading text-3xl text-navy mt-1">Registered importers ({users.length})</h1>
      </div>
      <div className="card-flat overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-navy-50 text-navy">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Phone</th>
              <th className="text-left p-4">Auth</th>
              <th className="text-left p-4">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-navy/55" data-testid="no-importers">No importers registered yet.</td></tr>}
            {users.map((u) => (
              <tr key={u.user_id} className="border-t border-border" data-testid={`importer-${u.user_id}`}>
                <td className="p-4 font-heading text-navy">{u.name}</td>
                <td className="p-4 text-navy/75">{u.email}</td>
                <td className="p-4 text-navy/75">{u.phone || "—"}</td>
                <td className="p-4 text-xs"><span className="px-2 py-1 rounded-full bg-navy-50 text-navy capitalize">{u.auth_provider}</span></td>
                <td className="p-4 text-xs text-navy/55">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
