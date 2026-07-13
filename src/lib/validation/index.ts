import { z } from "zod"

export const facultyProfileSchema = z.object({
  employeeId: z.string().min(1),
  department: z.string().min(1),
  school: z.string().min(1),
  designation: z.string().min(1),
})
