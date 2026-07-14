"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

export interface PublicationListParams {
  facultyId?: string
  search?: string
  type?: string
  quartile?: string
  yearFrom?: number
  yearTo?: number
  page?: number
  limit?: number
}

export interface PublicationListResult {
  publications: PublicationWithFaculty[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PublicationWithFaculty {
  id: string
  facultyId: string
  title: string
  authors: string[]
  journal: string | null
  conference: string | null
  year: number
  doi: string | null
  citations: number
  quartile: string | null
  impactFactor: number | null
  type: string
  createdAt: Date
  faculty?: {
    id: string
    user: { name: string; email: string }
    department: string
    school: string
  }
}

export interface PublicationAnalytics {
  totalCount: number
  totalCitations: number
  averageCitations: number
  hIndex: number
  quartileDistribution: Record<string, number>
  typeDistribution: Record<string, number>
  yearTrends: { year: number; count: number; citations: number }[]
  topCited: { title: string; citations: number; year: number }[]
  q1Count: number
  q2Count: number
}

function calculateHIndex(citations: number[]): number {
  const sorted = [...citations].sort((a, b) => b - a)
  let h = 0
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] >= i + 1) {
      h = i + 1
    } else {
      break
    }
  }
  return h
}

export async function getPublications(params: PublicationListParams): Promise<PublicationListResult> {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const { facultyId, search, type, quartile, yearFrom, yearTo, page = 1, limit = 20 } = params
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (facultyId) where.facultyId = facultyId
  if (type) where.type = type
  if (quartile) where.quartile = quartile
  if (yearFrom || yearTo) {
    where.year = {}
    if (yearFrom) (where.year as Record<string, number>).gte = yearFrom
    if (yearTo) (where.year as Record<string, number>).lte = yearTo
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { journal: { contains: search, mode: "insensitive" } },
      { conference: { contains: search, mode: "insensitive" } },
    ]
  }

  const [publications, total] = await Promise.all([
    prisma.facultyPublication.findMany({
      where,
      include: facultyId ? undefined : {
        faculty: {
          select: {
            id: true,
            user: { select: { name: true, email: true } },
            department: true,
            school: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { year: "desc" },
    }),
    prisma.facultyPublication.count({ where }),
  ])

  return {
    publications: publications as PublicationWithFaculty[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function updatePublication(
  id: string,
  data: {
    title?: string
    authors?: string
    journal?: string
    conference?: string
    year?: number
    doi?: string
    citations?: number
    quartile?: string
    impactFactor?: number
    type?: string
  }
) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const updateData: Record<string, unknown> = {}
  if (data.title !== undefined) updateData.title = data.title
  if (data.authors !== undefined) updateData.authors = data.authors.split(",").map((a) => a.trim()).filter(Boolean)
  if (data.journal !== undefined) updateData.journal = data.journal || null
  if (data.conference !== undefined) updateData.conference = data.conference || null
  if (data.year !== undefined) updateData.year = data.year
  if (data.doi !== undefined) updateData.doi = data.doi || null
  if (data.citations !== undefined) updateData.citations = data.citations
  if (data.quartile !== undefined) updateData.quartile = data.quartile || null
  if (data.impactFactor !== undefined) updateData.impactFactor = data.impactFactor || null
  if (data.type !== undefined) updateData.type = data.type

  const publication = await prisma.facultyPublication.update({
    where: { id },
    data: updateData,
  })

  const pub = await prisma.facultyPublication.findUnique({ where: { id } })
  if (pub) {
    const totalCitations = await prisma.facultyPublication.aggregate({
      where: { facultyId: pub.facultyId },
      _sum: { citations: true },
    })
    const pubs = await prisma.facultyPublication.findMany({
      where: { facultyId: pub.facultyId },
      select: { citations: true },
    })
    const hIndex = calculateHIndex(pubs.map((p) => p.citations))

    await prisma.faculty.update({
      where: { id: pub.facultyId },
      data: {
        totalCitations: totalCitations._sum.citations || 0,
        hIndex,
      },
    })
  }

  return { success: true, publication }
}

export async function getPublicationAnalytics(facultyId?: string): Promise<PublicationAnalytics> {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const where = facultyId ? { facultyId } : {}

  const [publications, agg] = await Promise.all([
    prisma.facultyPublication.findMany({
      where,
      select: { citations: true, year: true, type: true, quartile: true, title: true },
      orderBy: { citations: "desc" },
    }),
    prisma.facultyPublication.aggregate({
      where,
      _sum: { citations: true },
      _avg: { citations: true },
      _count: true,
    }),
  ])

  const citations = publications.map((p) => p.citations)
  const hIndex = calculateHIndex(citations)

  const quartileDistribution: Record<string, number> = {}
  const typeDistribution: Record<string, number> = {}
  const yearMap = new Map<number, { count: number; citations: number }>()

  for (const pub of publications) {
    if (pub.quartile) {
      quartileDistribution[pub.quartile] = (quartileDistribution[pub.quartile] || 0) + 1
    }
    typeDistribution[pub.type] = (typeDistribution[pub.type] || 0) + 1

    const existing = yearMap.get(pub.year) || { count: 0, citations: 0 }
    yearMap.set(pub.year, {
      count: existing.count + 1,
      citations: existing.citations + pub.citations,
    })
  }

  const yearTrends = Array.from(yearMap.entries())
    .map(([year, data]) => ({ year, ...data }))
    .sort((a, b) => b.year - a.year)

  const topCited = publications
    .filter((p) => p.citations > 0)
    .slice(0, 5)
    .map((p) => ({ title: p.title, citations: p.citations, year: p.year }))

  return {
    totalCount: agg._count,
    totalCitations: agg._sum.citations || 0,
    averageCitations: Math.round((agg._avg.citations || 0) * 10) / 10,
    hIndex,
    quartileDistribution,
    typeDistribution,
    yearTrends,
    topCited,
    q1Count: quartileDistribution["Q1"] || 0,
    q2Count: quartileDistribution["Q2"] || 0,
  }
}

export async function getPublicationById(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const publication = await prisma.facultyPublication.findUnique({
    where: { id },
    include: {
      faculty: {
        select: {
          id: true,
          user: { select: { name: true, email: true } },
          department: true,
          school: true,
        },
      },
    },
  })

  return publication
}
