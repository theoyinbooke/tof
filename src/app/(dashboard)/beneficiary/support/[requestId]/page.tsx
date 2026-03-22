"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { use } from "react";
import Link from "next/link";

export default function BeneficiarySupportDetailPage({ params }: { params: Promise<{ requestId: string }> }) {
  const { requestId } = use(params);
  const data = useQuery(api.support.getById, { requestId: requestId as Id<"supportRequests"> });

  if (data === undefined) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" /></div>;
  }

  if (!data) {
    return <div className="p-6 lg:p-10"><Link href="/beneficiary/support" className="text-sm text-[#737373]">&larr; Back</Link><p className="mt-8 text-center text-sm">Request not found.</p></div>;
  }

  return (
    <div className="p-6 lg:p-10">
      <Link href="/beneficiary/support" className="text-sm text-[#737373] hover:text-[#171717]">&larr; Back to requests</Link>
      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#171717]">{data.title}</h1>
        <span className="rounded-full bg-[#F0F0F0] px-2.5 py-0.5 text-xs font-medium text-[#525252]">{data.status.replace(/_/g, " ")}</span>
      </div>
      <p className="mt-2 text-sm text-[#737373]">{data.description}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#737373]">Details</h2>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between border-b border-[#F0F0F0] pb-2"><span className="text-sm text-[#737373]">Category</span><span className="text-sm text-[#171717]">{data.category}</span></div>
            <div className="flex justify-between border-b border-[#F0F0F0] pb-2"><span className="text-sm text-[#737373]">Amount</span><span className="text-sm text-[#171717]">{data.amountRequested ? `₦${data.amountRequested.toLocaleString()}` : "Not specified"}</span></div>
            <div className="flex justify-between"><span className="text-sm text-[#737373]">Submitted</span><span className="text-sm text-[#171717]">{new Date(data.createdAt).toLocaleDateString()}</span></div>
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#737373]">Timeline ({data.events.length} events)</h2>
          {data.events.length === 0 ? (
            <p className="mt-4 text-sm text-[#737373]">No events yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {data.events.map((e) => (
                <div key={e._id} className="border-l-2 border-[#E5E5E5] pl-3">
                  <p className="text-xs font-medium text-[#171717]">{e.action}</p>
                  {e.note && <p className="text-xs text-[#737373]">{e.note}</p>}
                  <p className="text-[10px] text-[#D4D4D4]">{new Date(e.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {data.disbursements.length > 0 && (
        <div className="mt-6 rounded-xl border border-[#E5E5E5] bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#737373]">Disbursements</h2>
          <div className="mt-4 space-y-3">
            {data.disbursements.map((d) => (
              <div key={d._id} className="flex items-center justify-between rounded-lg border border-[#F0F0F0] px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-[#171717]">₦{d.amount.toLocaleString()}</p>
                  <p className="text-xs text-[#737373]">{new Date(d.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${d.evidenceStatus === "verified" ? "bg-[#E6FBF0] text-[#00D632]" : d.evidenceStatus === "overdue" ? "bg-red-50 text-red-600" : "bg-[#F0F0F0] text-[#737373]"}`}>
                  {d.evidenceStatus.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
