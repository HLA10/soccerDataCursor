# Multi-Team Support Migration Guide

This document explains the new multi-team feature and how to migrate your existing data.

## Overview

The CMS now supports multiple teams. Each team has its own:
- Players (with ability to borrow from other teams)
- Games
- Tournaments
- Statistics

## Database Migration Steps

1. **Run Prisma migration:**
   ```bash
   npx prisma migrate dev --name add_multi_team_support
   npx prisma generate
   ```

2. **Create your first team:**
   - After migration, you'll need to create at least one team
   - You can do this via the API or directly in the database

3. **Migrate existing data:**
   - All existing players, games, and tournaments need to be assigned to a team
   - Run this SQL script (adjust team ID as needed):

   ```sql
   -- First, create a default team
   INSERT INTO teams (id, name, code, "createdAt", "updatedAt")
   VALUES ('default-team-id', 'Djugarden F2011-A', 'F2011-A', NOW(), NOW());

   -- Assign all existing players to the default team
   UPDATE players SET "primaryTeamId" = 'default-team-id' WHERE "primaryTeamId" IS NULL;

   -- Create TeamPlayer entries for all players
   INSERT INTO team_players (id, "playerId", "teamId", "isBorrowed", "createdAt", "updatedAt")
   SELECT gen_random_uuid(), id, 'default-team-id', false, NOW(), NOW()
   FROM players WHERE "primaryTeamId" = 'default-team-id';

   -- Assign all existing games to the default team
   UPDATE games SET "teamId" = 'default-team-id' WHERE "teamId" IS NULL;

   -- Assign all existing tournaments to the default team
   UPDATE tournaments SET "teamId" = 'default-team-id' WHERE "teamId" IS NULL;

   -- Assign users to the default team (optional)
   UPDATE users SET "teamId" = 'default-team-id' WHERE "teamId" IS NULL;
   ```

## Features

### Team Selection
- Teams can be selected from the dropdown in the navbar
- Selected team is stored in localStorage
- All data is filtered by the selected team

### Player Borrowing
- When managing a game, you can include players from other teams by setting `includeBorrowed=true`
- Borrowed players' stats are recorded and visible across all teams
- Players can be marked as "borrowed" in the TeamPlayer table

### API Changes

All API routes now accept optional `teamId` query parameter:
- `/api/players?teamId=xxx&includeBorrowed=true` - Get players for a team (including borrowed)
- `/api/games?teamId=xxx` - Get games for a team
- `/api/tournaments?teamId=xxx` - Get tournaments for a team

## Creating Teams

Teams can be created via:
1. API: `POST /api/teams` (Admin only)
2. Direct database insert
3. Future: Admin UI for team management

## Notes

- Players can belong to multiple teams (via TeamPlayer join table)
- Each player has a `primaryTeamId` (their main team)
- Games and tournaments belong to one team
- Users can belong to a team (for filtering/access control)

