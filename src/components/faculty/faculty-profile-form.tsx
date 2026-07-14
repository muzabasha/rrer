"use client"

import { useState } from "react"
import type { FacultyWithUser, ProfileCompletionBreakdown } from "@/types/faculty.types"
import { updateFacultyProfile } from "@/lib/actions/faculty.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Save, ExternalLink } from "lucide-react"

interface FacultyProfileFormProps {
  faculty: FacultyWithUser
  completion: ProfileCompletionBreakdown
  onUpdate: (faculty: FacultyWithUser, completion: ProfileCompletionBreakdown) => void
}

const schools = [
  "School of Engineering & Technology",
  "School of Computer Science & Engineering",
  "School of Management & Business Studies",
  "School of Law",
  "School of Pharmacy",
  "School of Nursing",
  "School of Architecture",
  "School of Design",
  "School of Arts, Humanities & Social Sciences",
  "School of Sciences",
]

const designations = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Senior Lecturer",
  "Lecturer",
  "Adjunct Professor",
  "Visiting Faculty",
  "Research Fellow",
]

export function FacultyProfileForm({ faculty, completion, onUpdate }: FacultyProfileFormProps) {
  const [form, setForm] = useState({
    employeeId: faculty.employeeId,
    department: faculty.department,
    school: faculty.school,
    designation: faculty.designation,
    joiningDate: faculty.joiningDate ? new Date(faculty.joiningDate).toISOString().split("T")[0] : "",
    googleScholarId: faculty.googleScholarId || "",
    scopusId: faculty.scopusId || "",
    orcid: faculty.orcid || "",
    webOfScienceId: faculty.webOfScienceId || "",
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const result = await updateFacultyProfile(faculty.id, form)
      if (result.success && result.faculty && result.completion) {
        onUpdate(result.faculty, result.completion)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } finally {
      setSaving(false)
    }
  }

  const completionItems = [
    { label: "Basic Info", done: completion.basicInfo },
    { label: "Expertise", done: completion.expertise },
    { label: "Skills", done: completion.skills },
    { label: "Publications", done: completion.publications },
    { label: "External IDs", done: completion.externalIds },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Profile Completion</CardTitle>
            <Badge variant={completion.percentage >= 80 ? "success" : completion.percentage >= 50 ? "warning" : "secondary"}>
              {completion.percentage}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {completionItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm">
                <div className={`h-2 w-2 rounded-full ${item.done ? "bg-emerald-500" : "bg-muted"}`} />
                <span className={item.done ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input id="employeeId" value={form.employeeId} onChange={(e) => updateField("employeeId", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <select
                id="designation"
                value={form.designation}
                onChange={(e) => updateField("designation", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select designation</option>
                {designations.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="school">School</Label>
              <select
                id="school"
                value={form.school}
                onChange={(e) => updateField("school", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select school</option>
                {schools.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" value={form.department} onChange={(e) => updateField("department", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="joiningDate">Joining Date</Label>
              <Input id="joiningDate" type="date" value={form.joiningDate} onChange={(e) => updateField("joiningDate", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>External Profiles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="googleScholarId">Google Scholar ID</Label>
              <div className="flex gap-2">
                <Input id="googleScholarId" value={form.googleScholarId} onChange={(e) => updateField("googleScholarId", e.target.value)} placeholder="e.g., ABC123DEF" />
                {form.googleScholarId && (
                  <a href={`https://scholar.google.com/citations?user=${form.googleScholarId}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon"><ExternalLink className="h-4 w-4" /></Button>
                  </a>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scopusId">Scopus ID</Label>
              <div className="flex gap-2">
                <Input id="scopusId" value={form.scopusId} onChange={(e) => updateField("scopusId", e.target.value)} placeholder="e.g., 57204123456" />
                {form.scopusId && (
                  <a href={`https://www.scopus.com/authid/detail.uri?authorId=${form.scopusId}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon"><ExternalLink className="h-4 w-4" /></Button>
                  </a>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="orcid">ORCID</Label>
              <div className="flex gap-2">
                <Input id="orcid" value={form.orcid} onChange={(e) => updateField("orcid", e.target.value)} placeholder="e.g., 0000-0002-1234-5678" />
                {form.orcid && (
                  <a href={`https://orcid.org/${form.orcid}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon"><ExternalLink className="h-4 w-4" /></Button>
                  </a>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="webOfScienceId">Web of Science ID</Label>
              <Input id="webOfScienceId" value={form.webOfScienceId} onChange={(e) => updateField("webOfScienceId", e.target.value)} placeholder="e.g., ABC-1234-5678" />
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              {saved && <span className="text-sm text-emerald-600">Saved successfully!</span>}
            </div>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
