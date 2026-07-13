-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'RESEARCH_DIRECTOR', 'DEAN_RESEARCH', 'SPONSORED_RESEARCH_TEAM', 'INNOVATION_CELL', 'PATENT_CELL', 'DOCTORAL_OFFICE', 'FACULTY', 'PHD_SCHOLAR', 'INDUSTRY_PARTNER', 'EXECUTIVE');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('IDEA', 'CONCEPT_NOTE', 'INTERNAL_REVIEW', 'BUDGET_REVIEW', 'TECHNICAL_REVIEW', 'SUBMITTED', 'UNDER_REVISION', 'AWARDED', 'IN_EXECUTION', 'COMPLETED', 'CLOSED');

-- CreateEnum
CREATE TYPE "PatentStatus" AS ENUM ('IDEA', 'NOVELTY_CHECK', 'DISCLOSURE', 'DRAFT', 'FILED', 'PUBLISHED', 'UNDER_EXAMINATION', 'GRANTED', 'COMMERCIALIZED');

-- CreateEnum
CREATE TYPE "PhDRiskStatus" AS ENUM ('ON_TRACK', 'NEEDS_ATTENTION', 'CRITICAL');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('DEADLINE_REMINDER', 'IDC_REMINDER', 'PROPOSAL_REMINDER', 'PUBLICATION_REMINDER', 'PATENT_REMINDER', 'MILESTONE_ALERT', 'SYSTEM_NOTIFICATION');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'FACULTY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "faculty" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "joiningDate" TIMESTAMP(3) NOT NULL,
    "googleScholarId" TEXT,
    "scopusId" TEXT,
    "orcid" TEXT,
    "webOfScienceId" TEXT,
    "hIndex" INTEGER NOT NULL DEFAULT 0,
    "totalCitations" INTEGER NOT NULL DEFAULT 0,
    "profileCompletion" INTEGER NOT NULL DEFAULT 0,
    "researchScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculty_expertise" (
    "id" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "keywords" TEXT[],
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "faculty_expertise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculty_publications" (
    "id" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authors" TEXT[],
    "journal" TEXT,
    "conference" TEXT,
    "year" INTEGER NOT NULL,
    "doi" TEXT,
    "citations" INTEGER NOT NULL DEFAULT 0,
    "quartile" TEXT,
    "impactFactor" DOUBLE PRECISION,
    "type" TEXT NOT NULL,

    CONSTRAINT "faculty_publications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculty_awards" (
    "id" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "awardedBy" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "description" TEXT,

    CONSTRAINT "faculty_awards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculty_skills" (
    "id" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "level" TEXT NOT NULL,

    CONSTRAINT "faculty_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculty_software" (
    "id" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "software" TEXT NOT NULL,
    "expertise" TEXT NOT NULL,

    CONSTRAINT "faculty_software_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_clusters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "keywords" TEXT[],
    "clusterScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "publicationCount" INTEGER NOT NULL DEFAULT 0,
    "citationCount" INTEGER NOT NULL DEFAULT 0,
    "fundingAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "patentCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "research_clusters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cluster_members" (
    "id" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cluster_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cluster_keywords" (
    "id" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "cluster_keywords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funding_agencies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "website" TEXT,
    "contactEmail" TEXT,

    CONSTRAINT "funding_agencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_projects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fundingAgencyId" TEXT NOT NULL,
    "piId" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'IDEA',
    "amountRequested" DOUBLE PRECISION NOT NULL,
    "amountAwarded" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "submissionDate" TIMESTAMP(3),
    "awardDate" TIMESTAMP(3),
    "theme" TEXT,
    "eligibility" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "research_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_collaborators" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "project_collaborators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_documents" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedBy" TEXT NOT NULL,

    CONSTRAINT "project_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_reviews" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "reviewType" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "comments" TEXT,
    "status" TEXT NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_milestones" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "project_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "industry_partners" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "website" TEXT,
    "contactPerson" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,

    CONSTRAINT "industry_partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultancy_projects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "industryPartnerId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "quotationAmount" DOUBLE PRECISION NOT NULL,
    "agreedAmount" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'INITIATED',
    "mouUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultancy_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliverables" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "deliverables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "issuedDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_feedback" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comments" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "abstract" TEXT NOT NULL,
    "status" "PatentStatus" NOT NULL DEFAULT 'IDEA',
    "filingDate" TIMESTAMP(3),
    "publicationDate" TIMESTAMP(3),
    "grantDate" TIMESTAMP(3),
    "patentNumber" TEXT,
    "jurisdiction" TEXT,
    "trl" INTEGER,
    "category" TEXT,
    "applicationNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patent_inventors" (
    "id" TEXT NOT NULL,
    "patentId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'INVENTOR',
    "order" INTEGER NOT NULL,

    CONSTRAINT "patent_inventors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patent_stages" (
    "id" TEXT NOT NULL,
    "patentId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "enteredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "documentUrl" TEXT,

    CONSTRAINT "patent_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patent_licenses" (
    "id" TEXT NOT NULL,
    "patentId" TEXT NOT NULL,
    "licensee" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "revenue" DOUBLE PRECISION NOT NULL,
    "terms" TEXT,

    CONSTRAINT "patent_licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "novelty_checks" (
    "id" TEXT NOT NULL,
    "patentId" TEXT NOT NULL,
    "checkedBy" TEXT NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result" TEXT NOT NULL,
    "references" TEXT[],
    "notes" TEXT,

    CONSTRAINT "novelty_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "startups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "founderId" TEXT,
    "founderType" TEXT,
    "mentorId" TEXT,
    "incubationStage" TEXT NOT NULL DEFAULT 'IDEATION',
    "trl" INTEGER,
    "fundingRaised" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "website" TEXT,
    "productStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "startups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prototypes" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DEVELOPMENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prototypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "startup_investors" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "investedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "startup_investors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "startup_demo_days" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "outcome" TEXT,
    "notes" TEXT,

    CONSTRAINT "startup_demo_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phd_scholars" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enrollmentNumber" TEXT NOT NULL,
    "registrationDate" TIMESTAMP(3) NOT NULL,
    "expectedCompletion" TIMESTAMP(3) NOT NULL,
    "department" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "researchArea" TEXT NOT NULL,
    "supervisorId" TEXT NOT NULL,
    "coSupervisorId" TEXT,
    "riskStatus" "PhDRiskStatus" NOT NULL DEFAULT 'ON_TRACK',
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phd_scholars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phd_milestones" (
    "id" TEXT NOT NULL,
    "scholarId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "type" TEXT NOT NULL,

    CONSTRAINT "phd_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idc_meetings" (
    "id" TEXT NOT NULL,
    "scholarId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "attendees" TEXT[],
    "agenda" TEXT,
    "minutes" TEXT,
    "decisions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',

    CONSTRAINT "idc_meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scholar_publications" (
    "id" TEXT NOT NULL,
    "scholarId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authors" TEXT[],
    "venue" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "doi" TEXT,
    "type" TEXT NOT NULL,

    CONSTRAINT "scholar_publications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_projects" (
    "id" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "coGuideId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ONGOING',
    "type" TEXT NOT NULL,

    CONSTRAINT "student_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hackathons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organizer" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "participants" TEXT[],
    "outcome" TEXT,
    "prize" TEXT,

    CONSTRAINT "hackathons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_internships" (
    "id" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "guideId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "outcome" TEXT,

    CONSTRAINT "research_internships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "innovation_challenges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organizer" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "participants" TEXT[],
    "outcome" TEXT,
    "prize" TEXT,

    CONSTRAINT "innovation_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "deadlineDays" INTEGER NOT NULL DEFAULT 7,
    "idcReminder" BOOLEAN NOT NULL DEFAULT true,
    "patentReminder" BOOLEAN NOT NULL DEFAULT true,
    "projectReminder" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_metrics" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "period" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kpi_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "target_vs_achievement" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "target" DOUBLE PRECISION NOT NULL,
    "achievement" DOUBLE PRECISION NOT NULL,
    "period" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "target_vs_achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "changes" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "faculty_userId_key" ON "faculty"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "faculty_employeeId_key" ON "faculty"("employeeId");

-- CreateIndex
CREATE INDEX "faculty_employeeId_idx" ON "faculty"("employeeId");

-- CreateIndex
CREATE INDEX "faculty_department_idx" ON "faculty"("department");

-- CreateIndex
CREATE INDEX "faculty_school_idx" ON "faculty"("school");

-- CreateIndex
CREATE INDEX "faculty_researchScore_idx" ON "faculty"("researchScore" DESC);

-- CreateIndex
CREATE INDEX "faculty_expertise_facultyId_idx" ON "faculty_expertise"("facultyId");

-- CreateIndex
CREATE INDEX "faculty_publications_facultyId_idx" ON "faculty_publications"("facultyId");

-- CreateIndex
CREATE INDEX "faculty_publications_year_idx" ON "faculty_publications"("year" DESC);

-- CreateIndex
CREATE INDEX "faculty_publications_quartile_idx" ON "faculty_publications"("quartile");

-- CreateIndex
CREATE INDEX "faculty_awards_facultyId_idx" ON "faculty_awards"("facultyId");

-- CreateIndex
CREATE INDEX "faculty_skills_facultyId_idx" ON "faculty_skills"("facultyId");

-- CreateIndex
CREATE INDEX "faculty_software_facultyId_idx" ON "faculty_software"("facultyId");

-- CreateIndex
CREATE INDEX "research_clusters_name_idx" ON "research_clusters"("name");

-- CreateIndex
CREATE INDEX "cluster_members_clusterId_idx" ON "cluster_members"("clusterId");

-- CreateIndex
CREATE INDEX "cluster_members_facultyId_idx" ON "cluster_members"("facultyId");

-- CreateIndex
CREATE UNIQUE INDEX "cluster_members_clusterId_facultyId_key" ON "cluster_members"("clusterId", "facultyId");

-- CreateIndex
CREATE INDEX "cluster_keywords_clusterId_idx" ON "cluster_keywords"("clusterId");

-- CreateIndex
CREATE UNIQUE INDEX "funding_agencies_name_key" ON "funding_agencies"("name");

-- CreateIndex
CREATE INDEX "research_projects_status_idx" ON "research_projects"("status");

-- CreateIndex
CREATE INDEX "research_projects_piId_idx" ON "research_projects"("piId");

-- CreateIndex
CREATE INDEX "research_projects_fundingAgencyId_idx" ON "research_projects"("fundingAgencyId");

-- CreateIndex
CREATE INDEX "project_collaborators_projectId_idx" ON "project_collaborators"("projectId");

-- CreateIndex
CREATE INDEX "project_collaborators_facultyId_idx" ON "project_collaborators"("facultyId");

-- CreateIndex
CREATE UNIQUE INDEX "project_collaborators_projectId_facultyId_key" ON "project_collaborators"("projectId", "facultyId");

-- CreateIndex
CREATE INDEX "project_documents_projectId_idx" ON "project_documents"("projectId");

-- CreateIndex
CREATE INDEX "project_reviews_projectId_idx" ON "project_reviews"("projectId");

-- CreateIndex
CREATE INDEX "project_milestones_projectId_idx" ON "project_milestones"("projectId");

-- CreateIndex
CREATE INDEX "project_milestones_status_idx" ON "project_milestones"("status");

-- CreateIndex
CREATE INDEX "consultancy_projects_facultyId_idx" ON "consultancy_projects"("facultyId");

-- CreateIndex
CREATE INDEX "consultancy_projects_industryPartnerId_idx" ON "consultancy_projects"("industryPartnerId");

-- CreateIndex
CREATE INDEX "deliverables_projectId_idx" ON "deliverables"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "invoices"("invoiceNumber");

-- CreateIndex
CREATE INDEX "invoices_projectId_idx" ON "invoices"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "client_feedback_projectId_key" ON "client_feedback"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "patents_patentNumber_key" ON "patents"("patentNumber");

-- CreateIndex
CREATE INDEX "patents_status_idx" ON "patents"("status");

-- CreateIndex
CREATE INDEX "patents_filingDate_idx" ON "patents"("filingDate" DESC);

-- CreateIndex
CREATE INDEX "patent_inventors_patentId_idx" ON "patent_inventors"("patentId");

-- CreateIndex
CREATE INDEX "patent_inventors_facultyId_idx" ON "patent_inventors"("facultyId");

-- CreateIndex
CREATE UNIQUE INDEX "patent_inventors_patentId_facultyId_key" ON "patent_inventors"("patentId", "facultyId");

-- CreateIndex
CREATE INDEX "patent_stages_patentId_idx" ON "patent_stages"("patentId");

-- CreateIndex
CREATE INDEX "patent_licenses_patentId_idx" ON "patent_licenses"("patentId");

-- CreateIndex
CREATE INDEX "novelty_checks_patentId_idx" ON "novelty_checks"("patentId");

-- CreateIndex
CREATE INDEX "prototypes_startupId_idx" ON "prototypes"("startupId");

-- CreateIndex
CREATE INDEX "startup_investors_startupId_idx" ON "startup_investors"("startupId");

-- CreateIndex
CREATE INDEX "startup_demo_days_startupId_idx" ON "startup_demo_days"("startupId");

-- CreateIndex
CREATE UNIQUE INDEX "phd_scholars_userId_key" ON "phd_scholars"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "phd_scholars_enrollmentNumber_key" ON "phd_scholars"("enrollmentNumber");

-- CreateIndex
CREATE INDEX "phd_scholars_supervisorId_idx" ON "phd_scholars"("supervisorId");

-- CreateIndex
CREATE INDEX "phd_scholars_riskStatus_idx" ON "phd_scholars"("riskStatus");

-- CreateIndex
CREATE INDEX "phd_scholars_department_idx" ON "phd_scholars"("department");

-- CreateIndex
CREATE INDEX "phd_milestones_scholarId_idx" ON "phd_milestones"("scholarId");

-- CreateIndex
CREATE INDEX "phd_milestones_status_idx" ON "phd_milestones"("status");

-- CreateIndex
CREATE INDEX "idc_meetings_scholarId_idx" ON "idc_meetings"("scholarId");

-- CreateIndex
CREATE INDEX "idc_meetings_scheduledAt_idx" ON "idc_meetings"("scheduledAt");

-- CreateIndex
CREATE INDEX "scholar_publications_scholarId_idx" ON "scholar_publications"("scholarId");

-- CreateIndex
CREATE INDEX "student_projects_guideId_idx" ON "student_projects"("guideId");

-- CreateIndex
CREATE INDEX "student_projects_year_idx" ON "student_projects"("year");

-- CreateIndex
CREATE INDEX "hackathons_date_idx" ON "hackathons"("date");

-- CreateIndex
CREATE INDEX "research_internships_guideId_idx" ON "research_internships"("guideId");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_key" ON "notification_preferences"("userId");

-- CreateIndex
CREATE INDEX "kpi_metrics_entityType_entityId_idx" ON "kpi_metrics"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "kpi_metrics_metricType_idx" ON "kpi_metrics"("metricType");

-- CreateIndex
CREATE INDEX "kpi_metrics_period_idx" ON "kpi_metrics"("period");

-- CreateIndex
CREATE UNIQUE INDEX "target_vs_achievement_entityType_entityId_metricType_period_key" ON "target_vs_achievement"("entityType", "entityId", "metricType", "period");

-- CreateIndex
CREATE INDEX "documents_entityType_entityId_idx" ON "documents"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entityId_idx" ON "audit_logs"("entity", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty" ADD CONSTRAINT "faculty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_expertise" ADD CONSTRAINT "faculty_expertise_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_publications" ADD CONSTRAINT "faculty_publications_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_awards" ADD CONSTRAINT "faculty_awards_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_skills" ADD CONSTRAINT "faculty_skills_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_software" ADD CONSTRAINT "faculty_software_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cluster_members" ADD CONSTRAINT "cluster_members_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "research_clusters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cluster_members" ADD CONSTRAINT "cluster_members_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cluster_keywords" ADD CONSTRAINT "cluster_keywords_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "research_clusters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_projects" ADD CONSTRAINT "research_projects_fundingAgencyId_fkey" FOREIGN KEY ("fundingAgencyId") REFERENCES "funding_agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_collaborators" ADD CONSTRAINT "project_collaborators_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "research_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_collaborators" ADD CONSTRAINT "project_collaborators_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "research_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_reviews" ADD CONSTRAINT "project_reviews_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "research_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_milestones" ADD CONSTRAINT "project_milestones_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "research_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultancy_projects" ADD CONSTRAINT "consultancy_projects_industryPartnerId_fkey" FOREIGN KEY ("industryPartnerId") REFERENCES "industry_partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultancy_projects" ADD CONSTRAINT "consultancy_projects_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "consultancy_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "consultancy_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_feedback" ADD CONSTRAINT "client_feedback_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "consultancy_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patent_inventors" ADD CONSTRAINT "patent_inventors_patentId_fkey" FOREIGN KEY ("patentId") REFERENCES "patents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patent_inventors" ADD CONSTRAINT "patent_inventors_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patent_stages" ADD CONSTRAINT "patent_stages_patentId_fkey" FOREIGN KEY ("patentId") REFERENCES "patents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patent_licenses" ADD CONSTRAINT "patent_licenses_patentId_fkey" FOREIGN KEY ("patentId") REFERENCES "patents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novelty_checks" ADD CONSTRAINT "novelty_checks_patentId_fkey" FOREIGN KEY ("patentId") REFERENCES "patents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prototypes" ADD CONSTRAINT "prototypes_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "startup_investors" ADD CONSTRAINT "startup_investors_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "startup_demo_days" ADD CONSTRAINT "startup_demo_days_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phd_scholars" ADD CONSTRAINT "phd_scholars_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phd_scholars" ADD CONSTRAINT "phd_scholars_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phd_scholars" ADD CONSTRAINT "phd_scholars_coSupervisorId_fkey" FOREIGN KEY ("coSupervisorId") REFERENCES "faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phd_milestones" ADD CONSTRAINT "phd_milestones_scholarId_fkey" FOREIGN KEY ("scholarId") REFERENCES "phd_scholars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idc_meetings" ADD CONSTRAINT "idc_meetings_scholarId_fkey" FOREIGN KEY ("scholarId") REFERENCES "phd_scholars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scholar_publications" ADD CONSTRAINT "scholar_publications_scholarId_fkey" FOREIGN KEY ("scholarId") REFERENCES "phd_scholars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

