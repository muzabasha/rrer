"use client"

import { useState, useEffect, useCallback } from "react"
import { getProjects } from "@/lib/actions/project.actions"
import type { ProjectListResult } from "@/lib/actions/project.actions"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, ChevronLeft, ChevronRight, FolderOpen } from "lucide-react"
import Link from "next/link"

const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  IDEA: "outline",
  CONCEPT_NOTE: "secondary",
  PROPOSAL_DRAFT: "secondary",
  SUBMITTED: "default",
  UNDER_REVIEW: "default",
  AWARDED: "default",
  IN_PROGRESS: "default",
  COMPLETED: "default",
  REJECTED: "destructive",
}

export default function ProjectsPage() {
  const [data, setData] = useState<ProjectListResult | null>(null)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getProjects({ search, status, page, limit: 15 })
      setData(result)
    } catch {
      // DB not connected
    } finally {
      setLoading(false)
    }
  }, [search, status, page])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sponsored Research Projects</h1>
        <p className="text-muted-foreground">Track research projects from idea to completion</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search projects..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="pl-9" />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">All Statuses</option>
          <option value="IDEA">Idea</option>
          <option value="CONCEPT_NOTE">Concept Note</option>
          <option value="PROPOSAL_DRAFT">Proposal Draft</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="AWARDED">Awarded</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="p-6 text-center text-muted-foreground">Loading projects...</div>
      ) : !data || data.projects.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <FolderOpen className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p>No projects found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Agency</TableHead>
                <TableHead>PI</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Milestones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <Link href={`/projects/${project.id}`} className="font-medium hover:underline line-clamp-1">
                      {project.title}
                    </Link>
                    {project.theme && <div className="text-xs text-muted-foreground">{project.theme}</div>}
                  </TableCell>
                  <TableCell className="text-sm">{project.fundingAgency.name}</TableCell>
                  <TableCell className="text-sm">{project.pi?.user.name || "—"}</TableCell>
                  <TableCell className="text-sm">
                    <div>Req: ₹{(project.amountRequested / 100000).toFixed(1)}L</div>
                    {project.amountAwarded && (
                      <div className="text-green-600">Awarded: ₹{(project.amountAwarded / 100000).toFixed(1)}L</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[project.status] || "outline"}>
                      {project.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{project._count?.milestones || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between px-2">
              <p className="text-sm text-muted-foreground">Page {data.page} of {data.totalPages} ({data.total} total)</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
