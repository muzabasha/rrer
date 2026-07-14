"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

export interface ProjectListParams {
  search?: string
  status?: string
  agencyId?: string
  piId?: string
  page?: number
  limit?: number
}

export interface ProjectListResult {
  projects: ProjectWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ProjectWithRelations {
  id: string
  title: string
  description: string | null
  status: string
  amountRequested: number
  amountAwarded: number | null
  startDate: Date | null
  endDate: Date | null
  submissionDate: Date | null
  awardDate: Date | null
  theme: string | null
  fundingAgency: { id: string; name: string; type: string }
  pi?: { id: string; user: { name: string; email: string }; department: string }
  _count?: { collaborators: number; documents: number; milestones: number }
}

export async function getProjects(params: ProjectListParams): Promise<ProjectListResult> {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const { search, status, agencyId, piId, page = 1, limit = 20 } = params
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (agencyId) where.fundingAgencyId = agencyId
  if (piId) where.piId = piId
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { theme: { contains: search, mode: "insensitive" } },
    ]
  }

  const [projects, total] = await Promise.all([
    prisma.researchProject.findMany({
      where,
      include: {
        fundingAgency: { select: { id: true, name: true, type: true } },
        _count: { select: { collaborators: true, documents: true, milestones: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.researchProject.count({ where }),
  ])

  const piIds = [...new Set(projects.map((p) => p.piId))]
  const piMap = new Map<string, any>()
  if (piIds.length > 0) {
    const pis = await prisma.faculty.findMany({
      where: { id: { in: piIds } },
      select: { id: true, user: { select: { name: true, email: true } }, department: true },
    })
    for (const pi of pis) piMap.set(pi.id, pi)
  }

  const enriched = projects.map((p) => ({
    ...p,
    pi: piMap.get(p.piId) || null,
  }))

  return { projects: enriched, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function getProjectById(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const project = await prisma.researchProject.findUnique({
    where: { id },
    include: {
      fundingAgency: true,
      collaborators: {
        include: {
          faculty: { include: { user: { select: { name: true, email: true } } } },
        },
      },
      documents: true,
      reviews: true,
      milestones: { orderBy: { dueDate: "asc" } },
    },
  })

  if (!project) return null

  const pi = await prisma.faculty.findUnique({
    where: { id: project.piId },
    include: { user: { select: { name: true, email: true, image: true } } },
  })

  return { ...project, pi }
}

export async function createProject(data: {
  title: string
  description?: string
  fundingAgencyId: string
  piId: string
  amountRequested: number
  theme?: string
  eligibility?: string
  startDate?: string
  endDate?: string
}) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const project = await prisma.researchProject.create({
    data: {
      title: data.title,
      description: data.description,
      fundingAgencyId: data.fundingAgencyId,
      piId: data.piId,
      status: "IDEA",
      amountRequested: data.amountRequested,
      theme: data.theme,
      eligibility: data.eligibility,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
    },
    include: { fundingAgency: true },
  })

  return { success: true, project }
}

export async function updateProjectStatus(
  id: string,
  newStatus: string,
  notes?: string
) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const project = await prisma.researchProject.findUnique({ where: { id }, select: { status: true } })
  if (!project) throw new Error("Project not found")

  const updateData: Record<string, unknown> = { status: newStatus }

  if (newStatus === "SUBMITTED") updateData.submissionDate = new Date()
  if (newStatus === "AWARDED") updateData.awardDate = new Date()
  if (newStatus === "IN_PROGRESS" && !project.status.startsWith("IN_PROGRESS")) updateData.startDate = new Date()
  if (newStatus === "COMPLETED") updateData.endDate = new Date()

  const updated = await prisma.researchProject.update({
    where: { id },
    data: updateData,
  })

  if (notes) {
    await prisma.projectReview.create({
      data: {
        projectId: id,
        reviewType: "STATUS_CHANGE",
        reviewerId: session.user.id || "system",
        comments: notes,
        status: `Changed from ${project.status} to ${newStatus}`,
      },
    })
  }

  return { success: true, project: updated }
}

export async function updateProject(
  id: string,
  data: {
    title?: string
    description?: string
    amountRequested?: number
    amountAwarded?: number
    theme?: string
    startDate?: string
    endDate?: string
  }
) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const updateData: Record<string, unknown> = {}
  if (data.title !== undefined) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description
  if (data.amountRequested !== undefined) updateData.amountRequested = data.amountRequested
  if (data.amountAwarded !== undefined) updateData.amountAwarded = data.amountAwarded
  if (data.theme !== undefined) updateData.theme = data.theme
  if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null
  if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null

  const project = await prisma.researchProject.update({ where: { id }, data: updateData })
  return { success: true, project }
}

export async function addCollaborator(projectId: string, facultyId: string, role: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const collaborator = await prisma.projectCollaborator.create({
    data: { projectId, facultyId, role },
  })

  return { success: true, collaborator }
}

export async function removeCollaborator(projectId: string, facultyId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  await prisma.projectCollaborator.delete({
    where: { projectId_facultyId: { projectId, facultyId } },
  })

  return { success: true }
}

export async function addMilestone(
  projectId: string,
  data: { title: string; description?: string; dueDate: string }
) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const milestone = await prisma.projectMilestone.create({
    data: {
      projectId,
      title: data.title,
      description: data.description,
      dueDate: new Date(data.dueDate),
    },
  })

  return { success: true, milestone }
}

export async function completeMilestone(milestoneId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const milestone = await prisma.projectMilestone.update({
    where: { id: milestoneId },
    data: { status: "COMPLETED", completedAt: new Date() },
  })

  return { success: true, milestone }
}

export async function getProjectAnalytics() {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const [projects, statusCounts] = await Promise.all([
    prisma.researchProject.findMany({
      select: {
        status: true,
        amountRequested: true,
        amountAwarded: true,
        createdAt: true,
        fundingAgency: { select: { name: true } },
      },
    }),
    prisma.researchProject.groupBy({
      by: ["status"],
      _count: true,
    }),
  ])

  const totalRequested = projects.reduce((sum, p) => sum + p.amountRequested, 0)
  const totalAwarded = projects.reduce((sum, p) => sum + (p.amountAwarded || 0), 0)

  const agencyDistribution = new Map<string, number>()
  for (const p of projects) {
    const name = p.fundingAgency.name
    agencyDistribution.set(name, (agencyDistribution.get(name) || 0) + 1)
  }

  return {
    total: projects.length,
    totalRequested,
    totalAwarded,
    approvalRate: projects.length > 0
      ? Math.round(((statusCounts.find((s) => s.status === "COMPLETED")?._count || 0) / projects.length) * 100)
      : 0,
    statusDistribution: statusCounts.map((s) => ({ status: s.status, count: s._count })),
    agencyDistribution: Array.from(agencyDistribution.entries()).map(([name, count]) => ({ name, count })),
  }
}

export async function getFundingAgencies() {
  return prisma.fundingAgency.findMany({ orderBy: { name: "asc" } })
}
