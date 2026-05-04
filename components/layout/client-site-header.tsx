"use client";

import { SiteHeader } from "./site-header";
import { useMe } from "@/hooks/use-me";

export function ClientSiteHeader() {
  const { data: user } = useMe();
  
  return <SiteHeader user={user} />;
}
