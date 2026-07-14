"use client"

import { useState, useEffect, useCallback } from "react"
import { getConsultancies } from "@/lib/actions/consultancy.actions"
import type { ConsultancyListResult } from "@/lib/actions/consultancy.actions"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, ChevronLeft, ChevronRight, Briefcase } from "lucide-react"
import Link from "next/link"

const statusColors: Record<string, "default" | "secondary" | "outline"> = {
  INITIATED: "outline",
  QUOTATION_SENT: "secondary",
  AGREEMENT_SIGNED: "default",
  IN_PROGRESS: "default",
  COMPLETED: "secondary",
  RENEWAL: "outline",
}

export default function ConsultancyPage() {
  const [data, setData] = useState<ConsultancyListResult | null>(null)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getConsultancies({ search, status, page, limit: 15 })
      setData(result)
    } catch { /* DB not connected */ }
    finally { setLoading(false) }
  }, [search, status, page])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Consultancy Projects</h1>
        <p className="text-muted-foreground">Industry collaborations and consultancy tracking</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search consultancies..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="pl-9" />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">All Statuses</option>
          <option value="INITIATED">Initiated</option>
          <option value="QUOTATION_SENT">Quotation Sent</option>
          <option value="AGREEMENT_SIGNED">Agreement Signed</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {loading ? (
        <div className="p-6 text-center text-muted-foreground">Loading...</div>
      ) : !data || data.consultancies.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <Briefcase className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p>No consultancy projects found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Industry Partner</TableHead>
                <TableHead>Faculty</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deliverables</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.consultancies.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/consultancy/${c.id}`} className="font-medium hover:underline line-clamp-1">
                      {c.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm">{c.industryPartner.name}</TableCell>
                  <TableCell className="text-sm">{c.faculty?.user.name || "—"}</TableCell>
                  <TableCell className="text-sm">₹{(c.quotationAmount / 100000).toFixed(1)}L</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[c.status] || "outline"}>{c.status.replace(/_/g, " ")}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{c._count?.deliverables || 0}</TableCell>
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
