"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { getProjectById, updateProjectStatus } from "@/lib/actions/project.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, DollarSign, Users, CheckCircle } from "lucide-react"
import Link from "next/link"

const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  IDEA: "outline", CONCEPT_NOTE: "secondary", PROPOSAL_DRAFT: "secondary",
  SUBMITTED: "default", UNDER_REVIEW: "default", AWARDED: "default",
  IN_PROGRESS: "default", COMPLETED: "default", REJECTED: "destructive",
}

export default function ProjectDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const data = await getProjectById(id)
      setProject(data)
    } catch { /* not found */ }
    finally { setLoading(false) }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleStatusChange(newStatus: string) {
    await updateProjectStatus(id, newStatus)
    fetchData()
  }

  if (loading) return <div className="p-6 text-center text-muted-foreground">Loading...</div>
  if (!project) return <div className="p-6 text-center text-muted-foreground">Project not found</div>

  const milestones = project.milestones || []
  const completedMilestones = milestones.filter((m: any) => m.status === "COMPLETED").length
  const progress = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <p className="text-muted-foreground">Agency: {project.fundingAgency.name}</p>
        </div>
        <Badge variant={statusColors[project.status] || "outline"} className="text-sm">
          {project.status.replace(/_/g, " ")}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">₹{((project.amountAwarded || project.amountRequested) / 100000).toFixed(1)}L</div>
                <div className="text-xs text-muted-foreground">{project.amountAwarded ? "Awarded" : "Requested"}</div>
              </div>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{progress}%</div>
                <div className="text-xs text-muted-foreground">Progress</div>
              </div>
              <CheckCircle className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{project.collaborators.length}</div>
                <div className="text-xs text-muted-foreground">Collaborators</div>
              </div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{completedMilestones}/{milestones.length}</div>
                <div className="text-xs text-muted-foreground">Milestones</div>
              </div>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {project.description && (
        <Card>
          <CardHeader><CardTitle className="text-base">Description</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">{project.description}</p></CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">PI</span><span>{project.pi?.user.name || "—"}</span></div>
          <Separator />
          <div className="flex justify-between"><span className="text-muted-foreground">Theme</span><span>{project.theme || "—"}</span></div>
          <Separator />
          <div className="flex justify-between"><span className="text-muted-foreground">Start Date</span><span>{project.startDate ? new Date(project.startDate).toLocaleDateString() : "—"}</span></div>
          <Separator />
          <div className="flex justify-between"><span className="text-muted-foreground">End Date</span><span>{project.endDate ? new Date(project.endDate).toLocaleDateString() : "—"}</span></div>
        </CardContent>
      </Card>

      {project.collaborators.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Collaborators</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {project.collaborators.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between text-sm">
                  <div>
                    <Link href={`/faculty/${c.facultyId}`} className="font-medium hover:underline">{c.faculty.user.name}</Link>
                    <span className="text-muted-foreground ml-2">({c.role})</span>
                  </div>
                  <span className="text-muted-foreground">{c.faculty.department}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {milestones.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Milestones</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {milestones.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${m.status === "COMPLETED" ? "bg-green-500" : "bg-gray-300"}`} />
                    <div>
                      <div className="text-sm font-medium">{m.title}</div>
                      {m.description && <div className="text-xs text-muted-foreground">{m.description}</div>}
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>Due: {new Date(m.dueDate).toLocaleDateString()}</div>
                    {m.completedAt && <div className="text-green-600">Done</div>}
                  </div>
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
            {project.status === "IDEA" && <Button size="sm" onClick={() => handleStatusChange("CONCEPT_NOTE")}>Move to Concept Note</Button>}
            {project.status === "CONCEPT_NOTE" && <Button size="sm" onClick={() => handleStatusChange("PROPOSAL_DRAFT")}>Start Proposal Draft</Button>}
            {project.status === "PROPOSAL_DRAFT" && <Button size="sm" onClick={() => handleStatusChange("INTERNAL_REVIEW")}>Submit for Internal Review</Button>}
            {project.status === "INTERNAL_REVIEW" && <Button size="sm" onClick={() => handleStatusChange("BUDGET_REVIEW")}>Approve to Budget Review</Button>}
            {project.status === "BUDGET_REVIEW" && <Button size="sm" onClick={() => handleStatusChange("TECHNICAL_REVIEW")}>Approve to Technical Review</Button>}
            {project.status === "TECHNICAL_REVIEW" && <Button size="sm" onClick={() => handleStatusChange("SUBMITTED")}>Submit to Agency</Button>}
            {project.status === "SUBMITTED" && <Button size="sm" onClick={() => handleStatusChange("UNDER_REVIEW")}>Mark Under Review</Button>}
            {project.status === "UNDER_REVIEW" && <Button size="sm" onClick={() => handleStatusChange("AWARDED")}>Mark Awarded</Button>}
            {project.status === "AWARDED" && <Button size="sm" onClick={() => handleStatusChange("IN_PROGRESS")}>Start Project</Button>}
            {project.status === "IN_PROGRESS" && <Button size="sm" onClick={() => handleStatusChange("CLOSURE")}>Move to Closure</Button>}
            {project.status === "CLOSURE" && <Button size="sm" onClick={() => handleStatusChange("COMPLETED")}>Mark Complete</Button>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
