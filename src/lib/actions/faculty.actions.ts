"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import {
  facultyProfileSchema,
  facultyExpertiseSchema,
  facultySkillSchema,
  facultySoftwareSchema,
  facultyAwardSchema,
  type FacultyProfileInput,
  type FacultyExpertiseInput,
  type FacultySkillInput,
  type FacultySoftwareInput,
  type FacultyAwardInput,
} from "@/lib/validation"
import type { FacultyListParams, FacultyListResult, FacultyWithUser, ProfileCompletionBreakdown } from "@/types/faculty.types"

function calculateProfileCompletion(faculty: {
  designation: string
  department: string
  school: string
  googleScholarId: string | null
  scopusId: string | null
  orcid: string | null
  expertise: { id: string }[]
  skills: { id: string }[]
  publications: { id: string }[]
}): ProfileCompletionBreakdown {
  const basicInfo = !!(faculty.designation && faculty.department && faculty.school)
  const expertise = faculty.expertise.length > 0
  const skills = faculty.skills.length > 0
  const publications = faculty.publications.length > 0
  const externalIds = !!(faculty.googleScholarId || faculty.scopusId || faculty.orcid)

  const checks = [basicInfo, expertise, skills, publications, externalIds]
  const percentage = Math.round((checks.filter(Boolean).length / checks.length) * 100)

  return { basicInfo, expertise, skills, publications, externalIds, percentage }
}

export async function getFacultyList(params: FacultyListParams): Promise<FacultyListResult> {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const { search, department, school, page = 1, limit = 10 } = params
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { employeeId: { contains: search, mode: "insensitive" } },
    ]
  }
  if (department) where.department = department
  if (school) where.school = school

  const [faculty, total] = await Promise.all([
    prisma.faculty.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        expertise: true,
        skills: true,
        software: true,
        publications: true,
        awards: true,
      },
      skip,
      take: limit,
      orderBy: { researchScore: "desc" },
    }),
    prisma.faculty.count({ where }),
  ])

  const serialized = JSON.parse(JSON.stringify(faculty)) as FacultyWithUser[]

  return {
    faculty: serialized,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getFacultyById(id: string): Promise<FacultyWithUser | null> {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const faculty = await prisma.faculty.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      expertise: true,
      skills: true,
      software: true,
      publications: { orderBy: { year: "desc" } },
      awards: { orderBy: { year: "desc" } },
    },
  })

  return JSON.parse(JSON.stringify(faculty)) as FacultyWithUser
}

export async function updateFacultyProfile(facultyId: string, data: FacultyProfileInput) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const parsed = facultyProfileSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors }
  }

  const faculty = await prisma.faculty.findUnique({
    where: { id: facultyId },
    include: { expertise: true, skills: true, publications: true },
  })

  if (!faculty) return { success: false, error: { general: ["Faculty not found"] } }

  const updated = await prisma.faculty.update({
    where: { id: facultyId },
    data: {
      employeeId: parsed.data.employeeId,
      department: parsed.data.department,
      school: parsed.data.school,
      designation: parsed.data.designation,
      joiningDate: parsed.data.joiningDate ? new Date(parsed.data.joiningDate) : faculty.joiningDate,
      googleScholarId: parsed.data.googleScholarId || null,
      scopusId: parsed.data.scopusId || null,
      orcid: parsed.data.orcid || null,
      webOfScienceId: parsed.data.webOfScienceId || null,
    },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      expertise: true,
      skills: true,
      software: true,
      publications: true,
      awards: true,
    },
  })

  const completion = calculateProfileCompletion(updated)
  await prisma.faculty.update({
    where: { id: facultyId },
    data: { profileCompletion: completion.percentage },
  })

  return { success: true, faculty: JSON.parse(JSON.stringify(updated)) as FacultyWithUser, completion }
}

export async function addExpertise(facultyId: string, data: FacultyExpertiseInput) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const parsed = facultyExpertiseSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Invalid data" }
  }

  const expertise = await prisma.facultyExpertise.create({
    data: {
      facultyId,
      area: parsed.data.area,
      keywords: parsed.data.keywords.split(",").map((k) => k.trim()).filter(Boolean),
      isPrimary: parsed.data.isPrimary,
    },
  })

  return { success: true, expertise }
}

export async function removeExpertise(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  await prisma.facultyExpertise.delete({ where: { id } })
  return { success: true }
}

export async function addSkill(facultyId: string, data: FacultySkillInput) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const parsed = facultySkillSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Invalid data" }
  }

  const skill = await prisma.facultySkill.create({
    data: {
      facultyId,
      skill: parsed.data.skill,
      level: parsed.data.level,
    },
  })

  return { success: true, skill }
}

export async function removeSkill(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  await prisma.facultySkill.delete({ where: { id } })
  return { success: true }
}

export async function addSoftware(facultyId: string, data: FacultySoftwareInput) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const parsed = facultySoftwareSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Invalid data" }
  }

  const software = await prisma.facultySoftware.create({
    data: {
      facultyId,
      software: parsed.data.software,
      expertise: parsed.data.expertise,
    },
  })

  return { success: true, software }
}

export async function removeSoftware(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  await prisma.facultySoftware.delete({ where: { id } })
  return { success: true }
}

export async function addAward(facultyId: string, data: FacultyAwardInput) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const parsed = facultyAwardSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Invalid data" }
  }

  const award = await prisma.facultyAward.create({
    data: {
      facultyId,
      title: parsed.data.title,
      awardedBy: parsed.data.awardedBy,
      year: parsed.data.year,
      description: parsed.data.description,
    },
  })

  return { success: true, award }
}

export async function removeAward(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  await prisma.facultyAward.delete({ where: { id } })
  return { success: true }
}

export async function addPublication(facultyId: string, data: {
  title: string
  authors: string
  journal?: string
  conference?: string
  year: number
  doi?: string
  citations?: number
  quartile?: string
  impactFactor?: number
  type: string
}) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const publication = await prisma.facultyPublication.create({
    data: {
      facultyId,
      title: data.title,
      authors: data.authors.split(",").map((a) => a.trim()).filter(Boolean),
      journal: data.journal || null,
      conference: data.conference || null,
      year: data.year,
      doi: data.doi || null,
      citations: data.citations || 0,
      quartile: data.quartile || null,
      impactFactor: data.impactFactor || null,
      type: data.type,
    },
  })

  const pubCount = await prisma.facultyPublication.count({ where: { facultyId } })
  const totalCitations = await prisma.facultyPublication.aggregate({
    where: { facultyId },
    _sum: { citations: true },
  })

  await prisma.faculty.update({
    where: { id: facultyId },
    data: {
      totalCitations: totalCitations._sum.citations || 0,
    },
  })

  return { success: true, publication, publicationCount: pubCount }
}

export async function removePublication(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  await prisma.facultyPublication.delete({ where: { id } })
  return { success: true }
}

export async function getDepartments(): Promise<string[]> {
  const result = await prisma.faculty.findMany({
    select: { department: true },
    distinct: ["department"],
    orderBy: { department: "asc" },
  })
  return result.map((r) => r.department)
}

export async function getSchools(): Promise<string[]> {
  const result = await prisma.faculty.findMany({
    select: { school: true },
    distinct: ["school"],
    orderBy: { school: "asc" },
  })
  return result.map((r) => r.school)
}
