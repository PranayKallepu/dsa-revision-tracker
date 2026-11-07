# DSA Revision Tracker

**From Solved Problems to Lasting Skills.**

DSA Revision Tracker is a web application designed to help developers retain and improve their Data Structures and Algorithms problem-solving skills through scheduled revisions, pattern recognition, and mastery assessments.

Instead of simply tracking solved problems, the goal is to help users recall approaches, recognize problem-solving patterns, and solve problems independently over time.

## 🎯 Project Goals

- Build long-term retention of solved DSA problems.
- Follow a structured spaced-repetition schedule.
- Improve pattern recognition and independent problem-solving.
- Track solving-time improvements across attempts.
- Evaluate actual problem-solving mastery through assessments.

## ✨ Planned Features

- **Problem Management:** Organize problems with difficulty, platform, topics, approaches, and personal notes.
- **Spaced Repetition:** Automatically schedule revisions.
- **Revision Workspace:** Recall solutions before revealing saved notes.
- **Attempt Tracking:** Record solving time and compare performance.
- **Mastery Assessment:** Evaluate independent problem-solving ability.
- **Analytics:** Track revision progress and topic-wise performance.
- **Activity History:** Review completed and missed revisions.
- **Archive:** Preserve and restore archived problems.

## 📅 Revision Schedule

| Revision | Scheduled Day |
|---|---:|
| 1 | Day 1 |
| 2 | Day 3 |
| 3 | Day 7 |
| 4 | Day 15 |
| 5 | Day 30 |
| 6 | Day 60 |
| Subsequent | Every 30 days |

Forgot or Difficult ratings restart the revision cycle. Good or Easy ratings continue the existing schedule.

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Validation | Zod |
| Database (planned) | PostgreSQL |
| ORM (planned) | Prisma |
| Authentication (planned) | Auth.js |
| Charts (planned) | Recharts |

## 📁 Project Architecture

The project follows a feature-oriented architecture to keep components modular, reusable, and maintainable.

```text
src/
├── app/
├── components/
│   ├── layout/
│   ├── shared/
│   └── ui/
├── features/
│   ├── dashboard/
│   ├── problems/
│   ├── revisions/
│   ├── mastery/
│   ├── analytics/
│   ├── activity/
│   └── archive/
├── hooks/
├── lib/
├── constants/
├── types/
└── config/
```

## 🚀 Getting Started

### Prerequisites

- Node.js
- pnpm

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/dsa-revision-tracker.git

cd dsa-revision-tracker

pnpm install

pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗺️ Development Roadmap

- [x] Initial UI prototype
- [x] Establish feature-oriented frontend architecture
- [ ] Implement Next.js App Router navigation
- [ ] Integrate shadcn/ui components
- [ ] Complete dashboard and problem management
- [ ] Implement revision workspace
- [ ] Implement mastery assessments
- [ ] Build analytics and activity history
- [ ] Integrate PostgreSQL and Prisma
- [ ] Implement authentication
- [ ] Testing and deployment

## 📌 Current Development Status

**Frontend development in progress.**

The initial UI prototype and frontend architecture are being established. The current application uses mock data. Backend integration and persistent data storage are planned for subsequent development phases.

## 🤝 Contributions

This project is being developed as an individual portfolio project. Suggestions and feedback are welcome.
