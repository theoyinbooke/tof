import Link from "next/link";

export function Unauthorized({
  message = "You do not have permission to view this page.",
}: {
  message?: string;
}) {
  return (
    <div className="flex h-full items-center justify-center p-10">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#EF4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
        <h2 className="mt-4 text-base font-semibold text-[#171717]">
          Access Denied
        </h2>
        <p className="mt-1 text-sm text-[#737373]">{message}</p>
        <Link
          href="/dashboard"
          className="mt-4 rounded-md bg-[#171717] px-4 py-2 text-sm font-medium text-white hover:bg-[#262626]"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
