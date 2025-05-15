# NextGenWeb - Hosting Services Platform

A modern web application built with Next.js 14 offering RDP (Remote Desktop Protocol) and VPS (Virtual Private Server) hosting services with a comprehensive administration system.

## Features

- **User Authentication**: Secure login/registration with email verification
- **Service Dashboard**: Manage RDP and VPS services
- **Admin Portal**: Analytics, user management, and order processing
- **Order System**: Multiple service plans and payment processing
- **Support System**: Ticket management with staff responses

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: TailwindCSS, Radix UI
- **State Management**: React Query, Redux Toolkit, Zustand
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with argon2 password hashing

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/nextgenweb.git
cd nextgenweb
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with:
```
DATABASE_URL="postgresql://username:password@host:port/database"
JWT_SECRET="your-secret-key"
```

4. Run database migrations
```bash
npm run prisma:migrate
```

5. Start the development server
```bash
npm run dev
```

## Deployment

This application is configured for deployment on Vercel with a PostgreSQL database.

## License

[MIT](LICENSE) 