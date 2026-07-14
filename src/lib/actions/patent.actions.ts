"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

export interface PatentListParams {
  search?: string
  status?: string
  inventorId?: string
  page?: number
  limit?: number
}

export interface PatentListResult {
  patents: PatentWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PatentWithRelations {
  id: string
  title: string
  abstract: string
  status: string
  filingDate: Date | null
  publicationDate: Date | null
  grantDate: Date | null
  patentNumber: string | null
  jurisdiction: string | null
  trl: number | null
  category: string | null
  applicationNumber: string | null
  createdAt: Date
  inventors?: { id: string; faculty: { user: { name: string }; department: string }; role: string; order: number }[]
  _count?: { stages: number; licenses: number; noveltyChecks: number }
}

export async function getPatents(params: PatentListParams): Promise<PatentListResult> {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const { search, status, inventorId, page = 1, limit = 20 } = params
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { abstract: { contains: search, mode: "insensitive" } },
      { patentNumber: { contains: search, mode: "insensitive" } },
    ]
  }
  if (inventorId) {
    where.inventors = { some: { facultyId: inventorId } }
  }

  const [patents, total] = await Promise.all([
    prisma.patent.findMany({
      where,
      include: {
        inventors: {
          include: {
            faculty: { include: { user: { select: { name: true } } } },
          },
          orderBy: { order: "asc" },
        },
        _count: { select: { stages: true, licenses: true, noveltyChecks: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.patent.count({ where }),
  ])

  return { patents, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function getPatentById(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  return prisma.patent.findUnique({
    where: { id },
    include: {
      inventors: {
        include: {
          faculty: { include: { user: { select: { name: true, email: true, image: true } } } },
        },
        orderBy: { order: "asc" },
      },
      stages: { orderBy: { enteredAt: "asc" } },
      licenses: true,
      noveltyChecks: true,
    },
  })
}

export async function createPatent(data: {
  title: string
  abstract: string
  category?: string
  jurisdiction?: string
  inventorIds: { facultyId: string; role?: string }[]
}) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const patent = await prisma.patent.create({
    data: {
      title: data.title,
      abstract: data.abstract,
      category: data.category,
      jurisdiction: data.jurisdiction,
      status: "IDEA",
      inventors: {
        create: data.inventorIds.map((inv, i) => ({
          facultyId: inv.facultyId,
          role: inv.role || "INVENTOR",
          order: i + 1,
        })),
      },
      stages: {
        create: { stage: "IDEA", notes: "Patent idea conceived" },
      },
    },
    include: {
      inventors: { include: { faculty: { include: { user: { select: { name: true } } } } } },
      stages: true,
    },
  })

  return { success: true, patent }
}

export async function updatePatentStatus(
  id: string,
  newStatus: string,
  notes?: string
) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const updateData: Record<string, unknown> = { status: newStatus }
  if (newStatus === "FILED") updateData.filingDate = new Date()
  if (newStatus === "PUBLISHED") updateData.publicationDate = new Date()
  if (newStatus === "GRANTED") updateData.grantDate = new Date()

  const patent = await prisma.patent.update({
    where: { id },
    data: updateData,
  })

  await prisma.patentStage.create({
    data: {
      patentId: id,
      stage: newStatus,
      notes: notes || `Status changed to ${newStatus}`,
    },
  })

  return { success: true, patent }
}

export async function updatePatent(
  id: string,
  data: {
    title?: string
    abstract?: string
    trl?: number
    category?: string
    jurisdiction?: string
    patentNumber?: string
    applicationNumber?: string
  }
) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const updateData: Record<string, unknown> = {}
  if (data.title !== undefined) updateData.title = data.title
  if (data.abstract !== undefined) updateData.abstract = data.abstract
  if (data.trl !== undefined) updateData.trl = data.trl
  if (data.category !== undefined) updateData.category = data.category
  if (data.jurisdiction !== undefined) updateData.jurisdiction = data.jurisdiction
  if (data.patentNumber !== undefined) updateData.patentNumber = data.patentNumber
  if (data.applicationNumber !== undefined) updateData.applicationNumber = data.applicationNumber

  const patent = await prisma.patent.update({ where: { id }, data: updateData })
  return { success: true, patent }
}

export async function addNoveltyCheck(
  patentId: string,
  data: { checkedBy: string; result: string; references: string[]; notes?: string }
) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const check = await prisma.noveltyCheck.create({
    data: {
      patentId,
      checkedBy: data.checkedBy,
      result: data.result,
      references: data.references,
      notes: data.notes,
    },
  })

  return { success: true, check }
}

export async function addLicense(
  patentId: string,
  data: { licensee: string; startDate: string; endDate?: string; revenue: number; terms?: string }
) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const license = await prisma.patentLicense.create({
    data: {
      patentId,
      licensee: data.licensee,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      revenue: data.revenue,
      terms: data.terms,
    },
  })

  return { success: true, license }
}

export async function addPatentInventor(
  patentId: string,
  facultyId: string,
  role = "INVENTOR"
) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const maxOrder = await prisma.patentInventor.aggregate({
    where: { patentId },
    _max: { order: true },
  })

  const inventor = await prisma.patentInventor.create({
    data: {
      patentId,
      facultyId,
      role,
      order: (maxOrder._max.order || 0) + 1,
    },
  })

  return { success: true, inventor }
}

export async function removePatentInventor(patentId: string, facultyId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  await prisma.patentInventor.delete({
    where: { patentId_facultyId: { patentId, facultyId } },
  })

  return { success: true }
}

export async function getPatentAnalytics() {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const patents = await prisma.patent.findMany({
    select: {
      status: true,
      trl: true,
      category: true,
      filingDate: true,
      grantDate: true,
      licenses: { select: { revenue: true } },
    },
  })

  const statusCounts = new Map<string, number>()
  const trlCounts = new Map<number, number>()
  const categoryCounts = new Map<string, number>()
  let totalRevenue = 0
  let grantedCount = 0

  for (const p of patents) {
    statusCounts.set(p.status, (statusCounts.get(p.status) || 0) + 1)
    if (p.trl) trlCounts.set(p.trl, (trlCounts.get(p.trl) || 0) + 1)
    if (p.category) categoryCounts.set(p.category, (categoryCounts.get(p.category) || 0) + 1)
    for (const l of p.licenses) {
      totalRevenue += l.revenue
    }
    if (p.status === "GRANTED" || p.status === "COMMERCIALIZED") grantedCount++
  }

  const funnel = ["IDEA", "NOVELTY_CHECK", "FILED", "PUBLISHED", "GRANTED", "COMMERCIALIZED"].map((stage) => ({
    stage,
    count: statusCounts.get(stage) || 0,
  }))

  return {
    total: patents.length,
    totalRevenue,
    grantedCount,
    grantRate: patents.length > 0 ? Math.round((grantedCount / patents.length) * 100) : 0,
    statusDistribution: Array.from(statusCounts.entries()).map(([status, count]) => ({ status, count })),
    trlDistribution: Array.from(trlCounts.entries()).map(([trl, count]) => ({ trl, count })).sort((a, b) => a.trl - b.trl),
    categoryDistribution: Array.from(categoryCounts.entries()).map(([category, count]) => ({ category, count })),
    funnel,
  }
}
