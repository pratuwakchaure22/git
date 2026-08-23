import { useState, useEffect, useRef } from "react";
import { Upload, Grid, List, Trash2, Download, Eye } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import type { Document, DocumentCategory } from "@/types";

const categories: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "academic", label: "Academic" },
  { value: "research", label: "Research" },
  { value: "projects", label: "Projects" },
  { value: "certificates", label: "Certificates" },
  { value: "resume", label: "Resume" },
  { value: "personal", label: "Personal" },
  { value: "important", label: "Important" },
  { value: "other", label: "Other" },
];

const typeIcons: Record<string, string> = {
  pdf: "📄",
  docx: "📝",
  xlsx: "📊",
  pptx: "📑",
  txt: "📃",
  md: "📋",
  jpg: "🖼️",
  png: "🖼️",
  zip: "🗜️",
};

function formatBytes(bytes: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getExtension(name: string): string {
  return name.split(".").pop()?.toLowerCase() || "other";
}

export default function Documents() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [view, setView] = useState<"list" | "grid">("list");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) fetchDocuments();
  }, [user]);

  async function fetchDocuments() {
    setIsLoading(true);
    setError("");
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError("Failed to load documents.");
      console.error(error);
    } else if (data) {
      const mapped: Document[] = data.map((d: any) => ({
        id: d.id,
        name: d.name,
        type: (getExtension(d.name) as any) || "other",
        size: typeof d.size === "number" ? formatBytes(d.size) : d.size || "—",
        category: (d.category || "other") as DocumentCategory,
        tags: d.tags || [],
        aiAccess: d.ai_access || false,
        uploadedAt: d.created_at,
        updatedAt: d.updated_at || d.created_at,
        description: d.description,
      }));
      setDocuments(mapped);
    }
    setIsLoading(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    // Path: {userId}/{timestamp}-{filename} — matches storage RLS policy that
    // scopes writes to (storage.foldername(name))[1] = auth.uid()::text
    const filePath = `${user.id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      setError("Failed to upload file.");
      setIsUploading(false);
      return;
    }

    // Documents bucket is private — store the path and generate signed URLs on demand.
    // For display, we save the storage path (not a public URL).
    const { error: dbError } = await supabase.from("documents").insert({
      user_id: user.id,
      name: file.name,
      file_url: filePath,
      size: file.size,
      type: getExtension(file.name),
      category: "other",
    });

    if (dbError) {
      console.error("DB error:", dbError);
      setError("File uploaded but metadata save failed.");
    }

    setIsUploading(false);
    fetchDocuments();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }


  async function deleteDocument(id: string, name: string) {
    if (!confirm("Delete this document?")) return;
    setDocuments((prev) => prev.filter((d) => d.id !== id));

    // Try to delete from storage too
    if (user) {
      const { data: listData } = await supabase.storage
        .from("documents")
        .list(user.id);
      const storageFile = listData?.find((f) => f.name.includes(name));
      if (storageFile) {
        await supabase.storage.from("documents").remove([`${user.id}/${storageFile.name}`]);
      }
    }

    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) { console.error(error); fetchDocuments(); }
  }

  async function downloadDocument(doc: Document & { file_url?: string }, isDownload = true) {
    if (!user) return;
    const { data: dbData } = await supabase.from("documents").select("file_url, name").eq("id", doc.id).single();
    if (!dbData?.file_url) return;

    let path = dbData.file_url;
    if (path.includes("/object/public/documents/")) {
      path = path.split("/object/public/documents/")[1] || path;
    } else if (path.includes("/object/authenticated/documents/")) {
      path = path.split("/object/authenticated/documents/")[1] || path;
    }

    const targetPath = path.startsWith(`${user.id}/`) ? path : `${user.id}/${path}`;

    const { data: signedData, error: signedErr } = await supabase.storage
      .from("documents")
      .createSignedUrl(targetPath, 3600, isDownload ? { download: doc.name } : undefined);

    if (signedData?.signedUrl) {
      window.open(signedData.signedUrl, "_blank");
    } else if (dbData.file_url.startsWith("http")) {
      window.open(dbData.file_url, "_blank");
    } else {
      console.error("Signed URL error:", signedErr);
    }
  }

  const filtered = documents.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.tags.some((t) => t.includes(search.toLowerCase()));
    const matchCat = category === "all" || d.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <PageHeader
        title="Documents"
        description="All your files, organized by category."
        actions={
          <>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              id="doc-upload"
              onChange={handleUpload}
            />
            <label
              htmlFor="doc-upload"
              className="flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: "#2a8c82", opacity: isUploading ? 0.6 : 1 }}
            >
              <Upload className="h-4 w-4" />
              {isUploading ? "Uploading..." : "Upload"}
            </label>
          </>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar value={search} onChange={setSearch} placeholder="Search documents..." className="max-w-xs" />
        <div className="flex items-center gap-2">
          <div className="flex gap-1 overflow-x-auto">
            {categories.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                className="flex-shrink-0 rounded border px-2.5 py-1 font-mono text-xs transition-colors"
                style={{
                  borderColor: category === c.value ? "#2a8c82" : "#2e3540",
                  backgroundColor: category === c.value ? "#2a8c82" : "#1e232b",
                  color: category === c.value ? "#fff" : "#8f97a5",
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="flex rounded border" style={{ borderColor: "#2e3540" }}>
            <button
              type="button"
              onClick={() => setView("list")}
              className="rounded-l p-1.5 transition-colors"
              style={{ backgroundColor: view === "list" ? "#2a8c82" : "#1e232b", color: view === "list" ? "#fff" : "#8f97a5" }}
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setView("grid")}
              className="rounded-r p-1.5 transition-colors"
              style={{ backgroundColor: view === "grid" ? "#2a8c82" : "#1e232b", color: view === "grid" ? "#fff" : "#8f97a5" }}
            >
              <Grid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <p className="font-mono text-xs" style={{ color: "#8f97a5" }}>
        {isLoading ? "Loading..." : `${filtered.length} document${filtered.length !== 1 ? "s" : ""}`}
      </p>

      {/* List view */}
      {view === "list" && (
        <div className="rounded border overflow-hidden" style={{ borderColor: "#2e3540" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#1e232b", borderBottom: "1px solid #2e3540" }}>
                <th className="px-4 py-3 text-left font-mono text-xs font-medium uppercase tracking-wider" style={{ color: "#5b6472" }}>File</th>
                <th className="hidden px-4 py-3 text-left font-mono text-xs font-medium uppercase tracking-wider sm:table-cell" style={{ color: "#5b6472" }}>Category</th>
                <th className="hidden px-4 py-3 text-left font-mono text-xs font-medium uppercase tracking-wider md:table-cell" style={{ color: "#5b6472" }}>Size</th>
                <th className="hidden px-4 py-3 text-left font-mono text-xs font-medium uppercase tracking-wider lg:table-cell" style={{ color: "#5b6472" }}>Updated</th>
                <th className="hidden px-4 py-3 text-left font-mono text-xs font-medium uppercase tracking-wider lg:table-cell" style={{ color: "#5b6472" }}>AI Access</th>
                <th className="px-4 py-3 text-right font-mono text-xs font-medium uppercase tracking-wider" style={{ color: "#5b6472" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <p className="text-sm" style={{ color: "#8f97a5" }}>No documents found.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((doc) => (
                  <tr key={doc.id} className="transition-colors" style={{ borderBottom: "1px solid #2e3540" }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{typeIcons[doc.type] ?? "📄"}</span>
                        <div>
                          <p className="text-xs font-medium" style={{ color: "#e9ebf0" }}>{doc.name}</p>
                          {doc.tags.length > 0 && (
                            <div className="mt-0.5 flex gap-1">
                              {doc.tags.slice(0, 2).map((t) => (
                                <span key={t} className="rounded px-1.5 py-0.5 font-mono text-[10px]" style={{ backgroundColor: "#252c36", color: "#8f97a5" }}>
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className="rounded border px-2 py-0.5 font-mono text-[10px] capitalize" style={{ borderColor: "#2e3540", color: "#8f97a5" }}>
                        {doc.category}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 font-mono text-xs md:table-cell" style={{ color: "#8f97a5" }}>{doc.size}</td>
                    <td className="hidden px-4 py-3 font-mono text-xs lg:table-cell" style={{ color: "#8f97a5" }}>
                      {new Date(doc.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <span
                        className="rounded border px-2 py-0.5 font-mono text-[10px]"
                        style={{
                          borderColor: doc.aiAccess ? "#2a8c82" : "#2e3540",
                          color: doc.aiAccess ? "#2a8c82" : "#5b6472",
                          backgroundColor: doc.aiAccess ? "#1a302e" : "transparent",
                        }}
                      >
                        {doc.aiAccess ? "Enabled" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button type="button" className="rounded p-1.5 transition-colors hover:opacity-80" style={{ color: "#8f97a5" }} title="View" onClick={() => downloadDocument(doc as any)}>
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" className="rounded p-1.5 transition-colors hover:opacity-80" style={{ color: "#8f97a5" }} title="Download" onClick={() => downloadDocument(doc as any)}>
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" className="rounded p-1.5 transition-colors hover:opacity-80" style={{ color: "#c0392b" }} title="Delete" onClick={() => deleteDocument(doc.id, doc.name)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid view */}
      {view === "grid" && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="group rounded border p-3 text-center transition-all hover:border-[#2a8c82]/50"
              style={{ backgroundColor: "#1e232b", borderColor: "#2e3540" }}
            >
              <div className="mb-2 text-3xl">{typeIcons[doc.type] ?? "📄"}</div>
              <p className="truncate text-xs font-medium" style={{ color: "#e9ebf0" }}>{doc.name}</p>
              <p className="mt-0.5 font-mono text-[10px]" style={{ color: "#5b6472" }}>{doc.size}</p>
              <div className="mt-2 flex justify-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button type="button" className="rounded p-1 transition-colors hover:opacity-80" style={{ color: "#8f97a5" }} onClick={() => downloadDocument(doc as any)}>
                  <Eye className="h-3 w-3" />
                </button>
                <button type="button" className="rounded p-1 transition-colors hover:opacity-80" style={{ color: "#8f97a5" }} onClick={() => downloadDocument(doc as any)}>
                  <Download className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && !isLoading && (
            <div className="col-span-full py-12 text-center">
              <p className="text-sm" style={{ color: "#8f97a5" }}>No documents found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
