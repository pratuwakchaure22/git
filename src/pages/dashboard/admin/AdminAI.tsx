import { useState } from "react";
import { Bot, Key, Zap, Shield } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Switch } from "@/components/ui/Switch";
import { Input } from "@/components/ui/Input";

export default function AdminAI() {
  const [settings, setSettings] = useState({
    provider: "openai",
    model: "gpt-4o",
    temperature: "0.7",
    maxTokens: "2000",
    systemPrompt: "You are Pratik's personal AI assistant. You have access to his workspace including notes, tasks, documents, and reminders. Be concise, helpful, and professional.",
    canReadNotes: true,
    canReadDocs: true,
    canCreateTasks: true,
    canCreateReminders: true,
    canReadDrive: false,
    canModifyProfile: false,
    logConversations: true,
    rateLimit: true,
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="AI Settings"
        breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }, { label: "AI Settings" }]}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {/* Provider settings */}
        <div className="rounded-2xl border border-[#2A2A3A] bg-[#1B1B28] overflow-hidden shadow-lg shadow-black/20">
          <div className="flex items-center gap-2.5 border-b border-[#2A2A3A] px-5 py-3.5 bg-[#171824]">
            <Bot className="h-4 w-4 text-[#4F7CFF]" />
            <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-[#F4F4F7]">Provider & Model</h3>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#9A9AA8]">Provider</label>
              <select
                value={settings.provider}
                onChange={(e) => setSettings((s) => ({ ...s, provider: e.target.value }))}
                className="w-full rounded-xl border border-[#2A2A3A] bg-[#20202E] px-3.5 py-2 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="google">Google AI</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#9A9AA8]">Model</label>
              <select
                value={settings.model}
                onChange={(e) => setSettings((s) => ({ ...s, model: e.target.value }))}
                className="w-full rounded-xl border border-[#2A2A3A] bg-[#20202E] px-3.5 py-2 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]"
              >
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              </select>
            </div>
            <Input
              label="Temperature"
              value={settings.temperature}
              onChange={(e) => setSettings((s) => ({ ...s, temperature: e.target.value }))}
              type="number"
              min="0"
              max="2"
              step="0.1"
              hint="0 = deterministic, 2 = creative"
            />
            <Input
              label="Max Tokens"
              value={settings.maxTokens}
              onChange={(e) => setSettings((s) => ({ ...s, maxTokens: e.target.value }))}
              type="number"
              hint="Maximum response length"
            />
          </div>
        </div>

        {/* API keys */}
        <div className="rounded-2xl border border-[#2A2A3A] bg-[#1B1B28] overflow-hidden shadow-lg shadow-black/20">
          <div className="flex items-center gap-2.5 border-b border-[#2A2A3A] px-5 py-3.5 bg-[#171824]">
            <Key className="h-4 w-4 text-[#9B4DFF]" />
            <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-[#F4F4F7]">API Keys</h3>
          </div>
          <div className="p-5 space-y-4">
            <Input label="OpenAI API Key" type="password" placeholder="sk-..." hint="Stored encrypted in Supabase Vault" />
            <Input label="Anthropic API Key" type="password" placeholder="sk-ant-..." hint="Required for Claude models" />
            <Input label="Google AI Key" type="password" placeholder="AIza..." hint="Required for Gemini models" />
            <div
              className="rounded-xl border border-[#FFC43D]/30 bg-[#FFC43D]/10 px-4 py-3 text-xs text-[#FFC43D]"
            >
              API keys connected to Supabase Edge Function secrets.
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="rounded-2xl border border-[#2A2A3A] bg-[#1B1B28] overflow-hidden shadow-lg shadow-black/20">
          <div className="flex items-center gap-2.5 border-b border-[#2A2A3A] px-5 py-3.5 bg-[#171824]">
            <Shield className="h-4 w-4 text-[#48C774]" />
            <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-[#F4F4F7]">AI Permissions</h3>
          </div>
          <div className="p-5 space-y-4">
            <Switch checked={settings.canReadNotes} onChange={(v) => setSettings((s) => ({ ...s, canReadNotes: v }))} label="Read Notes" description="AI can access and reference notes" />
            <Switch checked={settings.canReadDocs} onChange={(v) => setSettings((s) => ({ ...s, canReadDocs: v }))} label="Read Documents" description="AI can access AI-enabled documents" />
            <Switch checked={settings.canCreateTasks} onChange={(v) => setSettings((s) => ({ ...s, canCreateTasks: v }))} label="Create Tasks" description="AI can create tasks on confirmation" />
            <Switch checked={settings.canCreateReminders} onChange={(v) => setSettings((s) => ({ ...s, canCreateReminders: v }))} label="Create Reminders" description="AI can set reminders" />
            <Switch checked={settings.canReadDrive} onChange={(v) => setSettings((s) => ({ ...s, canReadDrive: v }))} label="Access Google Drive" description="AI can search Drive files" />
            <Switch checked={settings.canModifyProfile} onChange={(v) => setSettings((s) => ({ ...s, canModifyProfile: v }))} label="Modify Profile" description="AI can update profile data" />
          </div>
        </div>

        {/* System prompt */}
        <div className="rounded-2xl border border-[#2A2A3A] bg-[#1B1B28] overflow-hidden shadow-lg shadow-black/20">
          <div className="flex items-center gap-2.5 border-b border-[#2A2A3A] px-5 py-3.5 bg-[#171824]">
            <Zap className="h-4 w-4 text-[#FFC43D]" />
            <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-[#F4F4F7]">System Prompt</h3>
          </div>
          <div className="p-5 space-y-3">
            <textarea
              value={settings.systemPrompt}
              onChange={(e) => setSettings((s) => ({ ...s, systemPrompt: e.target.value }))}
              rows={8}
              className="w-full resize-y rounded-xl border border-[#2A2A3A] bg-[#20202E] p-3.5 font-mono text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]"
            />
            <Switch checked={settings.logConversations} onChange={(v) => setSettings((s) => ({ ...s, logConversations: v }))} label="Log Conversations" description="Store conversation history in database" />
            <Switch checked={settings.rateLimit} onChange={(v) => setSettings((s) => ({ ...s, rateLimit: v }))} label="Rate Limiting" description="Limit API calls to prevent excessive usage" />
          </div>
        </div>
      </div>

      <button
        type="button"
        className="rounded-xl bg-[#4F7CFF] px-5 py-2.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-[#3b66e0] hover:-translate-y-0.5"
      >
        Save AI Settings
      </button>
    </div>
  );
}
