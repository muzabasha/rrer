"use client"

import { useState, useEffect } from "react"
import { getPublicationAnalytics, type PublicationAnalytics } from "@/lib/actions/publication.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Quote, TrendingUp, Award } from "lucide-react"

interface PublicationAnalyticsProps {
  facultyId?: string
  refreshKey?: number
}

export function PublicationAnalyticsCard({ facultyId, refreshKey }: PublicationAnalyticsProps) {
  const [analytics, setAnalytics] = useState<PublicationAnalytics | null>(null)

  useEffect(() => {
    getPublicationAnalytics(facultyId)
      .then(setAnalytics)
      .catch(() => {})
  }, [facultyId, refreshKey])

  if (!analytics) return null

  const stats = [
    { label: "Publications", value: analytics.totalCount, icon: BookOpen },
    { label: "Total Citations", value: analytics.totalCitations.toLocaleString(), icon: Quote },
    { label: "H-Index", value: analytics.hIndex, icon: TrendingUp },
    { label: "Q1 + Q2", value: `${analytics.q1Count} + ${analytics.q2Count}`, icon: Award },
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
                <s.icon className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {Object.keys(analytics.quartileDistribution).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quartile Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(analytics.quartileDistribution)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([q, count]) => (
                  <div key={q} className="text-center">
                    <div className="text-lg font-bold">{count}</div>
                    <div className="text-xs text-muted-foreground">{q}</div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {analytics.topCited.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Most Cited</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.topCited.map((pub, i) => (
                <div key={i} className="flex items-start justify-between text-sm">
                  <span className="line-clamp-1 flex-1">{pub.title}</span>
                  <span className="ml-2 shrink-0 text-muted-foreground">{pub.citations} citations</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
