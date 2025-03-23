import Sidebar from "@/components/sidebar";
import React from "react";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex w-full h-screen overflow-hidden dark:bg-background bg-foreground">
      <Sidebar />
      {children}
    </div>
  );
};

export default ProtectedLayout;
