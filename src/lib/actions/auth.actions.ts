"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { signIn, signOut } from "@/lib/auth"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  department: z.string().min(1, "Department is required"),
  school: z.string().min(1, "School is required"),
})

export type RegisterInput = z.infer<typeof registerSchema>

export async function registerUser(data: RegisterInput) {
  const parsed = registerSchema.safeParse(data)
  if (!parsed.success) {
    const raw = parsed.error.flatten().fieldErrors
    const errors: Record<string, string> = {}
    for (const [key, val] of Object.entries(raw)) {
      if (val) errors[key] = val.join(", ")
    }
    return { success: false, error: errors }
  }

  const { name, email, password, department, school } = parsed.data

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return { success: false, error: { email: "Email already in use" } }
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "FACULTY",
    },
  })

  await prisma.faculty.create({
    data: {
      userId: user.id,
      employeeId: `EMP-${Date.now()}`,
      department,
      school,
      designation: "Faculty",
      joiningDate: new Date(),
    },
  })

  return { success: true, userId: user.id }
}

export async function loginWithCredentials(email: string, password: string) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error
    }
    return { success: false, error: "Invalid email or password" }
  }
}

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/dashboard" })
}

export async function logout() {
  await signOut({ redirectTo: "/login" })
}
