import { useState } from "react";
import { Cloud, RefreshCw, Star, Folder, FileText, FileSpreadsheet, Presentation, File, Image, ExternalLink } from "lucide-react";
import { mockDriveFiles, driveAccount, isDriveConnected, starredFiles } from "@/data/mockDrive";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { Switch } from "@/components/ui/Switch";
import type { DriveFileType } from "@/types";

function DriveFileIcon({ type }: { type: DriveFileType }) {
  const cls = "h-5 w-5 flex-shrink-0";
  switch (type) {
    case "folder": return <Folder className={cls} style={{ color: "#2a8c82" }} />;
    case "document": return <FileText className={cls} style={{ color: "#4285f4" }} />;
    case "spreadsheet": return <FileSpreadsheet className={cls} style={{ color: "#0f9d58" }} />;
    case "presentation": return <Presentation className={cls} style={{ color: "#f4b400" }} />;
    case "pdf": return <File className={cls} style={{ color: "#c0392b" }} />;
    case "image": return <Image className={cls} style={{ color: "#9c27b0" }} />;
    default: return <File className={cls} style={{ color: "#8f97a5" }} />;
  }
}

export default function Drive() {
  const [connected] = useState(isDriveConnected);
  const [aiAccess, setAiAccess] = useState(true);
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);

  async function handleSync() {
    setSyncing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSyncing(false);
  }

  const filtered = mockDriveFiles.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!connected) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <PageHeader title="Google Drive" description="Connect your Google Drive to access files from your workspace." />
        <div
          className="flex flex-col items-center gap-6 rounded border py-16 text-center"
          style={{ backgroundColor: "#1e232b", borderColor: "#2e3540" }}
        >
          <Cloud className="h-12 w-12" style={{ color: "#8f97a5" }} />
          <div>
            <h2 className="font-display text-lg font-semibold" style={{ color: "#e9ebf0" }}>Connect Google Drive</h2>
            <p className="mt-1 text-sm" style={{ color: "#8f97a5" }}>
              Link your Google account to access and search your Drive files from this workspace.
            </p>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded px-6 py-3 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "#2a8c82" }}
          >
            <Cloud className="h-4 w-4" />
            Connect Google Drive
          </button>
          <p className="font-mono text-xs" style={{ color: "#5b6472" }}>
            OAuth integration will be implemented in the next phase.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <PageHeader
        title="Google Drive"
        description="Browse and manage your Google Drive files."
        actions={
          <button
            type="button"
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 rounded border px-3 py-2 text-xs font-medium transition-colors hover:border-[#2a8c82]/50 disabled:opacity-50"
            style={{ borderColor: "#2e3540", color: "#8f97a5" }}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync"}
          </button>
        }
      />

      {/* Account status card */}
      <div className="rounded border p-4" style={{ backgroundColor: "#1e232b", borderColor: "#2e3540" }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: "#2a8c82" }}>
              <span className="font-display text-sm font-semibold text-white">G</span>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "#e9ebf0" }}>{driveAccount.name}</p>
              <p className="font-mono text-xs" style={{ color: "#8f97a5" }}>{driveAccount.email}</p>
            </div>
            <span className="rounded border px-2 py-0.5 font-mono text-[10px]" style={{ borderColor: "#2a8c82", color: "#2a8c82", backgroundColor: "#1a302e" }}>
              Connected
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <p className="font-mono text-xs" style={{ color: "#5b6472" }}>Storage</p>
              <p className="text-sm font-medium" style={{ color: "#e9ebf0" }}>
                {driveAccount.usedStorage} / {driveAccount.totalStorage}
              </p>
              <div className="mt-1 h-1 w-24 rounded-full" style={{ backgroundColor: "#252c36" }}>
                <div
                  className="h-1 rounded-full"
                  style={{ width: `${driveAccount.usedPercent}%`, backgroundColor: "#2a8c82" }}
                />
              </div>
            </div>

            <Switch
              checked={aiAccess}
              onChange={setAiAccess}
              label="AI Access"
              description="Allow AI to read Drive files"
            />
          </div>
        </div>

        <p className="mt-3 font-mono text-[10px]" style={{ color: "#5b6472" }}>
          Last synced: {new Date(driveAccount.lastSynced).toLocaleString("en-IN")}
        </p>
      </div>

      {/* Search */}
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search Drive files..."
        className="max-w-sm"
      />

      {/* Starred */}
      {!search && (
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider" style={{ color: "#5b6472" }}>
            <Star className="h-3.5 w-3.5" style={{ color: "#b8763a" }} />
            Starred
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {starredFiles.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-2.5 rounded border px-3 py-2.5 transition-colors hover:border-[#2a8c82]/50"
                style={{ backgroundColor: "#1e232b", borderColor: "#2e3540" }}
              >
                <DriveFileIcon type={f.type} />
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium" style={{ color: "#e9ebf0" }}>{f.name}</p>
                  <p className="font-mono text-[10px]" style={{ color: "#5b6472" }}>{f.modifiedAt}</p>
                </div>
                {f.webViewLink && (
                  <a href={f.webViewLink} className="ml-auto flex-shrink-0" style={{ color: "#8f97a5" }}>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All files */}
      <div>
        <h3 className="mb-2 font-mono text-xs uppercase tracking-wider" style={{ color: "#5b6472" }}>
          {search ? `Results (${filtered.length})` : "All Files"}
        </h3>
        <div className="rounded border overflow-hidden" style={{ borderColor: "#2e3540" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#1e232b", borderBottom: "1px solid #2e3540" }}>
                <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider" style={{ color: "#5b6472" }}>Name</th>
                <th className="hidden px-4 py-3 text-left font-mono text-xs uppercase tracking-wider sm:table-cell" style={{ color: "#5b6472" }}>Owner</th>
                <th className="hidden px-4 py-3 text-left font-mono text-xs uppercase tracking-wider md:table-cell" style={{ color: "#5b6472" }}>Modified</th>
                <th className="hidden px-4 py-3 text-left font-mono text-xs uppercase tracking-wider lg:table-cell" style={{ color: "#5b6472" }}>Size</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id} className="transition-colors" style={{ borderBottom: "1px solid #2e3540" }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <DriveFileIcon type={f.type} />
                      <div>
                        <p className="text-xs font-medium" style={{ color: "#e9ebf0" }}>{f.name}</p>
                        {f.shared && <span className="font-mono text-[10px]" style={{ color: "#8f97a5" }}>Shared</span>}
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-xs sm:table-cell" style={{ color: "#8f97a5" }}>
                    {f.owner === driveAccount.email ? "Me" : f.owner}
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-xs md:table-cell" style={{ color: "#8f97a5" }}>
                    {f.modifiedAt}
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-xs lg:table-cell" style={{ color: "#8f97a5" }}>
                    {f.size ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
