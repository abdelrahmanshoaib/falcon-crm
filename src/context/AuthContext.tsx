"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserProfile, UserRole } from "@/types/crm";
import { initialProfiles } from "@/lib/seed-data";
import { db } from "@/lib/db";

interface AuthContextType {
  currentUser: UserProfile;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
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
        const savedRoleId = typeof window !== "undefined" ? localStorage.getItem("falcon_crm_active_user_id") : null;
        if (savedRoleId) {
          const found = list.find((p) => p.id === savedRoleId);
          if (found) setCurrentUser(found);
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
