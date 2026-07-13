# Quick Start Guide - REVA Research Intelligence Portal

## Prerequisites

- Node.js 18.17 or later
- npm (comes with Node.js)

## Getting Started

### 1. Navigate to the Project Directory

```bash
cd "D:\Vertical R & D\website\reva-research-portal"
```

### 2. Dependencies Are Already Installed

The project dependencies have been installed. If you need to reinstall:

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000)

### 4. View the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the REVA Research Intelligence Portal welcome page.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build the application for production |
| `npm run start` | Start production server (requires build first) |
| `npm run lint` | Run ESLint to check code quality |

## Project Structure

```
reva-research-portal/
├── src/
│   └── app/              # App Router (Next.js 15)
│       ├── layout.tsx    # Root layout
│       ├── page.tsx      # Home page
│       └── globals.css   # Global styles
├── public/               # Static assets
├── node_modules/         # Dependencies
├── .env.example          # Environment variables template
├── next.config.ts        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project metadata and scripts
```

## Next Steps

1. **Configure Environment Variables:**
   - Copy `.env.example` to `.env.local`
   - Fill in the required values

2. **Start Development:**
   - The project is ready for feature implementation
   - Follow the design document in `.kiro/specs/reva-research-intelligence-portal/design.md`

3. **Install Additional Dependencies:**
   - Prisma for database ORM
   - NextAuth.js for authentication
   - Supabase client libraries
   - ShadCN UI components

## Technology Stack

- **Framework:** Next.js 15.3.0 (App Router)
- **UI Library:** React 19.0.0
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS 3.4.1
- **Linting:** ESLint 9.x
- **Node.js:** v22.19.0

## Troubleshooting

### Issue: Command not found
**Solution:** Make sure you're in the project directory and npm is installed.

### Issue: Port 3000 already in use
**Solution:** Stop other applications using port 3000 or use a different port:
```bash
npm run dev -- -p 3001
```

### Issue: Module not found errors
**Solution:** Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Support

For detailed information about the project architecture and requirements, refer to:
- `README.md` - Project overview
- `SETUP_VERIFICATION.md` - Setup verification details
- `.kiro/specs/reva-research-intelligence-portal/` - Complete specification documents

---

**Happy Coding! 🚀**
