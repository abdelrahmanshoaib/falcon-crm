"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserProfile, UserRole } from "@/types/crm";
import { initialProfiles } from "@/lib/seed-data";
import { db } from "@/lib/db";

interface AuthContextType {
  currentUser: UserProfile;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  loginAsUser: (userId: string) => boolean;
  loginWithProfile: (profile: UserProfile) => void;
  logout: () => void;
  can: (action: string) => boolean;
  allProfiles: UserProfile[];
  refreshProfiles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<UserProfile[]>(initialProfiles);
  const [currentUser, setCurrentUser] = useState<UserProfile>(initialProfiles[0]); // Default Admin or saved

  const refreshProfiles = useCallback(async () => {
    try {
      const list = await db.getProfiles();
      if (list && list.length > 0) {
        setProfiles(list);
        if (typeof window !== "undefined") {
          const urlParams = new URLSearchParams(window.location.search);
          const repParam = urlParams.get("rep") || urlParams.get("user") || urlParams.get("token");
          if (repParam) {
            const match = list.find((p) => p.id === repParam || p.email.toLowerCase() === repParam.toLowerCase());
            if (match) {
              setCurrentUser(match);
              localStorage.setItem("falcon_crm_active_user_id", match.id);
              return;
            }
          }
          const savedRoleId = localStorage.getItem("falcon_crm_active_user_id");
          if (savedRoleId) {
            const found = list.find((p) => p.id === savedRoleId);
            if (found) setCurrentUser(found);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load profiles:", e);
    }
  }, []);

  useEffect(() => {
    refreshProfiles();
  }, [refreshProfiles]);

  const switchRole = (role: UserRole) => {
    const target = profiles.find((p) => p.role === role) || initialProfiles.find((p) => p.role === role) || profiles[0] || initialProfiles[0];
    setCurrentUser(target);
    if (typeof window !== "undefined") {
      localStorage.setItem("falcon_crm_active_user_id", target.id);
    }
  };

  const loginAsUser = (userId: string): boolean => {
    const target =
      profiles.find((p) => p.id === userId || p.email.toLowerCase() === userId.toLowerCase()) ||
      initialProfiles.find((p) => p.id === userId || p.email.toLowerCase() === userId.toLowerCase());
    if (target) {
      setCurrentUser(target);
      if (typeof window !== "undefined") {
        localStorage.setItem("falcon_crm_active_user_id", target.id);
      }
      return true;
    }
    return false;
  };

  const loginWithProfile = (profile: UserProfile) => {
    setCurrentUser(profile);
    if (typeof window !== "undefined") {
      localStorage.setItem("falcon_crm_active_user_id", profile.id);
    }
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("falcon_crm_active_user_id");
    }
    const admin = profiles.find((p) => p.role === "admin") || initialProfiles[0];
    setCurrentUser(admin);
  };

  const can = (action: string): boolean => {
    const role = currentUser.role;
    if (role === "admin") return true;

    if (role === "manager") {
      // Manager can do everything except critical system settings / admin account changes
      const restrictedActions = ["manage_admins", "system_settings", "delete_exhibitions"];
      return !restrictedActions.includes(action);
    }

    if (role === "sales_rep") {
      const allowedActions = [
        "capture_lead",
        "view_assigned_leads",
        "edit_permitted_leads",
        "create_followup",
        "complete_followup",
        "generate_whatsapp_qr",
        "use_sales_magnets",
        "view_own_performance",
        "add_note",
        "qualify_lead",
      ];
      return allowedActions.includes(action);
    }

    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser.role,
        switchRole,
        loginAsUser,
        loginWithProfile,
        logout,
        can,
        allProfiles: profiles,
        refreshProfiles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
