"use client"

import { useState, useEffect, useCallback } from "react"
import { getPublications, type PublicationListResult } from "@/lib/actions/publication.actions"
import { removePublication } from "@/lib/actions/faculty.actions"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, ChevronLeft, ChevronRight, ExternalLink, Trash2, BookOpen } from "lucide-react"

interface PublicationListProps {
  facultyId?: string
  refreshKey?: number
  onRefresh?: () => void
}

const typeColors: Record<string, "default" | "secondary" | "outline" | "success" | "warning"> = {
  JOURNAL: "default",
  CONFERENCE: "secondary",
  BOOK: "outline",
  CHAPTER: "secondary",
  PREPRINT: "outline",
  OTHER: "outline",
}

const quartileColors: Record<string, string> = {
  Q1: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100",
  Q2: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  Q3: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
  Q4: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
}

export function PublicationList({ facultyId, refreshKey, onRefresh }: PublicationListProps) {
  const [data, setData] = useState<PublicationListResult | null>(null)
  const [search, setSearch] = useState("")
  const [type, setType] = useState("")
  const [quartile, setQuartile] = useState("")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchPublications = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getPublications({ facultyId, search, type, quartile, page, limit: 10 })
      setData(result)
    } catch {
      // DB not connected
    } finally {
      setLoading(false)
    }
  }, [facultyId, search, type, quartile, page]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchPublications()
  }, [fetchPublications])

  async function handleDelete(id: string) {
    if (!confirm("Delete this publication?")) return
    await removePublication(id)
    fetchPublications()
    onRefresh?.()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search publications..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="pl-9" />
        </div>
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1) }} className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">All Types</option>
          <option value="JOURNAL">Journal</option>
          <option value="CONFERENCE">Conference</option>
          <option value="BOOK">Book</option>
          <option value="CHAPTER">Chapter</option>
          <option value="PREPRINT">Preprint</option>
          <option value="OTHER">Other</option>
        </select>
        <select value={quartile} onChange={(e) => { setQuartile(e.target.value); setPage(1) }} className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">All Quartiles</option>
          <option value="Q1">Q1</option>
          <option value="Q2">Q2</option>
          <option value="Q3">Q3</option>
          <option value="Q4">Q4</option>
        </select>
      </div>

      {loading ? (
        <div className="p-6 text-center text-muted-foreground">Loading...</div>
      ) : !data || data.publications.length === 0 ? (
        <div className="p-6 text-center text-muted-foreground">
          <BookOpen className="mx-auto mb-2 h-8 w-8 opacity-50" />
          <p>No publications found</p>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quartile</TableHead>
                <TableHead>Citations</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.publications.map((pub) => (
                <TableRow key={pub.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium line-clamp-1">{pub.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {pub.authors.join(", ")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{pub.year}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm">
                    {pub.journal || pub.conference || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={typeColors[pub.type] || "outline"}>{pub.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {pub.quartile ? (
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${quartileColors[pub.quartile] || ""}`}>
                        {pub.quartile}
                      </span>
                    ) : "—"}
                  </TableCell>
                  <TableCell>{pub.citations}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {pub.doi && (
                        <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </a>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(pub.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between px-2">
              <p className="text-sm text-muted-foreground">
                Page {data.page} of {data.totalPages} ({data.total} total)
              </p>
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
