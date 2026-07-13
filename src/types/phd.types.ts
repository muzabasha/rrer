export interface PhDScholar {
  id: string
  enrollmentNumber: string
  riskStatus: "ON_TRACK" | "NEEDS_ATTENTION" | "CRITICAL"
  progressPercent: number
}
