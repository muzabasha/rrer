import { PrismaClient } from "@prisma/client"
import * as bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Create admin user
  const adminPassword = await bcrypt.hash("Admin@123", 10)
  const admin = await prisma.user.upsert({
    where: { email: "admin@reva.edu.in" },
    update: {},
    create: {
      email: "admin@reva.edu.in",
      name: "System Administrator",
      password: adminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  })

  // Create sample faculty user
  const facultyPassword = await bcrypt.hash("Faculty@123", 10)
  const facultyUser = await prisma.user.upsert({
    where: { email: "dr.ramesh@reva.edu.in" },
    update: {},
    create: {
      email: "dr.ramesh@reva.edu.in",
      name: "Dr. Ramesh Kumar",
      password: facultyPassword,
      role: "FACULTY",
      emailVerified: new Date(),
    },
  })

  // Create faculty profile
  const faculty = await prisma.faculty.upsert({
    where: { employeeId: "REV-FAC-001" },
    update: {},
    create: {
      userId: facultyUser.id,
      employeeId: "REV-FAC-001",
      department: "Computer Science and Engineering",
      school: "School of Engineering and Technology",
      designation: "Professor",
      joiningDate: new Date("2015-07-01"),
      googleScholarId: "abc123xyz",
      scopusId: "57200000001",
      orcid: "0000-0001-2345-6789",
      hIndex: 15,
      totalCitations: 1200,
      profileCompletion: 85,
      researchScore: 72.5,
    },
  })

  // Add faculty expertise
  await prisma.facultyExpertise.createMany({
    data: [
      { facultyId: faculty.id, area: "Artificial Intelligence", keywords: ["machine learning", "deep learning", "NLP"], isPrimary: true },
      { facultyId: faculty.id, area: "Computer Vision", keywords: ["image processing", "object detection"], isPrimary: false },
    ],
  })

  // Add faculty publications
  await prisma.facultyPublication.createMany({
    data: [
      {
        facultyId: faculty.id,
        title: "Deep Learning Approaches for Medical Image Analysis",
        authors: ["Dr. Ramesh Kumar", "Dr. Priya Sharma", "Mr. Amit Singh"],
        journal: "IEEE Transactions on Medical Imaging",
        year: 2024,
        doi: "10.1109/TMI.2024.001",
        citations: 45,
        quartile: "Q1",
        impactFactor: 10.6,
        type: "Journal",
      },
      {
        facultyId: faculty.id,
        title: "A Novel Approach to Natural Language Understanding",
        authors: ["Dr. Ramesh Kumar", "Ms. Sneha Patel"],
        conference: "ICML 2024",
        year: 2024,
        citations: 32,
        quartile: "Q1",
        type: "Conference",
      },
    ],
  })

  // Create funding agencies
  const agencies = [
    { name: "ANRF", type: "Government", country: "India" },
    { name: "DST", type: "Government", country: "India" },
    { name: "DBT", type: "Government", country: "India" },
    { name: "DRDO", type: "Government", country: "India" },
    { name: "ISRO", type: "Government", country: "India" },
    { name: "CSIR", type: "Government", country: "India" },
    { name: "AICTE", type: "Government", country: "India" },
    { name: "MeitY", type: "Government", country: "India" },
    { name: "BIRAC", type: "Government", country: "India" },
    { name: "ICMR", type: "Government", country: "India" },
    { name: "ICSSR", type: "Government", country: "India" },
    { name: "MSME", type: "Government", country: "India" },
    { name: "Infosys Foundation", type: "Foundation", country: "India" },
    { name: "Tata Trusts", type: "Foundation", country: "India" },
    { name: "Bosch", type: "Industry", country: "Germany" },
    { name: "Microsoft Research", type: "Industry", country: "USA" },
    { name: "Google Research", type: "Industry", country: "USA" },
  ]

  for (const agency of agencies) {
    await prisma.fundingAgency.upsert({
      where: { name: agency.name },
      update: {},
      create: agency,
    })
  }

  // Create sample research cluster
  const cluster = await prisma.researchCluster.create({
    data: {
      name: "AI and Machine Learning",
      description: "Research cluster focused on artificial intelligence and machine learning applications",
      keywords: ["artificial intelligence", "machine learning", "deep learning", "NLP"],
      clusterScore: 85.5,
      publicationCount: 45,
      citationCount: 890,
      fundingAmount: 2500000,
      patentCount: 3,
    },
  })

  // Add cluster member
  await prisma.clusterMember.create({
    data: {
      clusterId: cluster.id,
      facultyId: faculty.id,
      role: "LEAD",
    },
  })

  // Create sample industry partner
  const partner = await prisma.industryPartner.create({
    data: {
      name: "TechCorp India",
      industry: "Information Technology",
      country: "India",
      website: "https://techcorp.example.com",
      contactPerson: "Mr. Rajesh Mehta",
      contactEmail: "rajesh@techcorp.example.com",
    },
  })

  console.log("Seed data created successfully!")
  console.log("Admin user: admin@reva.edu.in / Admin@123")
  console.log("Faculty user: dr.ramesh@reva.edu.in / Faculty@123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
