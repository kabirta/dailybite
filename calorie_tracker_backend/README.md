# Calorie Tracker Backend (MERN API)

Production-ready Node.js + Express + MongoDB backend for a calorie tracker app with JWT auth (access + refresh), food catalog, daily macro logs, water tracking, and weight tracking.

## Tech Stack
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (`15m` access, `7d` refresh)
- `express-validator`
- `helmet`, `cors`, `express-rate-limit`
- Swagger docs

## Project Structure
```txt
calories-backend/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── scripts/
├── utils/
├── validators/
├── .env.example
├── app.js
├── server.js
└── index.js
```

## Setup
1. Install dependencies:
```bash
npm install
```

2. Configure env:
```bash
cp .env.example .env
```

3. Start server:
```bash
npm run dev
```

4. API docs:
- `http://localhost:5000/api/docs`

## Scripts
- `npm run dev` - start with nodemon
- `npm start` - production run
- `npm run seed` - insert seed foods
- `npm run check` - app load sanity check

## Core API Endpoints

### Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`

### User
- `GET /api/v1/users/me`
- `PATCH /api/v1/users/profile`
- `PATCH /api/v1/users/calorie-goal`

### Food
- `POST /api/v1/foods`
- `GET /api/v1/foods?q=rice&page=1&limit=10`
- `GET /api/v1/foods/:foodId`

### Daily Log
- `POST /api/v1/logs/meals`
- `DELETE /api/v1/logs/meals/:mealId?date=2026-02-18`
- `GET /api/v1/logs/today`
- `GET /api/v1/logs/range?startDate=2026-02-01&endDate=2026-02-18`

### Water
- `POST /api/v1/water`
- `GET /api/v1/water/daily?date=2026-02-18`

### Weight
- `POST /api/v1/weight`
- `GET /api/v1/weight/history?startDate=2026-01-01&endDate=2026-02-18`

### Reminders
- `POST /api/v1/reminders`
- `GET /api/v1/reminders`
- `GET /api/v1/reminders/:reminderId`
- `PATCH /api/v1/reminders/:reminderId`
- `PATCH /api/v1/reminders/:reminderId/status`
- `DELETE /api/v1/reminders/:reminderId`

### Photo Album
- `POST /api/v1/photoalbum` (multipart/form-data, field name: `image`, optional: `caption`)
- `GET /api/v1/photoalbum`

### Breath Test
- `POST /api/v1/breath-test`
- `GET /api/v1/breath-test`

### Recipes
- `POST /api/v1/recipes` (multipart/form-data, image file field: `image`)
- `GET /api/v1/recipes`
- `GET /api/v1/recipes/:recipeId`
- `PATCH /api/v1/recipes/:recipeId` (optional image file field: `image`)
- `DELETE /api/v1/recipes/:recipeId`

### Health Assessment
- `POST /api/v1/health-assessment`
- `GET /api/v1/health-assessment`

## Example Requests

Register:
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret123"}'
```

Create food:
```bash
curl -X POST http://localhost:5000/api/v1/foods \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Oats","calories":389,"protein":16.9,"carbs":66.3,"fat":6.9,"fiber":10.6,"servingSize":100,"pieceWeight":30}'
```

Add meal:
```bash
curl -X POST http://localhost:5000/api/v1/logs/meals \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"foodId":"<foodId>","quantity":2,"quantityUnit":"piece"}'
```

## Indexes Added
- `User`: unique index on `email`
- `Food`: text index on `name` + `brand`
- `DailyLog`: unique compound index on `user + date`
- `WaterLog`: unique compound index on `user + date`
- `WeightLog`: index on `user + date`

## Notes
- Read queries use `.lean()` where applicable.
- Centralized error handling and request validation are enabled.
- Macros for meal entries are auto-calculated from food nutrition per `100g`.
- Meal quantity units supported: `g`, `kg`, `piece`.
- For `piece` unit, define `pieceWeight` (grams per piece) on the food item.
- Reminder types: `breakfast`, `lunch`, `dinner`, `water`, `snack/others`, `workout`.
- For reminders, `days` uses weekday numbers (`0=Sunday` to `6=Saturday`) and `time` uses `HH:mm`.
- Water reminders are limited to `5` per user.
