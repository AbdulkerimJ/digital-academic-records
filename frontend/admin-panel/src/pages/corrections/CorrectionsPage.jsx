import CorrectionTable from "./CorrectionTable"

export default function CorrectionsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black tracking-tight text-primary/90">Correction Review Board</h2>
          <p className="text-muted-foreground font-medium text-sm max-w-lg">
            Manage and verify student record correction requests. Ensure data integrity by carefully reviewing each submission before approval.
          </p>
        </div>
      </div>

      <CorrectionTable />
    </div>
  )
}
