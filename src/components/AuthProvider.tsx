declare global {
  interface Window {
    PowerAppsCodeApps?: {
      getContext: () => {
        userSettings?: {
          userEmail?: string;
        };
      };
    };
  }
}
// Add this import at top of file (static import)
//import { initialize, getContext } from '@microsoft/power-apps/app';
// CORRECT path matching actual package structure
import { getContext } from '../.././node_modules/@microsoft/power-apps/lib/app';

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserRolesService  } from "../services/UserRolesService";


// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

export type UserRole = "Scrum Master" | "Team Member" | "Viewer";

interface AuthContextValue {
  userEmail: string;
  userRole: UserRole;
  isLoading: boolean;
}

// -------------------------------------------------------------------
// Context
// -------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue>({
  userEmail: "",
  userRole: "Viewer",
  isLoading: true,
});

// -------------------------------------------------------------------
// Provider Component
// -------------------------------------------------------------------

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userEmail, setUserEmail] = useState<string>("");
  const [userRole, setUserRole] = useState<UserRole>("Viewer");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Inside useEffect:
 useEffect(() => {
  const loadUserRole = async () => {
    try {
      // Official code apps API [web:6]
      const ctx = await getContext();
      console.log("✅ CTX:", JSON.stringify(ctx, null, 2));

      const email: string = ctx?.user?.userPrincipalName?.toLowerCase() ?? "";
      console.log("✅ EMAIL:", email);

      setUserEmail(email);

      if (!email) {
        setUserRole("Viewer");
        return;
      }

      // SharePoint role lookup
      const result = await UserRolesService.getAll({
        filter: `Email eq '${email}' and IsActive eq 1`,
        top: 1,
      });
      console.log("✅ Records:", result);
      const role = result.data[0]?.Role?.Value ?? "Team Member";
      setUserRole(role as UserRole);
      console.log("✅ ROLE:", role);

    } catch (error: any) {
      console.error("❌ ERROR:", error.message);
      setUserRole("Viewer");
    } finally {
      setIsLoading(false);
    }
  };
  loadUserRole();
}, []);

 
  /*
  useEffect(() => {
    
    const loadUserRole = async () => {
      try {
        // Step 1: Get the logged-in user's email from the Power Apps SDK
        const context = window.PowerAppsCodeApps?.getContext();
        const email: string =
          context?.userSettings?.userEmail?.toLowerCase() ?? "";
        console.log("Context: =", context);
        console.log("AuthProvider: email from context =", email);
        setUserEmail(email);

        if (!email) {
          // No user context available — default to Viewer
          setUserRole("Viewer");
          console.log("AuthProvider: no email, defaulting role to Viewer");
          return;
        }

        // Step 2: Query the UserRoles SharePoint list for this user
              const result = await UserRolesService.getAll({
        filter: `UserEmail eq '${email}' and IsActive eq 1`,
        top: 1,
      });
          
     
      //alert(result.data);
      const records = (result.data as any[]) ?? [];
      console.log("AuthProvider: SharePoint records =", records);
      if (records.length > 0) {
        const role = records[0].Role as UserRole;
       // console.trace(records[0].Role as UserRole);
        setUserRole(role ?? "Viewer");
      } else {
        setUserRole("Team Member");
      }


      } catch (error) {
        console.error("AuthProvider: Failed to load user role.", error);
        setUserRole("Viewer");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserRole();
  }, []);
  */
  return (
    <AuthContext.Provider value={{ userEmail, userRole, isLoading }}>
      {isLoading ? (
        <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
          Loading user context...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

// -------------------------------------------------------------------
// Custom Hook — use this in any component to access auth context
// -------------------------------------------------------------------

export const useAuth = (): AuthContextValue => {
  return useContext(AuthContext);
};
