"use client"

import { useState, useEffect, useCallback } from "react"
import { getPatents } from "@/lib/actions/patent.actions"
import type { PatentListResult } from "@/lib/actions/patent.actions"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, ChevronLeft, ChevronRight, Lightbulb } from "lucide-react"
import Link from "next/link"

const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  IDEA: "outline",
  NOVELTY_CHECK: "secondary",
  FILED: "default",
  PUBLISHED: "default",
  GRANTED: "default",
  COMMERCIALIZED: "default",
  REJECTED: "destructive",
}

export default function PatentsPage() {
  const [data, setData] = useState<PatentListResult | null>(null)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getPatents({ search, status, page, limit: 15 })
      setData(result)
    } catch { /* DB not connected */ }
    finally { setLoading(false) }
  }, [search, status, page])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Patents</h1>
        <p className="text-muted-foreground">Patent lifecycle management and tracking</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search patents..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="pl-9" />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">All Statuses</option>
          <option value="IDEA">Idea</option>
          <option value="NOVELTY_CHECK">Novelty Check</option>
          <option value="FILED">Filed</option>
          <option value="PUBLISHED">Published</option>
          <option value="GRANTED">Granted</option>
          <option value="COMMERCIALIZED">Commercialized</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="p-6 text-center text-muted-foreground">Loading...</div>
      ) : !data || data.patents.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <Lightbulb className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p>No patents found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Inventors</TableHead>
                <TableHead>TRL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Filed</TableHead>
                <TableHead>Patent #</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.patents.map((patent) => (
                <TableRow key={patent.id}>
                  <TableCell>
                    <Link href={`/patents/${patent.id}`} className="font-medium hover:underline line-clamp-1">
                      {patent.title}
                    </Link>
                    {patent.category && <div className="text-xs text-muted-foreground">{patent.category}</div>}
                  </TableCell>
                  <TableCell className="text-sm max-w-[200px]">
                    {patent.inventors?.map((inv) => inv.faculty.user.name).join(", ") || "—"}
                  </TableCell>
                  <TableCell className="text-sm">{patent.trl || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[patent.status] || "outline"}>
                      {patent.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {patent.filingDate ? new Date(patent.filingDate).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-sm">{patent.patentNumber || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between px-2">
              <p className="text-sm text-muted-foreground">Page {data.page} of {data.totalPages}</p>
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
