import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F7F7] px-6">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E6FBF0]">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#00D632"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 15h8M9 9h.01M15 9h.01" />
          </svg>
        </div>
        <h1 className="mt-4 text-xl font-semibold text-[#171717]">
          Page not found
        </h1>
        <p className="mt-1 text-sm text-[#737373]">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 rounded-md bg-[#171717] px-4 py-2 text-sm font-medium text-white hover:bg-[#262626]"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}
