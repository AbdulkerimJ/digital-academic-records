export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to the Digital Academic Records administration portal.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Stats cards will go here */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">Stat {i}</h3>
            </div>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">+0% from last month</p>
          </div>
        ))}
      </div>
    </div>
  )
}
