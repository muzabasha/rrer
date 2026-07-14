"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FolderKanban, Award, GraduationCap } from "lucide-react"

const stats = [
  { title: "Faculty Members", icon: Users, value: "—", description: "Total registered faculty" },
  { title: "Research Projects", icon: FolderKanban, value: "—", description: "Active projects" },
  { title: "Patents", icon: Award, value: "—", description: "Filed patents" },
  { title: "PhD Scholars", icon: GraduationCap, value: "—", description: "Enrolled scholars" },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the REVA Research Intelligence Portal</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Ensure your Supabase database migration has been applied (paste migration SQL into SQL Editor)</p>
          <p>2. Run the seed script to populate sample data: <code className="rounded bg-muted px-1">npm run db:seed</code></p>
          <p>3. Navigate to Faculty to manage research profiles</p>
          <p>4. Explore the sidebar for all available modules</p>
        </CardContent>
      </Card>
    </div>
  )
}
