import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <SignUp />
    </div>
  )
}

// Folder must be named [[...sign-up]] — the double brackets are required by Clerk