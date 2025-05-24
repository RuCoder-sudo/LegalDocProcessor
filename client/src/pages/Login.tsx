import AuthForms from "@/components/AuthForms";

export default function Login() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md">
        <AuthForms />
      </div>
    </div>
  );
}