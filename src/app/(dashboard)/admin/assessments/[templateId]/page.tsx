"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { use, useState } from "react";
import Link from "next/link";

export default function AdminTemplateDetailPage({ params }: { params: Promise<{ templateId: string }> }) {
  const { templateId } = use(params);
  const id = templateId as Id<"assessmentTemplates">;
  const template = useQuery(api.assessments.templates.getById, { templateId: id });
  const publishTemplate = useMutation(api.assessments.templates.publish);
  const archiveTemplate = useMutation(api.assessments.templates.archive);
  const updateDraft = useMutation(api.assessments.templates.updateDraft);

  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [itemText, setItemText] = useState("");

  if (template === undefined) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" /></div>;
  }

  if (!template) {
    return <div className="p-6 lg:p-10"><Link href="/admin/assessments" className="text-sm text-[#737373]">&larr; Back</Link><p className="mt-8 text-center">Template not found.</p></div>;
  }

  const isDraft = template.status === "draft";
  const isArchived = template.status === "archived";

  const handlePublish = async () => {
    setSaving(true);
    try { await publishTemplate({ templateId: id }); } finally { setSaving(false); }
  };

  const handleArchive = async () => {
    setSaving(true);
    try { await archiveTemplate({ templateId: id }); } finally { setSaving(false); }
  };

  const handleItemUpdate = async (itemNumber: number) => {
    if (!isDraft) return;
    setSaving(true);
    try {
      const updatedItems = template.items.map((item) =>
        item.itemNumber === itemNumber ? { ...item, text: itemText } : item,
      );
      await updateDraft({ templateId: id, items: updatedItems });
      setEditingItem(null);
      setItemText("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-10">
      <Link href="/admin/assessments" className="text-sm text-[#737373] hover:text-[#171717]">&larr; Back to templates</Link>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-[#171717]">{template.name}</h1>
            <span className="rounded bg-[#F0F0F0] px-2 py-0.5 text-[10px] font-bold text-[#525252]">{template.shortCode}</span>
          </div>
          <p className="mt-1 text-sm text-[#737373]">Version {template.version} · {template.items.length} items</p>
        </div>
        <div className="flex gap-2">
          {isDraft && (
            <button onClick={handlePublish} disabled={saving || template.items.length === 0}
              className="rounded-md bg-[#00D632] px-4 py-2 text-sm font-medium text-white hover:bg-[#00C02D] disabled:opacity-50">
              Publish
            </button>
          )}
          {!isArchived && (
            <button onClick={handleArchive} disabled={saving}
              className="rounded-md bg-[#F0F0F0] px-4 py-2 text-sm font-medium text-[#525252] hover:bg-[#E5E5E5] disabled:opacity-50">
              Archive
            </button>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#737373]">Metadata</h2>
          <div className="mt-4 space-y-3">
            <DetailRow label="Status" value={template.status} />
            <DetailRow label="Description" value={template.description} />
            <DetailRow label="Source Citation" value={template.sourceCitation} />
            <DetailRow label="License Notes" value={template.licenseNotes} />
            <DetailRow label="Adaptation Notes" value={template.adaptationNotes} />
            <DetailRow label="Pillar" value={template.pillar?.replace("_", " ")} />
            <DetailRow label="Session" value={template.sessionNumber?.toString()} />
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#737373]">Scoring</h2>
          <div className="mt-4 space-y-3">
            {template.totalScoreRange && (
              <DetailRow label="Score Range" value={`${template.totalScoreRange.min} – ${template.totalScoreRange.max}`} />
            )}
            {template.subscales && template.subscales.length > 0 && (
              <div>
                <p className="text-sm text-[#737373]">Subscales</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {template.subscales.map((s) => (
                    <span key={s.name} className="rounded-full bg-[#F0F0F0] px-2 py-0.5 text-[10px] text-[#525252]">
                      {s.name} ({s.itemNumbers.length} items)
                    </span>
                  ))}
                </div>
              </div>
            )}
            {template.severityBands && template.severityBands.length > 0 && (
              <div>
                <p className="text-sm text-[#737373]">Severity Bands</p>
                <div className="mt-1 space-y-1">
                  {template.severityBands.map((b) => (
                    <div key={b.label} className="flex items-center justify-between text-xs">
                      <span className="text-[#171717]">{b.label}</span>
                      <span className="text-[#737373]">{b.min}–{b.max} {b.flagBehavior && b.flagBehavior !== "none" ? `(${b.flagBehavior.replace("_", " ")})` : ""}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="mt-6 rounded-xl border border-[#E5E5E5] bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#737373]">
          Items ({template.items.length})
        </h2>
        {template.items.length === 0 ? (
          <p className="mt-4 text-sm text-[#737373]">No items yet. {isDraft ? "Add items to this template." : ""}</p>
        ) : (
          <div className="mt-4 space-y-2">
            {template.items.map((item) => (
              <div key={item.itemNumber} className="rounded-lg border border-[#F0F0F0] px-3 py-2">
                {editingItem === item.itemNumber ? (
                  <div className="flex gap-2">
                    <input value={itemText} onChange={(e) => setItemText(e.target.value)}
                      className="flex-1 rounded border border-[#E5E5E5] px-2 py-1 text-sm outline-none focus:border-[#171717]" />
                    <button onClick={() => handleItemUpdate(item.itemNumber)} disabled={saving}
                      className="rounded bg-[#171717] px-3 py-1 text-xs text-white">Save</button>
                    <button onClick={() => setEditingItem(null)}
                      className="rounded px-3 py-1 text-xs text-[#737373]">Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#737373]">Q{item.itemNumber}</span>
                      <span className="text-sm text-[#171717]">{item.text}</span>
                      {item.isReversed && <span className="rounded bg-yellow-50 px-1.5 py-0.5 text-[9px] text-yellow-600">R</span>}
                      {item.subscale && <span className="rounded bg-[#F0F0F0] px-1.5 py-0.5 text-[9px] text-[#737373]">{item.subscale}</span>}
                    </div>
                    {isDraft && (
                      <button onClick={() => { setEditingItem(item.itemNumber); setItemText(item.text); }}
                        className="text-xs text-[#737373] hover:text-[#171717]">Edit</button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start justify-between border-b border-[#F0F0F0] pb-2 last:border-0">
      <span className="text-sm text-[#737373]">{label}</span>
      <span className="text-right text-sm text-[#171717]">{value || <span className="text-[#D4D4D4]">—</span>}</span>
    </div>
  );
}
