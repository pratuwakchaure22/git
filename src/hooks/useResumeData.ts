import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

// ─── Shared types for resume & portfolio data ───────────────────────────────

export interface ResumeProfile {
  full_name: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  avatar_url?: string;
  github_url?: string;
  linkedin_url?: string;
  website_url?: string;
}

export interface ResumeEducation {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  level?: string;
  board_university?: string;
  is_current?: boolean;
  percentage?: string;
  cgpa_gpa?: string;
  marks_obtained?: string;
  max_marks?: string;
  rank_distinction?: string;
  specialization?: string;
  relevant_subjects?: string;
  achievements?: string;
  description?: string;
}

export interface ResumeExperience {
  id: string;
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  description?: string;
}

export interface ResumeSkill {
  id: string;
  name: string;
  category?: string;
  proficiency?: number;
}

export interface ResumeProject {
  id: string;
  title: string;
  description?: string;
  technologies?: string[];
  github_url?: string;
  live_url?: string;
  image_url?: string;
  start_date?: string;
}

export interface ResumeAchievement {
  id: string;
  title: string;
  date?: string;
  description?: string;
  organization?: string;
  position?: string;
  image_url?: string;
}

export interface ResumeData {
  profile: ResumeProfile;
  education: ResumeEducation[];
  experience: ResumeExperience[];
  skills: ResumeSkill[];
  projects: ResumeProject[];
  achievements: ResumeAchievement[];
}

const defaultProfile: ResumeProfile = {
  full_name: "",
  role: "",
  email: "",
  phone: "",
  location: "",
  bio: "",
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useResumeData() {
  const { user, refreshProfile } = useAuth();
  const [data, setData] = useState<ResumeData>({
    profile: defaultProfile,
    education: [],
    experience: [],
    skills: [],
    projects: [],
    achievements: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError("");

    // Deterministic canonical profile query
    const profilePromise = user
      ? supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
      : supabase.from("profiles").select("*").order("created_at", { ascending: true }).limit(1).maybeSingle();

    const [profileRes, educationRes, experienceRes, skillsRes, projectsRes, achievementsRes] =
      await Promise.all([
        profilePromise,
        supabase.from("education").select("*").order("start_date", { ascending: false }),
        supabase.from("experience").select("*").order("start_date", { ascending: false }),
        supabase.from("skills").select("*").order("category"),
        supabase.from("projects").select("*").order("created_at", { ascending: false }),
        supabase.from("achievements").select("*").order("date", { ascending: false }),
      ]);

    const pData = profileRes.data;

    setData({
      profile: {
        full_name: pData?.full_name || user?.name || "",
        role: pData?.role_title || "",
        email: user?.email || "",
        phone: pData?.phone || "",
        location: pData?.location || "",
        bio: pData?.bio || "",
        avatar_url: pData?.avatar_url || "",
        github_url: pData?.github_url || "",
        linkedin_url: pData?.linkedin_url || "",
        website_url: pData?.website_url || "",
      },
      education: (educationRes.data || []).map((e: any) => ({
        id: e.id,
        institution: e.institution || "",
        degree: e.degree || "",
        field_of_study: e.field_of_study || "",
        start_date: e.start_date ? String(e.start_date) : "",
        end_date: e.end_date ? String(e.end_date) : "Present",
        level: e.level || "",
        board_university: e.board_university || "",
        is_current: e.is_current || false,
        percentage: e.percentage || "",
        cgpa_gpa: e.cgpa_gpa || "",
        marks_obtained: e.marks_obtained || "",
        max_marks: e.max_marks || "",
        rank_distinction: e.rank_distinction || "",
        specialization: e.specialization || "",
        relevant_subjects: e.relevant_subjects || "",
        achievements: e.achievements || "",
        description: e.description || "",
      })),
      experience: (experienceRes.data || []).map((e: any) => ({
        id: e.id,
        company: e.company,
        position: e.position,
        start_date: e.start_date ? String(e.start_date) : "",
        end_date: e.end_date ? String(e.end_date) : "Present",
        description: e.description,
      })),
      skills: (skillsRes.data || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        category: s.category || "General",
        proficiency: s.proficiency || 80,
      })),
      projects: (projectsRes.data || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        technologies: p.technologies || [],
        github_url: p.github_url,
        live_url: p.live_url,
        image_url: p.image_url || "",
        start_date: p.start_date || "",
      })),
      achievements: (achievementsRes.data || []).map((a: any) => ({
        id: a.id,
        title: a.title,
        date: a.date ? String(a.date) : "",
        description: a.description,
        organization: a.organization || "",
        position: a.position || "",
        image_url: a.image_url || "",
      })),
    });

    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ─── Mutators (Save → Refetch Pattern) ───────────────────────────────────

  async function saveProfile(updates: Partial<ResumeProfile>) {
    if (!user) return null;
    setIsSaving(true);

    const payload: Record<string, any> = {
      id: user.id,
      updated_at: new Date().toISOString(),
    };

    if (updates.full_name !== undefined) payload.full_name = updates.full_name;
    if (updates.bio !== undefined) payload.bio = updates.bio;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.location !== undefined) payload.location = updates.location;
    if (updates.role !== undefined) payload.role_title = updates.role;
    if (updates.avatar_url !== undefined) payload.avatar_url = updates.avatar_url;
    if (updates.github_url !== undefined) payload.github_url = updates.github_url;
    if (updates.linkedin_url !== undefined) payload.linkedin_url = updates.linkedin_url;
    if (updates.website_url !== undefined) payload.website_url = updates.website_url;

    const { error: dbError } = await supabase.from("profiles").upsert(payload);

    if (dbError) {
      console.error("Failed to save profile to Supabase profiles table:", dbError);
      setIsSaving(false);
      return dbError;
    }

    await refreshProfile();
    await fetchAll();
    setIsSaving(false);
    return null;
  }

  async function uploadAvatar(file: File): Promise<{ url?: string; error?: string }> {
    if (!user) return { error: "User not logged in" };
    setIsSaving(true);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const uploadRes = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadRes.error) {
        setIsSaving(false);
        return { error: `Storage upload failed: ${uploadRes.error.message}` };
      }

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
      const publicUrl = publicUrlData.publicUrl;

      const saveErr = await saveProfile({ avatar_url: publicUrl });
      if (saveErr) {
        setIsSaving(false);
        return { error: `Uploaded to storage, but failed to save to profiles.avatar_url: ${saveErr.message}` };
      }

      setIsSaving(false);
      return { url: publicUrl };
    } catch (err: any) {
      setIsSaving(false);
      return { error: err.message || "Failed to upload avatar" };
    }
  }

  async function addEducation(item: Omit<ResumeEducation, "id">) {
    if (!user) {
      const err = new Error("User not logged in");
      console.error("Education insert error:", err);
      return err;
    }

    const fullPayload: Record<string, any> = {
      user_id: user.id,
      institution: item.institution || "",
      degree: item.degree || "",
      field_of_study: item.field_of_study || "",
      start_date: item.start_date || "",
      end_date: item.end_date || "",
      level: item.level || "",
      board_university: item.board_university || "",
      is_current: item.is_current || false,
      percentage: item.percentage || "",
      cgpa_gpa: item.cgpa_gpa || "",
      marks_obtained: item.marks_obtained || "",
      max_marks: item.max_marks || "",
      rank_distinction: item.rank_distinction || "",
      specialization: item.specialization || "",
      relevant_subjects: item.relevant_subjects || "",
      achievements: item.achievements || "",
      description: item.description || "",
    };

    let { error } = await supabase.from("education").insert(fullPayload);

    if (error && (error.code === "PGRST204" || error.message?.includes("schema cache") || error.message?.includes("column"))) {
      console.warn("Supabase education table missing new schema columns. Retrying with schema fallback...", error.message);
      
      const fallbackDescription = [
        item.description || "",
        item.specialization ? `Specialization: ${item.specialization}` : "",
        item.relevant_subjects ? `Coursework: ${item.relevant_subjects}` : "",
      ].filter(Boolean).join(" | ");

      const fallbackPayload: Record<string, any> = {
        user_id: user.id,
        institution: item.institution || "",
        degree: item.degree || "",
        field_of_study: item.field_of_study || "",
        start_date: item.start_date || "",
        end_date: item.end_date || "",
        level: item.level || "",
        board_university: item.board_university || "",
        is_current: item.is_current || false,
        percentage: item.percentage || "",
        cgpa_gpa: item.cgpa_gpa || "",
        marks_obtained: item.marks_obtained || "",
        max_marks: item.max_marks || "",
        rank_distinction: item.rank_distinction || "",
        description: fallbackDescription,
      };

      const fallbackRes = await supabase.from("education").insert(fallbackPayload);
      error = fallbackRes.error;
    }

    if (error) {
      console.error("Failed to add education record to Supabase:", error);
    } else {
      await fetchAll();
    }
    return error;
  }

  async function updateEducation(id: string, item: Partial<ResumeEducation>) {
    if (!user) {
      const err = new Error("User not logged in");
      console.error("Education update error:", err);
      return err;
    }

    const { id: _ignoredId, ...updates } = item as any;

    let { error } = await supabase
      .from("education")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id);

    if (error && (error.code === "PGRST204" || error.message?.includes("schema cache") || error.message?.includes("column"))) {
      console.warn("Supabase education table missing new schema columns on update. Retrying with schema fallback...", error.message);
      
      const fallbackUpdates = { ...updates };
      delete fallbackUpdates.specialization;
      delete fallbackUpdates.relevant_subjects;
      delete fallbackUpdates.achievements;

      if (item.specialization || item.relevant_subjects) {
        fallbackUpdates.description = [
          item.description || "",
          item.specialization ? `Specialization: ${item.specialization}` : "",
          item.relevant_subjects ? `Coursework: ${item.relevant_subjects}` : "",
        ].filter(Boolean).join(" | ");
      }

      const fallbackRes = await supabase
        .from("education")
        .update(fallbackUpdates)
        .eq("id", id)
        .eq("user_id", user.id);
      error = fallbackRes.error;
    }

    if (error) {
      console.error("Failed to update education record in Supabase:", error);
    } else {
      await fetchAll();
    }
    return error;
  }

  async function deleteEducation(id: string) {
    if (!user) {
      const err = new Error("User not logged in");
      console.error("Education delete error:", err);
      return err;
    }
    const { error, count } = await supabase
      .from("education")
      .delete({ count: "exact" })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to delete education record from Supabase:", error);
      return error;
    }

    if (count === 0) {
      const err = new Error("Education record not found or permission denied");
      console.error("Delete education error:", err);
      return err;
    }

    setData((prev) => ({
      ...prev,
      education: prev.education.filter((item) => item.id !== id),
    }));
    await fetchAll();
    return null;
  }

  async function addExperience(item: Omit<ResumeExperience, "id">) {
    if (!user) return;
    const { error } = await supabase
      .from("experience")
      .insert({ ...item, user_id: user.id });
    if (!error) {
      await fetchAll();
    }
    return error;
  }

  async function updateExperience(id: string, item: Partial<ResumeExperience>) {
    const { error } = await supabase.from("experience").update(item).eq("id", id);
    if (!error) {
      await fetchAll();
    }
    return error;
  }

  async function deleteExperience(id: string) {
    const { error } = await supabase.from("experience").delete().eq("id", id);
    if (!error) {
      await fetchAll();
    }
    return error;
  }

  async function addSkill(item: Omit<ResumeSkill, "id">) {
    if (!user) return;
    const { error } = await supabase
      .from("skills")
      .insert({ ...item, user_id: user.id });
    if (!error) {
      await fetchAll();
    }
    return error;
  }

  async function updateSkill(id: string, item: Partial<ResumeSkill>) {
    const { error } = await supabase.from("skills").update(item).eq("id", id);
    if (!error) {
      await fetchAll();
    }
    return error;
  }

  async function deleteSkill(id: string) {
    const { error } = await supabase.from("skills").delete().eq("id", id);
    if (!error) {
      await fetchAll();
    }
    return error;
  }

  async function addProject(item: Omit<ResumeProject, "id">) {
    if (!user) return;
    const { error } = await supabase
      .from("projects")
      .insert({ ...item, technologies: item.technologies, user_id: user.id });
    if (!error) {
      await fetchAll();
    }
    return error;
  }

  async function updateProject(id: string, item: Partial<ResumeProject>) {
    const { error } = await supabase.from("projects").update(item).eq("id", id);
    if (!error) {
      await fetchAll();
    }
    return error;
  }

  async function deleteProject(id: string) {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (!error) {
      await fetchAll();
    }
    return error;
  }

  async function addAchievement(item: Omit<ResumeAchievement, "id">) {
    if (!user) return;
    const { error } = await supabase
      .from("achievements")
      .insert({ ...item, user_id: user.id });
    if (!error) {
      await fetchAll();
    }
    return error;
  }

  async function updateAchievement(id: string, item: Partial<ResumeAchievement>) {
    const { error } = await supabase.from("achievements").update(item).eq("id", id);
    if (!error) {
      await fetchAll();
    }
    return error;
  }

  async function deleteAchievement(id: string) {
    const { error } = await supabase.from("achievements").delete().eq("id", id);
    if (!error) {
      await fetchAll();
    }
    return error;
  }

  async function uploadProjectImage(file: File, projectId: string): Promise<{ url?: string; error?: string }> {
    if (!user) return { error: "Not authenticated" };
    if (!file.type.startsWith("image/")) return { error: "File must be an image (JPEG, PNG, WebP)" };
    if (file.size > 10 * 1024 * 1024) return { error: "Image must be under 10 MB" };
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `${user.id}/projects/${projectId}-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("portfolio-images")
        .upload(filePath, file, { upsert: true });
      if (uploadErr) return { error: `Upload failed: ${uploadErr.message}` };
      const { data: urlData } = supabase.storage.from("portfolio-images").getPublicUrl(filePath);
      const { error: dbErr } = await supabase.from("projects").update({ image_url: urlData.publicUrl }).eq("id", projectId);
      if (dbErr) return { error: `Uploaded but DB update failed: ${dbErr.message}` };
      await fetchAll();
      return { url: urlData.publicUrl };
    } catch (err: any) {
      return { error: err.message || "Failed to upload image" };
    }
  }

  async function uploadAchievementImage(file: File, achievementId: string): Promise<{ url?: string; error?: string }> {
    if (!user) return { error: "Not authenticated" };
    if (!file.type.startsWith("image/")) return { error: "File must be an image (JPEG, PNG, WebP)" };
    if (file.size > 10 * 1024 * 1024) return { error: "Image must be under 10 MB" };
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `${user.id}/achievements/${achievementId}-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("portfolio-images")
        .upload(filePath, file, { upsert: true });
      if (uploadErr) return { error: `Upload failed: ${uploadErr.message}` };
      const { data: urlData } = supabase.storage.from("portfolio-images").getPublicUrl(filePath);
      const { error: dbErr } = await supabase.from("achievements").update({ image_url: urlData.publicUrl }).eq("id", achievementId);
      if (dbErr) return { error: `Uploaded but DB update failed: ${dbErr.message}` };
      await fetchAll();
      return { url: urlData.publicUrl };
    } catch (err: any) {
      return { error: err.message || "Failed to upload image" };
    }
  }

  return {
    data,
    isLoading,
    isSaving,
    error,
    refetch: fetchAll,
    saveProfile,
    uploadAvatar,
    addEducation,
    updateEducation,
    deleteEducation,
    addExperience,
    updateExperience,
    deleteExperience,
    addSkill,
    updateSkill,
    deleteSkill,
    addProject,
    updateProject,
    deleteProject,
    uploadProjectImage,
    addAchievement,
    updateAchievement,
    deleteAchievement,
    uploadAchievementImage,
  };
}
