import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="text-2xl font-bold text-white tracking-tight">AX-Diagnosis</a>
          <p className="text-gray-400 text-sm mt-2">アカウントを作成して診断を開始</p>
        </div>
        <SignUp />
      </div>
    </div>
  );
}
