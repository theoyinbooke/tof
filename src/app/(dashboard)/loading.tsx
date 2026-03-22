export default function DashboardLoading() {
  return (
    <div className="flex h-full items-center justify-center p-10">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
        <p className="text-sm text-[#737373]">Loading...</p>
      </div>
    </div>
  );
}
