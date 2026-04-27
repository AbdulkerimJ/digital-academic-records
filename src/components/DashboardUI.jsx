import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function StatCard({ title, value, icon: Icon, change, trend = "neutral" }) {
  return (
    <Card className="bg-[#0b1220] border-white/5 hover:border-primary/50 transition-all group overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-display font-black text-white">{value}</div>
        {change && (
          <p className={`text-[10px] mt-1 font-bold ${trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"}`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function ContentCard({ title, subtitle, children, className = "" }) {
  return (
    <Card className={`bg-[#0b1220] border-white/5 shadow-xl ${className}`}>
      {(title || subtitle) && (
        <CardHeader>
          {title && <CardTitle className="text-lg font-bold">{title}</CardTitle>}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function StatusBadge({ status }) {
  const styles = {
    Active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    Pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    Inactive: "bg-red-500/10 text-red-500 border-red-500/20",
    Approved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    Rejected: "bg-red-500/10 text-red-500 border-red-500/20",
    Success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  };
  return (
    <Badge variant="outline" className={`${styles[status] || "bg-white/5 text-white"} text-[10px] font-bold px-2 py-0.5 rounded-full`}>
      {status}
    </Badge>
  );
}
