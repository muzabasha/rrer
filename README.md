# REVA Research Intelligence Portal (RRIP)

A comprehensive research ecosystem management platform designed to digitally transform REVA University's research, innovation, consultancy, patent management, and doctoral research operations.

## Technology Stack

- **Framework:** Next.js 15 (App Router)
- **UI Library:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Authentication:** NextAuth.js v5
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn package manager

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

Create a `.env.local` file in the root directory with the following variables:

```env
DATABASE_URL="your-supabase-postgresql-url"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
reva-research-portal/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── lib/             # Utility libraries
│   ├── actions/         # Server Actions
│   ├── hooks/           # Custom React hooks
│   └── types/           # TypeScript types
├── prisma/
│   └── schema.prisma    # Database schema
├── public/              # Static assets
└── tests/               # Test files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Features

- Faculty Profile Management
- Research Cluster Generation
- Sponsored Research Lifecycle Management
- Consultancy Project Tracking
- Patent Lifecycle Management
- Innovation and Startup Management (REVA NEST)
- PhD Scholar Progress Monitoring
- KPI Analytics Dashboard
- Executive Dashboard
- AI-Powered Research Assistant
- Report Generation
- Global Search
- Automated Notifications

## Documentation

For detailed documentation, please refer to the `/docs` directory.

## License

This project is proprietary software developed for REVA University.
