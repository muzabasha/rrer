"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

export interface ConsultancyListParams {
  search?: string
  status?: string
  facultyId?: string
  page?: number
  limit?: number
}

export interface ConsultancyListResult {
  consultancies: ConsultancyWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ConsultancyWithRelations {
  id: string
  title: string
  description: string | null
  quotationAmount: number
  agreedAmount: number | null
  startDate: Date
  endDate: Date | null
  status: string
  mouUrl: string | null
  industryPartner: { id: string; name: string; industry: string }
  faculty?: { id: string; user: { name: string; email: string }; department: string }
  _count?: { deliverables: number; invoices: number }
}

export async function getConsultancies(params: ConsultancyListParams): Promise<ConsultancyListResult> {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const { search, status, facultyId, page = 1, limit = 20 } = params
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (facultyId) where.facultyId = facultyId
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ]
  }

  const [consultancies, total] = await Promise.all([
    prisma.consultancyProject.findMany({
      where,
      include: {
        industryPartner: { select: { id: true, name: true, industry: true } },
        faculty: { select: { id: true, user: { select: { name: true, email: true } }, department: true } },
        _count: { select: { deliverables: true, invoices: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.consultancyProject.count({ where }),
  ])

  return { consultancies, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function getConsultancyById(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  return prisma.consultancyProject.findUnique({
    where: { id },
    include: {
      industryPartner: true,
      faculty: {
        include: { user: { select: { name: true, email: true, image: true } } },
      },
      deliverables: { orderBy: { dueDate: "asc" } },
      invoices: { orderBy: { issuedDate: "desc" } },
      feedback: true,
    },
  })
}

export async function createConsultancy(data: {
  title: string
  description?: string
  industryPartnerId: string
  facultyId: string
  quotationAmount: number
  startDate: string
  endDate?: string
}) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const consultancy = await prisma.consultancyProject.create({
    data: {
      title: data.title,
      description: data.description,
      industryPartnerId: data.industryPartnerId,
      facultyId: data.facultyId,
      quotationAmount: data.quotationAmount,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      status: "INITIATED",
    },
    include: { industryPartner: true },
  })

  return { success: true, consultancy }
}

export async function updateConsultancy(
  id: string,
  data: {
    title?: string
    description?: string
    quotationAmount?: number
    agreedAmount?: number
    status?: string
    endDate?: string
  }
) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const updateData: Record<string, unknown> = {}
  if (data.title !== undefined) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description
  if (data.quotationAmount !== undefined) updateData.quotationAmount = data.quotationAmount
  if (data.agreedAmount !== undefined) updateData.agreedAmount = data.agreedAmount
  if (data.status !== undefined) updateData.status = data.status
  if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null

  const consultancy = await prisma.consultancyProject.update({ where: { id }, data: updateData })
  return { success: true, consultancy }
}

export async function addDeliverable(
  projectId: string,
  data: { title: string; description?: string; dueDate: string }
) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const deliverable = await prisma.deliverable.create({
    data: {
      projectId,
      title: data.title,
      description: data.description,
      dueDate: new Date(data.dueDate),
    },
  })

  return { success: true, deliverable }
}

export async function completeDeliverable(deliverableId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const deliverable = await prisma.deliverable.update({
    where: { id: deliverableId },
    data: { status: "COMPLETED", completedAt: new Date() },
  })

  return { success: true, deliverable }
}

export async function addInvoice(
  projectId: string,
  data: { invoiceNumber: string; amount: number; issuedDate: string }
) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const invoice = await prisma.invoice.create({
    data: {
      projectId,
      invoiceNumber: data.invoiceNumber,
      amount: data.amount,
      issuedDate: new Date(data.issuedDate),
    },
  })

  return { success: true, invoice }
}

export async function markInvoicePaid(invoiceId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const invoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: "PAID", paidDate: new Date() },
  })

  return { success: true, invoice }
}

export async function submitFeedback(
  projectId: string,
  data: { rating: number; comments?: string }
) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const feedback = await prisma.clientFeedback.create({
    data: {
      projectId,
      rating: data.rating,
      comments: data.comments,
    },
  })

  return { success: true, feedback }
}

export async function createIndustryPartner(data: {
  name: string
  industry: string
  country: string
  website?: string
  contactPerson?: string
  contactEmail?: string
  contactPhone?: string
}) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const partner = await prisma.industryPartner.create({ data })
  return { success: true, partner }
}

export async function getIndustryPartners() {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  return prisma.industryPartner.findMany({
    include: { _count: { select: { consultancies: true } } },
    orderBy: { name: "asc" },
  })
}

export async function getConsultancyAnalytics() {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const consultancies = await prisma.consultancyProject.findMany({
    select: {
      quotationAmount: true,
      agreedAmount: true,
      status: true,
      startDate: true,
      industryPartner: { select: { industry: true } },
      faculty: { select: { department: true, school: true } },
      invoices: { select: { amount: true, status: true } },
    },
  })

  const totalRevenue = consultancies.reduce((sum, c) => {
    const paidInvoices = c.invoices.filter((i) => i.status === "PAID")
    return sum + paidInvoices.reduce((s, i) => s + i.amount, 0)
  }, 0)

  const totalQuotation = consultancies.reduce((sum, c) => sum + c.quotationAmount, 0)
  const totalAgreed = consultancies.reduce((sum, c) => sum + (c.agreedAmount || c.quotationAmount), 0)

  const statusCounts = new Map<string, number>()
  for (const c of consultancies) {
    statusCounts.set(c.status, (statusCounts.get(c.status) || 0) + 1)
  }

  const industryDist = new Map<string, number>()
  for (const c of consultancies) {
    const ind = c.industryPartner.industry
    industryDist.set(ind, (industryDist.get(ind) || 0) + 1)
  }

  return {
    total: consultancies.length,
    totalRevenue,
    totalQuotation,
    totalAgreed,
    statusDistribution: Array.from(statusCounts.entries()).map(([status, count]) => ({ status, count })),
    industryDistribution: Array.from(industryDist.entries()).map(([industry, count]) => ({ industry, count })),
  }
}
