import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
    </div>
  );
}

