"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserRole } from "@/types/crm";
import { initialProfiles } from "@/lib/seed-data";

interface AuthContextType {
  currentUser: UserProfile;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  can: (action: string) => boolean;
  allProfiles: UserProfile[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(initialProfiles[0]); // Default Admin or saved

  useEffect(() => {
    const savedRoleId = localStorage.getItem("falcon_crm_active_user_id");
    if (savedRoleId) {
      const found = initialProfiles.find((p) => p.id === savedRoleId);
      if (found) setCurrentUser(found);
    }
  }, []);

  const switchRole = (role: UserRole) => {
    const target = initialProfiles.find((p) => p.role === role) || initialProfiles[0];
    setCurrentUser(target);
    localStorage.setItem("falcon_crm_active_user_id", target.id);
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
        allProfiles: initialProfiles,
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
