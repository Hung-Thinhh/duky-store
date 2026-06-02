import React from "react";
import { AuthGuard } from "./AuthGuard";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
