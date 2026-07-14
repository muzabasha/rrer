"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

export interface ClusterListParams {
  search?: string
  isActive?: boolean
  page?: number
  limit?: number
}

export interface ClusterListResult {
  clusters: ClusterWithMembers[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ClusterWithMembers {
  id: string
  name: string
  description: string | null
  keywords: string[]
  clusterScore: number
  publicationCount: number
  citationCount: number
  fundingAmount: number
  patentCount: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  memberCount?: number
}

export async function getClusters(params: ClusterListParams): Promise<ClusterListResult> {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const { search, isActive, page = 1, limit = 20 } = params
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (isActive !== undefined) where.isActive = isActive
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ]
  }

  const [clusters, total] = await Promise.all([
    prisma.researchCluster.findMany({
      where,
      include: { _count: { select: { members: true } } },
      skip,
      take: limit,
      orderBy: { clusterScore: "desc" },
    }),
    prisma.researchCluster.count({ where }),
  ])

  const result = clusters.map((c) => ({
    ...c,
    memberCount: c._count.members,
    _count: undefined,
  }))

  return {
    clusters: result as ClusterWithMembers[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getClusterById(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  return prisma.researchCluster.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          faculty: {
            include: {
              user: { select: { name: true, email: true, image: true } },
            },
          },
        },
        orderBy: { joinedAt: "desc" },
      },
      clusterKeywords: true,
    },
  })
}

export async function createCluster(data: {
  name: string
  description?: string
  keywords: string[]
}) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const cluster = await prisma.researchCluster.create({
    data: {
      name: data.name,
      description: data.description,
      keywords: data.keywords,
      clusterKeywords: {
        create: data.keywords.map((k) => ({ keyword: k })),
      },
    },
    include: { clusterKeywords: true },
  })

  return { success: true, cluster }
}

export async function updateCluster(
  id: string,
  data: {
    name?: string
    description?: string
    keywords?: string[]
    isActive?: boolean
  }
) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const updateData: Record<string, unknown> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.keywords !== undefined) updateData.keywords = data.keywords
  if (data.isActive !== undefined) updateData.isActive = data.isActive

  if (data.keywords) {
    await prisma.clusterKeyword.deleteMany({ where: { clusterId: id } })
    await prisma.clusterKeyword.createMany({
      data: data.keywords.map((k) => ({ clusterId: id, keyword: k })),
    })
  }

  const cluster = await prisma.researchCluster.update({
    where: { id },
    data: updateData,
  })

  return { success: true, cluster }
}

export async function deleteCluster(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const memberCount = await prisma.clusterMember.count({ where: { clusterId: id } })
  if (memberCount > 0) {
    await prisma.researchCluster.update({
      where: { id },
      data: { isActive: false },
    })
  } else {
    await prisma.clusterKeyword.deleteMany({ where: { clusterId: id } })
    await prisma.researchCluster.delete({ where: { id } })
  }

  return { success: true }
}

export async function addClusterMember(clusterId: string, facultyId: string, role = "MEMBER") {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const member = await prisma.clusterMember.create({
    data: { clusterId, facultyId, role },
  })

  await recalculateClusterScore(clusterId)

  return { success: true, member }
}

export async function removeClusterMember(clusterId: string, facultyId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  await prisma.clusterMember.delete({
    where: { clusterId_facultyId: { clusterId, facultyId } },
  })

  await recalculateClusterScore(clusterId)

  return { success: true }
}

async function recalculateClusterScore(clusterId: string) {
  const members = await prisma.clusterMember.findMany({
    where: { clusterId },
    include: {
      faculty: {
        include: {
          publications: { select: { citations: true } },
        },
      },
    },
  })

  let totalPubs = 0
  let totalCitations = 0
  const totalFunding = 0

  for (const m of members) {
    totalPubs += m.faculty.publications.length
    totalCitations += m.faculty.publications.reduce((sum, p) => sum + p.citations, 0)
  }

  const score = totalPubs * 10 + totalCitations

  await prisma.researchCluster.update({
    where: { id: clusterId },
    data: {
      publicationCount: totalPubs,
      citationCount: totalCitations,
      fundingAmount: totalFunding,
      clusterScore: score,
    },
  })
}

export async function autoGenerateClusters() {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const faculty = await prisma.faculty.findMany({
    select: {
      id: true,
      expertise: { select: { keywords: true, area: true } },
      publications: { select: { id: true, citations: true } },
    },
  })

  const keywordToFaculty = new Map<string, string[]>()
  for (const f of faculty) {
    const allKeywords = f.expertise.flatMap((e) => [...e.keywords, e.area])
    for (const keyword of allKeywords) {
      const normalized = keyword.toLowerCase().trim()
      if (!normalized) continue
      const existing = keywordToFaculty.get(normalized) || []
      existing.push(f.id)
      keywordToFaculty.set(normalized, existing)
    }
  }

  const adjacency = new Map<string, Set<string>>()
  const sharedKeywords = new Map<string, number>()
  for (const [, fids] of keywordToFaculty) {
    if (fids.length < 2) continue
    for (let i = 0; i < fids.length; i++) {
      for (let j = i + 1; j < fids.length; j++) {
        const pair = [fids[i], fids[j]].sort().join(":")
        const count = (sharedKeywords.get(pair) || 0) + 1
        sharedKeywords.set(pair, count)
        if (!adjacency.has(fids[i])) adjacency.set(fids[i], new Set())
        if (!adjacency.has(fids[j])) adjacency.set(fids[j], new Set())
        adjacency.get(fids[i])!.add(fids[j])
        adjacency.get(fids[j])!.add(fids[i])
      }
    }
  }

  const visited = new Set<string>()
  const groups: Set<string>[] = []

  for (const fid of faculty.map((f) => f.id)) {
    if (visited.has(fid)) continue
    const group = new Set<string>()
    const queue = [fid]
    while (queue.length > 0) {
      const current = queue.shift()!
      if (visited.has(current)) continue
      visited.add(current)
      group.add(current)
      for (const neighbor of adjacency.get(current) || []) {
        if (!visited.has(neighbor)) {
          const pair = [current, neighbor].sort().join(":")
          if ((sharedKeywords.get(pair) || 0) >= 2) {
            queue.push(neighbor)
          }
        }
      }
    }
    if (group.size >= 2) {
      groups.push(group)
    }
  }

  const created = []
  for (const group of groups) {
    const fids = Array.from(group)
    const keywordCounts = new Map<string, number>()
    for (const fid of fids) {
      const f = faculty.find((f) => f.id === fid)!
      for (const e of f.expertise) {
        for (const kw of [...e.keywords, e.area]) {
          const normalized = kw.toLowerCase().trim()
          keywordCounts.set(normalized, (keywordCounts.get(normalized) || 0) + 1)
        }
      }
    }

    const topKeywords = Array.from(keywordCounts.entries())
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([kw]) => kw)

    const totalPubs = fids.reduce((sum, fid) => {
      const f = faculty.find((f) => f.id === fid)!
      return sum + f.publications.length
    }, 0)
    const totalCitations = fids.reduce((sum, fid) => {
      const f = faculty.find((f) => f.id === fid)!
      return sum + f.publications.reduce((s, p) => s + p.citations, 0)
    }, 0)

    const clusterName = topKeywords.slice(0, 3).map((k) => k.charAt(0).toUpperCase() + k.slice(1)).join(" & ")

    const cluster = await prisma.researchCluster.create({
      data: {
        name: clusterName,
        description: `Auto-generated cluster based on shared expertise in: ${topKeywords.join(", ")}`,
        keywords: topKeywords,
        publicationCount: totalPubs,
        citationCount: totalCitations,
        clusterScore: totalPubs * 10 + totalCitations,
        members: {
          create: fids.map((fid) => ({ facultyId: fid, role: "MEMBER" })),
        },
        clusterKeywords: {
          create: topKeywords.map((kw) => ({ keyword: kw })),
        },
      },
      include: { _count: { select: { members: true } } },
    })

    created.push(cluster)
  }

  return { success: true, clustersCreated: created.length, clusters: created }
}

export async function getClusterAnalytics(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const cluster = await prisma.researchCluster.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          faculty: {
            include: {
              publications: { select: { citations: true, year: true } },
              consultancies: { select: { quotationAmount: true, agreedAmount: true } },
              patents: { select: { id: true } },
            },
          },
        },
      },
    },
  })

  if (!cluster) return null

  let publicationCount = 0
  let citationCount = 0
  let fundingAmount = 0
  let patentCount = 0
  const yearTrends = new Map<number, { pubs: number; citations: number }>()

  for (const m of cluster.members) {
    publicationCount += m.faculty.publications.length
    for (const p of m.faculty.publications) {
      citationCount += p.citations
      const existing = yearTrends.get(p.year) || { pubs: 0, citations: 0 }
      yearTrends.set(p.year, { pubs: existing.pubs + 1, citations: existing.citations + p.citations })
    }
    for (const c of m.faculty.consultancies) {
      fundingAmount += c.agreedAmount || c.quotationAmount
    }
    patentCount += m.faculty.patents.length
  }

  const trends = Array.from(yearTrends.entries())
    .map(([year, data]) => ({ year, ...data }))
    .sort((a, b) => b.year - a.year)

  return {
    publicationCount,
    citationCount,
    fundingAmount,
    patentCount,
    memberCount: cluster.members.length,
    yearTrends: trends,
  }
}
