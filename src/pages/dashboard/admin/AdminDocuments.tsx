import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Download, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export default function AdminDocuments() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [docList, setDocList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    const { data } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setDocList(
        data.map((d: any) => ({
          id: d.id,
          name: d.name,
          category: d.category || "General",
          size: typeof d.size === "number" ? `${(d.size / 1024).toFixed(1)} KB` : d.size || "—",
          aiAccess: d.ai_access || false,
          updatedAt: d.created_at ? new Date(d.created_at).toLocaleDateString() : "2026",
          file_url: d.file_url,
        }))
      );
    } else {
      setDocList([]);
    }
  }

  async function handleDownload(doc: any) {
    if (!user) return;
    let path = doc.file_url || "";
    if (path.includes("/object/public/documents/")) {
      path = path.split("/object/public/documents/")[1] || path;
    } else if (path.includes("/object/authenticated/documents/")) {
      path = path.split("/object/authenticated/documents/")[1] || path;
    }

    const targetPath = path.startsWith(`${user.id}/`) ? path : `${user.id}/${path}`;

    const { data: signedData } = await supabase.storage
      .from("documents")
      .createSignedUrl(targetPath, 3600, { download: doc.name });

    if (signedData?.signedUrl) {
      window.open(signedData.signedUrl, "_blank");
    } else if (doc.file_url?.startsWith("http")) {
      window.open(doc.file_url, "_blank");
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);

    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadErr } = await supabase.storage.from("documents").upload(filePath, file);

    if (!uploadErr) {
      await supabase.from("documents").insert({
        user_id: user.id,
        name: file.name,
        file_url: filePath,
        size: file.size,
        type: file.name.split(".").pop() || "file",
        category: "general",
      });
      fetchDocuments();
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this document?")) return;
    await supabase.from("documents").delete().eq("id", id);
    setDocList((prev) => prev.filter((d) => d.id !== id));
  }

  const filtered = docList.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Documents"
        breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }, { label: "Documents" }]}
        actions={
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 rounded-xl bg-[#4F7CFF] px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:bg-[#3b66e0] hover:-translate-y-0.5 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {uploading ? "Uploading..." : "Upload Document"}
            </button>
          </>
        }
      />
      <div className="relative max-w-xs">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search documents..."
          className="w-full rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-3.5 py-2 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]"
        />
      </div>
      <div className="rounded-2xl border border-[#2A2A3A] bg-[#1B1B28] overflow-hidden shadow-lg shadow-black/20">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2A2A3A] bg-[#171824]">
              {["Name", "Category", "Size", "AI Access", "Updated", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-[#9A9AA8]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} className="border-b border-[#2A2A3A] transition-colors hover:bg-[#20202E]/60">
                <td className="px-4 py-3 text-xs font-semibold text-[#F4F4F7]">{d.name}</td>
                <td className="px-4 py-3">
                  <span className="rounded-lg border border-[#2A2A3A] bg-[#20202E] px-2.5 py-0.5 font-mono text-[10px] capitalize text-[#9A9AA8]">{d.category}</span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-[#9A9AA8]">{d.size}</td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs" style={{ color: d.aiAccess ? "#4F7CFF" : "#9A9AA8" }}>
                    {d.aiAccess ? "Enabled" : "Disabled"}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-[#9A9AA8]">{d.updatedAt}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button type="button" onClick={() => handleDownload(d)} className="rounded-lg p-1.5 text-[#4F7CFF] transition-colors hover:bg-[#4F7CFF]/10 cursor-pointer" title="Download">
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => handleDelete(d.id)} className="rounded-lg p-1.5 text-[#FF5C6C] transition-colors hover:bg-[#FF5C6C]/10"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
