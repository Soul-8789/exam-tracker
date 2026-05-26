import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <SignIn />
    </div>
  )
}

// Folder must be named [[...sign-in]] — the double brackets are required by Clerk