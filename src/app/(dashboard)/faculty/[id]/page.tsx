"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getFacultyById } from "@/lib/actions/faculty.actions"
import type { FacultyWithUser, ProfileCompletionBreakdown } from "@/types/faculty.types"
import { FacultyProfileForm } from "@/components/faculty/faculty-profile-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen, Cpu, Trophy } from "lucide-react"
import Link from "next/link"

function calculateCompletion(faculty: FacultyWithUser): ProfileCompletionBreakdown {
  const basicInfo = !!(faculty.designation && faculty.department && faculty.school)
  const expertise = faculty.expertise.length > 0
  const skills = faculty.skills.length > 0
  const publications = faculty.publications.length > 0
  const externalIds = !!(faculty.googleScholarId || faculty.scopusId || faculty.orcid)
  const checks = [basicInfo, expertise, skills, publications, externalIds]
  const percentage = Math.round((checks.filter(Boolean).length / checks.length) * 100)
  return { basicInfo, expertise, skills, publications, externalIds, percentage }
}

export default function FacultyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [faculty, setFaculty] = useState<FacultyWithUser | null>(null)
  const [completion, setCompletion] = useState<ProfileCompletionBreakdown | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getFacultyById(params.id as string)
        if (data) {
          setFaculty(data)
          setCompletion(calculateCompletion(data))
        }
      } catch {
        // DB not connected
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading faculty profile...</div>
  }

  if (!faculty || !completion) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
        <Card><CardContent className="p-8 text-center text-muted-foreground">Faculty not found. Database may need migration.</CardContent></Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/faculty">
          <Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{faculty.user.name}</h1>
          <p className="text-muted-foreground">{faculty.user.email} &middot; {faculty.employeeId}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{faculty.hIndex}</div>
            <div className="text-sm text-muted-foreground">H-Index</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{faculty.totalCitations.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Citations</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{faculty.publications.length}</div>
            <div className="text-sm text-muted-foreground">Publications</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{faculty.researchScore.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Research Score</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FacultyProfileForm faculty={faculty} completion={completion} onUpdate={(f, c) => { setFaculty(f); setCompletion(c) }} />
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><BookOpen className="h-4 w-4" />Expertise</CardTitle></CardHeader>
            <CardContent>
              {faculty.expertise.length === 0 ? (
                <p className="text-sm text-muted-foreground">No expertise added yet</p>
              ) : (
                <div className="space-y-2">
                  {faculty.expertise.map((e) => (
                    <div key={e.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{e.area}</span>
                        {e.isPrimary && <Badge variant="default" className="text-xs">Primary</Badge>}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {e.keywords.map((k, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{k}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Cpu className="h-4 w-4" />Skills & Software</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {faculty.skills.length === 0 && faculty.software.length === 0 ? (
                <p className="text-sm text-muted-foreground">No skills or software added yet</p>
              ) : (
                <>
                  {faculty.skills.map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-sm">
                      <span>{s.skill}</span>
                      <Badge variant="outline">{s.level}</Badge>
                    </div>
                  ))}
                  {faculty.software.map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-sm">
                      <span>{s.software}</span>
                      <Badge variant="outline">{s.expertise}</Badge>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Trophy className="h-4 w-4" />Awards</CardTitle></CardHeader>
            <CardContent>
              {faculty.awards.length === 0 ? (
                <p className="text-sm text-muted-foreground">No awards added yet</p>
              ) : (
                <div className="space-y-2">
                  {faculty.awards.map((a) => (
                    <div key={a.id} className="text-sm">
                      <div className="font-medium">{a.title}</div>
                      <div className="text-muted-foreground">{a.awardedBy} &middot; {a.year}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
