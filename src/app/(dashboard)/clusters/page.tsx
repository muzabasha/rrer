"use client"

import { useState, useEffect, useCallback } from "react"
import { getClusters, autoGenerateClusters, deleteCluster } from "@/lib/actions/cluster.actions"
import type { ClusterListResult } from "@/lib/actions/cluster.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Zap, ChevronLeft, ChevronRight, Trash2, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function ClustersPage() {
  const [data, setData] = useState<ClusterListResult | null>(null)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getClusters({ search, page, limit: 15 })
      setData(result)
    } catch {
      // DB not connected
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleAutoGenerate() {
    setGenerating(true)
    try {
      await autoGenerateClusters()
      fetchData()
    } finally {
      setGenerating(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this cluster?")) return
    await deleteCluster(id)
    fetchData()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Research Clusters</h1>
          <p className="text-muted-foreground">AI-powered research grouping and collaboration</p>
        </div>
        <Button onClick={handleAutoGenerate} disabled={generating}>
          <Zap className="mr-2 h-4 w-4" />
          {generating ? "Generating..." : "Auto-Generate Clusters"}
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search clusters..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="pl-9" />
        </div>
      </div>

      {loading ? (
        <div className="p-6 text-center text-muted-foreground">Loading clusters...</div>
      ) : !data || data.clusters.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <Zap className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p>No research clusters yet.</p>
            <p className="text-sm mt-1">Click &quot;Auto-Generate Clusters&quot; to create clusters from faculty expertise.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {data.clusters.slice(0, 3).map((cluster) => (
              <Link key={cluster.id} href={`/clusters/${cluster.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{cluster.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{cluster.description || "No description"}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {cluster.keywords.slice(0, 4).map((kw) => (
                        <Badge key={kw} variant="secondary" className="text-xs">{kw}</Badge>
                      ))}
                      {cluster.keywords.length > 4 && <Badge variant="outline" className="text-xs">+{cluster.keywords.length - 4}</Badge>}
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{cluster.memberCount || 0} members</span>
                      <span>{cluster.publicationCount} pubs</span>
                      <span>{cluster.citationCount} cites</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Publications</TableHead>
                <TableHead>Citations</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.clusters.map((cluster) => (
                <TableRow key={cluster.id}>
                  <TableCell>
                    <Link href={`/clusters/${cluster.id}`} className="font-medium hover:underline">
                      {cluster.name}
                    </Link>
                  </TableCell>
                  <TableCell>{cluster.memberCount || 0}</TableCell>
                  <TableCell>{cluster.publicationCount}</TableCell>
                  <TableCell>{cluster.citationCount}</TableCell>
                  <TableCell>{cluster.clusterScore.toFixed(0)}</TableCell>
                  <TableCell>
                    <Badge variant={cluster.isActive ? "default" : "secondary"}>
                      {cluster.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(cluster.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </TableCell>
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
