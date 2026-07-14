import { z } from "zod"

export const facultyProfileSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  department: z.string().min(1, "Department is required"),
  school: z.string().min(1, "School is required"),
  designation: z.string().min(1, "Designation is required"),
  joiningDate: z.string().optional(),
  googleScholarId: z.string().optional().or(z.literal("")),
  scopusId: z.string().optional().or(z.literal("")),
  orcid: z.string().optional().or(z.literal("")),
  webOfScienceId: z.string().optional().or(z.literal("")),
})

export type FacultyProfileInput = z.infer<typeof facultyProfileSchema>

export const facultyExpertiseSchema = z.object({
  area: z.string().min(1, "Expertise area is required"),
  keywords: z.string().min(1, "At least one keyword is required"),
  isPrimary: z.boolean().default(false),
})

export type FacultyExpertiseInput = z.infer<typeof facultyExpertiseSchema>

export const facultySkillSchema = z.object({
  skill: z.string().min(1, "Skill name is required"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"], {
    message: "Skill level is required",
  }),
})

export type FacultySkillInput = z.infer<typeof facultySkillSchema>

export const facultySoftwareSchema = z.object({
  software: z.string().min(1, "Software name is required"),
  expertise: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"], {
    message: "Expertise level is required",
  }),
})

export type FacultySoftwareInput = z.infer<typeof facultySoftwareSchema>

export const facultyAwardSchema = z.object({
  title: z.string().min(1, "Award title is required"),
  awardedBy: z.string().min(1, "Awarded by is required"),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  description: z.string().optional(),
})

export type FacultyAwardInput = z.infer<typeof facultyAwardSchema>

export const facultyPublicationSchema = z.object({
  title: z.string().min(1, "Publication title is required"),
  authors: z.string().min(1, "At least one author is required"),
  journal: z.string().optional().or(z.literal("")),
  conference: z.string().optional().or(z.literal("")),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  doi: z.string().optional().or(z.literal("")),
  citations: z.number().min(0).default(0),
  quartile: z.string().optional().or(z.literal("")),
  impactFactor: z.number().min(0).optional(),
  type: z.enum(["JOURNAL", "CONFERENCE", "BOOK", "CHAPTER", "PREPRINT", "OTHER"], {
    message: "Publication type is required",
  }),
})

export type FacultyPublicationInput = z.infer<typeof facultyPublicationSchema>
