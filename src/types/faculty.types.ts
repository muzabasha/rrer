export interface FacultyProfile {
  id: string
  userId: string
  employeeId: string
  department: string
  school: string
  designation: string
  joiningDate: string
  googleScholarId: string | null
  scopusId: string | null
  orcid: string | null
  webOfScienceId: string | null
  hIndex: number
  totalCitations: number
  profileCompletion: number
  researchScore: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface FacultyWithUser extends FacultyProfile {
  user: {
    id: string
    name: string
    email: string
    image: string | null
  }
  expertise: FacultyExpertise[]
  skills: FacultySkill[]
  software: FacultySoftware[]
  publications: FacultyPublication[]
  awards: FacultyAward[]
}

export interface FacultyExpertise {
  id: string
  facultyId: string
  area: string
  keywords: string[]
  isPrimary: boolean
}

export interface FacultySkill {
  id: string
  facultyId: string
  skill: string
  level: string
}

export interface FacultySoftware {
  id: string
  facultyId: string
  software: string
  expertise: string
}

export interface FacultyPublication {
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
}

export interface FacultyAward {
  id: string
  facultyId: string
  title: string
  awardedBy: string
  year: number
  description: string | null
}

export interface FacultyListParams {
  search?: string
  department?: string
  school?: string
  page?: number
  limit?: number
}

export interface FacultyListResult {
  faculty: FacultyWithUser[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ProfileCompletionBreakdown {
  basicInfo: boolean
  expertise: boolean
  skills: boolean
  publications: boolean
  externalIds: boolean
  percentage: number
}
