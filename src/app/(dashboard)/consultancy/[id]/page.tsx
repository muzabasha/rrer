"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { getConsultancyById, completeDeliverable, markInvoicePaid } from "@/lib/actions/consultancy.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function ConsultancyDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [consultancy, setConsultancy] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try { const data = await getConsultancyById(id); setConsultancy(data) }
    catch { /* not found */ }
    finally { setLoading(false) }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleCompleteDeliverable(deliverableId: string) {
    await completeDeliverable(deliverableId)
    fetchData()
  }

  async function handlePayInvoice(invoiceId: string) {
    await markInvoicePaid(invoiceId)
    fetchData()
  }

  if (loading) return <div className="p-6 text-center text-muted-foreground">Loading...</div>
  if (!consultancy) return <div className="p-6 text-center text-muted-foreground">Not found</div>

  const totalInvoiceAmount = consultancy.invoices?.reduce((s: number, i: any) => s + i.amount, 0) || 0
  const paidAmount = consultancy.invoices?.filter((i: any) => i.status === "PAID").reduce((s: number, i: any) => s + i.amount, 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/consultancy"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{consultancy.title}</h1>
          <p className="text-muted-foreground">Partner: {consultancy.industryPartner.name} ({consultancy.industryPartner.industry})</p>
        </div>
        <Badge variant="outline">{consultancy.status.replace(/_/g, " ")}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">₹{(consultancy.quotationAmount / 100000).toFixed(1)}L</div>
            <div className="text-xs text-muted-foreground">Quotation</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">₹{(consultancy.agreedAmount ? (consultancy.agreedAmount / 100000).toFixed(1) : "—")}L</div>
            <div className="text-xs text-muted-foreground">Agreed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">₹{(totalInvoiceAmount / 100000).toFixed(1)}L</div>
            <div className="text-xs text-muted-foreground">Invoiced</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">₹{(paidAmount / 100000).toFixed(1)}L</div>
            <div className="text-xs text-muted-foreground">Paid</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Project Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Faculty</span><span>{consultancy.faculty?.user.name || "—"}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Industry</span><span>{consultancy.industryPartner.industry}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Start</span><span>{new Date(consultancy.startDate).toLocaleDateString()}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">End</span><span>{consultancy.endDate ? new Date(consultancy.endDate).toLocaleDateString() : "—"}</span></div>
          </CardContent>
        </Card>

        {consultancy.feedback && (
          <Card>
            <CardHeader><CardTitle className="text-base">Client Feedback</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{consultancy.feedback.rating}/5</div>
              {consultancy.feedback.comments && <p className="text-sm text-muted-foreground">{consultancy.feedback.comments}</p>}
            </CardContent>
          </Card>
        )}
      </div>

      {consultancy.deliverables?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Deliverables</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {consultancy.deliverables.map((d: any) => (
                <div key={d.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${d.status === "COMPLETED" ? "bg-green-500" : "bg-gray-300"}`} />
                    <div>
                      <div className="text-sm font-medium">{d.title}</div>
                      <div className="text-xs text-muted-foreground">Due: {new Date(d.dueDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                  {d.status !== "COMPLETED" && (
                    <Button size="sm" variant="outline" onClick={() => handleCompleteDeliverable(d.id)}>
                      <CheckCircle className="mr-1 h-3 w-3" />Complete
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {consultancy.invoices?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Invoices</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {consultancy.invoices.map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{inv.invoiceNumber}</span>
                    <span className="text-muted-foreground ml-2">₹{inv.amount.toLocaleString()}</span>
                    <span className="text-muted-foreground ml-2">({new Date(inv.issuedDate).toLocaleDateString()})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={inv.status === "PAID" ? "default" : "secondary"}>{inv.status}</Badge>
                    {inv.status === "PENDING" && (
                      <Button size="sm" variant="outline" onClick={() => handlePayInvoice(inv.id)}>Mark Paid</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
