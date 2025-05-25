import { ReactNode } from "react";

interface PremiumGateProps {
  children: ReactNode;
  feature: string;
  description?: string;
  showUpgrade?: boolean;
}

// Modified to always show the content for all users
export default function PremiumGate({ 
  children, 
  feature, 
  description, 
  showUpgrade = true 
}: PremiumGateProps) {
  // Always show content without any restrictions
  return <>{children}</>;
}
