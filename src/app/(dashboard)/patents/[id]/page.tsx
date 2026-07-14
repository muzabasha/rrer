"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { getPatentById, updatePatentStatus } from "@/lib/actions/patent.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const statusColors: Record<string, "default" | "secondary" | "outline"> = {
  IDEA: "outline", NOVELTY_CHECK: "secondary", FILED: "default",
  PUBLISHED: "default", GRANTED: "default", COMMERCIALIZED: "default",
  REJECTED: "outline",
}

const statusFlow = ["IDEA", "NOVELTY_CHECK", "FILED", "PUBLISHED", "GRANTED", "COMMERCIALIZED"]

export default function PatentDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [patent, setPatent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try { const data = await getPatentById(id); setPatent(data) }
    catch { /* not found */ }
    finally { setLoading(false) }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleStatusChange(newStatus: string) {
    await updatePatentStatus(id, newStatus)
    fetchData()
  }

  if (loading) return <div className="p-6 text-center text-muted-foreground">Loading...</div>
  if (!patent) return <div className="p-6 text-center text-muted-foreground">Patent not found</div>

  const currentStageIndex = statusFlow.indexOf(patent.status)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/patents"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{patent.title}</h1>
          <p className="text-muted-foreground">{patent.category || "Patent"} &middot; {patent.jurisdiction || "—"}</p>
        </div>
        <Badge variant={statusColors[patent.status] || "outline"}>{patent.status.replace(/_/g, " ")}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{patent.trl || "—"}</div>
            <div className="text-xs text-muted-foreground">TRL Level</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{patent.inventors?.length || 0}</div>
            <div className="text-xs text-muted-foreground">Inventors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{patent.licenses?.length || 0}</div>
            <div className="text-xs text-muted-foreground">Licenses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{patent.noveltyChecks?.length || 0}</div>
            <div className="text-xs text-muted-foreground">Novelty Checks</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Patent Funnel</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {statusFlow.map((stage, i) => (
              <div key={stage} className="flex items-center gap-2 shrink-0">
                <div className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                  i <= currentStageIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {stage.replace(/_/g, " ")}
                </div>
                {i < statusFlow.length - 1 && <div className={`w-6 h-0.5 ${i < currentStageIndex ? "bg-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Description</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">{patent.abstract}</p></CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Filing Date</span><span>{patent.filingDate ? new Date(patent.filingDate).toLocaleDateString() : "—"}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Publication Date</span><span>{patent.publicationDate ? new Date(patent.publicationDate).toLocaleDateString() : "—"}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Grant Date</span><span>{patent.grantDate ? new Date(patent.grantDate).toLocaleDateString() : "—"}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Patent Number</span><span>{patent.patentNumber || "—"}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Application #</span><span>{patent.applicationNumber || "—"}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Inventors</CardTitle></CardHeader>
          <CardContent>
            {patent.inventors?.length === 0 ? <p className="text-sm text-muted-foreground">No inventors</p> : (
              <div className="space-y-2">
                {patent.inventors?.map((inv: any) => (
                  <div key={inv.id} className="flex items-center justify-between text-sm">
                    <Link href={`/faculty/${inv.facultyId}`} className="font-medium hover:underline">{inv.faculty.user.name}</Link>
                    <Badge variant="outline" className="text-xs">{inv.role}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {patent.licenses?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Licenses</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patent.licenses.map((l: any) => (
                <div key={l.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{l.licensee}</span>
                    <span className="text-muted-foreground ml-2">({l.startDate ? new Date(l.startDate).toLocaleDateString() : "?"} - {l.endDate ? new Date(l.endDate).toLocaleDateString() : "?"})</span>
                  </div>
                  <span className="font-medium">₹{l.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {patent.status === "IDEA" && <Button size="sm" onClick={() => handleStatusChange("NOVELTY_CHECK")}>Start Novelty Check</Button>}
            {patent.status === "NOVELTY_CHECK" && <Button size="sm" onClick={() => handleStatusChange("FILED")}>File Patent</Button>}
            {patent.status === "FILED" && <Button size="sm" onClick={() => handleStatusChange("PUBLISHED")}>Mark Published</Button>}
            {patent.status === "PUBLISHED" && <Button size="sm" onClick={() => handleStatusChange("GRANTED")}>Mark Granted</Button>}
            {patent.status === "GRANTED" && <Button size="sm" onClick={() => handleStatusChange("COMMERCIALIZED")}>Commercialize</Button>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
