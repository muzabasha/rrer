"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { getFacultyList, getDepartments, getSchools } from "@/lib/actions/faculty.actions"
import type { FacultyWithUser, FacultyListResult } from "@/types/faculty.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

export default function FacultyPage() {
  const [data, setData] = useState<FacultyListResult | null>(null)
  const [search, setSearch] = useState("")
  const [department, setDepartment] = useState("")
  const [school, setSchool] = useState("")
  const [page, setPage] = useState(1)
  const [departments, setDepartments] = useState<string[]>([])
  const [schools, setSchools] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFaculty = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getFacultyList({ search, department, school, page, limit: 10 })
      setData(result)
    } catch {
      // Database not connected yet
    } finally {
      setLoading(false)
    }
  }, [search, department, school, page])

  useEffect(() => {
    fetchFaculty()
  }, [fetchFaculty])

  useEffect(() => {
    Promise.all([getDepartments(), getSchools()]).then(([depts, sch]) => {
      setDepartments(depts)
      setSchools(sch)
    }).catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Faculty</h1>
          <p className="text-muted-foreground">Manage faculty profiles and research metrics</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or employee ID..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-9"
              />
            </div>
            <select
              value={department}
              onChange={(e) => { setDepartment(e.target.value); setPage(1) }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select
              value={school}
              onChange={(e) => { setSchool(e.target.value); setPage(1) }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Schools</option>
              {schools.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : !data || data.faculty.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {data?.total === 0 ? "No faculty found. Database may need seeding." : "Failed to load faculty data."}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>H-Index</TableHead>
                    <TableHead>Citations</TableHead>
                    <TableHead>Profile</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.faculty.map((f: FacultyWithUser) => (
                    <TableRow key={f.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{f.user.name}</div>
                          <div className="text-sm text-muted-foreground">{f.user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{f.employeeId}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{f.department}</TableCell>
                      <TableCell>{f.designation}</TableCell>
                      <TableCell>{f.hIndex}</TableCell>
                      <TableCell>{f.totalCitations.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={f.profileCompletion >= 80 ? "success" : f.profileCompletion >= 50 ? "warning" : "secondary"}>
                          {f.profileCompletion}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href={`/faculty/${f.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between border-t px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  Showing {(data.page - 1) * data.limit + 1}–{Math.min(data.page * data.limit, data.total)} of {data.total}
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
