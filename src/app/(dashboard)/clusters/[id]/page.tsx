"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { getClusterById, removeClusterMember } from "@/lib/actions/cluster.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Users, BookOpen, Quote, DollarSign, Trash2 } from "lucide-react"
import Link from "next/link"

export default function ClusterDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [cluster, setCluster] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const data = await getClusterById(id)
      setCluster(data)
    } catch {
      // not found or DB error
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleRemoveMember(facultyId: string) {
    if (!confirm("Remove this member from the cluster?")) return
    await removeClusterMember(id, facultyId)
    fetchData()
  }

  if (loading) return <div className="p-6 text-center text-muted-foreground">Loading...</div>
  if (!cluster) return <div className="p-6 text-center text-muted-foreground">Cluster not found</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clusters">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{cluster.name}</h1>
          <p className="text-muted-foreground">{cluster.description || "No description"}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {cluster.keywords.map((kw: string) => (
          <Badge key={kw} variant="secondary">{kw}</Badge>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Members", value: cluster.members.length, icon: Users },
          { label: "Publications", value: cluster.publicationCount, icon: BookOpen },
          { label: "Citations", value: cluster.citationCount, icon: Quote },
          { label: "Score", value: cluster.clusterScore.toFixed(0), icon: DollarSign },
        ].map((s) => (
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cluster Members ({cluster.members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {cluster.members.length === 0 ? (
            <p className="text-muted-foreground text-sm">No members in this cluster</p>
          ) : (
            <div className="space-y-3">
              {cluster.members.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={m.faculty.user.image} />
                      <AvatarFallback>{m.faculty.user.name?.charAt(0) || "?"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Link href={`/faculty/${m.facultyId}`} className="font-medium hover:underline text-sm">
                        {m.faculty.user.name}
                      </Link>
                      <div className="text-xs text-muted-foreground">{m.faculty.department}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{m.role}</Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveMember(m.facultyId)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {cluster.clusterKeywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cluster Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cluster.clusterKeywords.map((ck: any) => (
                <div key={ck.id} className="flex items-center justify-between text-sm">
                  <span>{ck.keyword}</span>
                  <span className="text-muted-foreground">Weight: {ck.weight}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
