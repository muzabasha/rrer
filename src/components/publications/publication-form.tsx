"use client"

import { useState } from "react"
import { addPublication } from "@/lib/actions/faculty.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, X } from "lucide-react"

interface PublicationFormProps {
  facultyId: string
  onAdded?: () => void
}

const pubTypes = ["JOURNAL", "CONFERENCE", "BOOK", "CHAPTER", "PREPRINT", "OTHER"]
const quartiles = ["Q1", "Q2", "Q3", "Q4"]

export function PublicationForm({ facultyId, onAdded }: PublicationFormProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    title: "",
    authors: "",
    journal: "",
    conference: "",
    year: new Date().getFullYear().toString(),
    doi: "",
    citations: "0",
    quartile: "",
    impactFactor: "",
    type: "JOURNAL",
  })
  const [saving, setSaving] = useState(false)

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await addPublication(facultyId, {
        title: form.title,
        authors: form.authors,
        journal: form.journal || undefined,
        conference: form.conference || undefined,
        year: parseInt(form.year),
        doi: form.doi || undefined,
        citations: parseInt(form.citations) || 0,
        quartile: form.quartile || undefined,
        impactFactor: form.impactFactor ? parseFloat(form.impactFactor) : undefined,
        type: form.type,
      })
      setForm({
        title: "", authors: "", journal: "", conference: "",
        year: new Date().getFullYear().toString(), doi: "", citations: "0",
        quartile: "", impactFactor: "", type: "JOURNAL",
      })
      setOpen(false)
      onAdded?.()
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />Add Publication
      </Button>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">New Publication</CardTitle>
        <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pub-title">Title *</Label>
            <Input id="pub-title" value={form.title} onChange={(e) => updateField("title", e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pub-authors">Authors * (comma separated)</Label>
            <Input id="pub-authors" value={form.authors} onChange={(e) => updateField("authors", e.target.value)} placeholder="John Doe, Jane Smith" required />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="pub-type">Type</Label>
              <select id="pub-type" value={form.type} onChange={(e) => updateField("type", e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {pubTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pub-year">Year</Label>
              <Input id="pub-year" type="number" value={form.year} onChange={(e) => updateField("year", e.target.value)} min="1900" max={new Date().getFullYear() + 1} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pub-citations">Citations</Label>
              <Input id="pub-citations" type="number" value={form.citations} onChange={(e) => updateField("citations", e.target.value)} min="0" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pub-journal">Journal</Label>
              <Input id="pub-journal" value={form.journal} onChange={(e) => updateField("journal", e.target.value)} placeholder="Journal name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pub-conference">Conference</Label>
              <Input id="pub-conference" value={form.conference} onChange={(e) => updateField("conference", e.target.value)} placeholder="Conference name" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="pub-doi">DOI</Label>
              <Input id="pub-doi" value={form.doi} onChange={(e) => updateField("doi", e.target.value)} placeholder="10.xxxx/xxxxx" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pub-quartile">Quartile</Label>
              <select id="pub-quartile" value={form.quartile} onChange={(e) => updateField("quartile", e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">None</option>
                {quartiles.map((q) => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pub-if">Impact Factor</Label>
              <Input id="pub-if" type="number" step="0.001" value={form.impactFactor} onChange={(e) => updateField("impactFactor", e.target.value)} min="0" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>{saving ? "Adding..." : "Add Publication"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
