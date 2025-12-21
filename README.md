# Football CMS

A comprehensive Content Management System for managing football team data, including players, games, tournaments, statistics, injuries, illnesses, and development comments.

## Features

- **Player Management**: Add, edit, and view player profiles with photos, positions, and jersey numbers
- **Game Statistics**: Track game minutes, goals, assists, cards, and ratings per game
- **Tournament Statistics**: Aggregate statistics by tournament
- **Injury & Illness Tracking**: Monitor player injuries and illnesses with status and dates
- **Development Comments**: Add categorized comments for player development tracking
- **Role-Based Access**: Admin, Coach, and Viewer roles with appropriate permissions
- **Dashboard**: Overview with key metrics and recent games

## Tech Stack

- **Frontend/Backend**: Next.js 14+ (App Router) with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **UI Components**: Custom components built with Tailwind

## Prerequisites

- Node.js 18.17.0 or higher
- PostgreSQL database
- npm or yarn

## Setup Instructions

1. **Clone the repository** (if applicable) or navigate to the project directory

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Copy `.env.example` to `.env`
   - Update the following variables:
     ```
     DATABASE_URL="postgresql://user:password@localhost:5432/football_cms?schema=public"
     NEXTAUTH_URL="http://localhost:3000"
     NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
     ```

4. **Set up the database**:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. **Create an admin user** (optional - you can create users via the API or database):
   ```bash
   node scripts/create-admin.js
   ```
   Or manually insert a user in the database with a hashed password.

6. **Run the development server**:
   ```bash
   npm run dev
   ```

7. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Default Login

After creating an admin user, you can log in with:
- Email: (the email you used when creating the admin)
- Password: (the password you set)

## Project Structure

```
/app
  /api              # API routes
  /(auth)           # Authentication pages
  /(dashboard)     # Protected dashboard pages
/components         # Reusable components
  /ui              # Base UI components
  /players         # Player-related components
  /stats           # Statistics components
  /comments        # Comment components
  /forms           # Form components
/lib               # Utility functions and configurations
/prisma            # Database schema
```

## API Routes

- `GET/POST /api/players` - List and create players
- `GET/PUT/DELETE /api/players/[id]` - Player CRUD
- `GET/POST /api/games` - Games management
- `GET/POST /api/games/[id]/stats` - Game statistics
- `GET/POST /api/tournaments` - Tournament management
- `GET /api/players/[id]/stats` - Player statistics aggregation
- `GET/POST /api/players/[id]/injuries` - Injury tracking
- `GET/POST /api/players/[id]/illnesses` - Illness tracking
- `GET/POST /api/players/[id]/comments` - Development comments

## User Roles

- **ADMIN**: Full access to all features, can delete records
- **COACH**: Can create and edit players, games, tournaments, injuries, illnesses, and comments
- **VIEWER**: Read-only access to all data

## Database Schema

The application uses Prisma ORM with the following main models:
- User (authentication)
- Player
- Game
- Tournament
- GameStat
- TournamentStat
- Injury
- Illness
- DevelopmentComment

See `prisma/schema.prisma` for the complete schema definition.

## Development

- Run `npm run dev` to start the development server
- Run `npm run build` to build for production
- Run `npm run start` to start the production server
- Run `npx prisma studio` to open Prisma Studio for database management

## License

This project is open source and available under the MIT License.

# soccerdatacursor
