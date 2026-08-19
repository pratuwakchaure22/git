import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabase";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarUrl?: string;
  role: "user" | "admin";
}

interface AuthContextValue {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "U"
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        mapSupabaseUser(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        mapSupabaseUser(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function mapSupabaseUser(supabaseUser: any) {
    const email = supabaseUser.email || "";
    const metaName =
      supabaseUser.user_metadata?.full_name || email.split("@")[0];

    try {
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", supabaseUser.id)
        .maybeSingle();

      if (profileErr) {
        console.warn("Profile fetch failed (falling back to session data):", profileErr.message);
      }

      const name = profile?.full_name || metaName;

      setUser({
        id: supabaseUser.id,
        name,
        email,
        initials: getInitials(name),
        avatarUrl: profile?.avatar_url || supabaseUser.user_metadata?.avatar_url,
        role: profile?.role || "user",
      });
    } catch (err) {
      console.error("Unexpected error mapping user profile:", err);
      setUser({
        id: supabaseUser.id,
        name: metaName,
        email,
        initials: getInitials(metaName),
        avatarUrl: supabaseUser.user_metadata?.avatar_url,
        role: "user",
      });
    } finally {
      setIsLoading(false);
    }
  }



  async function login(email: string, password: string): Promise<void> {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setIsLoading(false);
      throw error;
    }
  }

  async function loginWithGoogle(): Promise<void> {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/dashboard",
      },
    });
    if (error) {
      setIsLoading(false);
      throw error;
    }
  }

  async function logout(): Promise<void> {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setIsLoading(false);
  }

  async function refreshProfile(): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await mapSupabaseUser(session.user);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: user !== null,
        user,
        login,
        loginWithGoogle,
        logout,
        refreshProfile,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
