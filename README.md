🏠 SafeNest — Child-First Adoption Platform

SafeNest is a secure, role-based adoption matching platform designed to protect children and ensure safe, verified family placements.

Inspired by the need to protect vulnerable children (just like in Hunter × Hunter), SafeNest focuses on verification, compatibility matching, and risk prevention.

# Please come to test it on my machine

🌟 Core Mission

Give every child a safe, loving home — while preventing dangerous individuals from accessing the system.

🚀 Features
👨‍👩‍👧 Families

Create secure account

Complete detailed family profile

Upload verification documents

Get manually reviewed by admin

Receive compatibility-based match suggestions

View match scoring and reasoning

🧑‍⚖️ Admin

Review verification submissions

Approve or reject families

Ban / lock suspicious accounts

View uploaded documents

Monitor system risk signals

🧑‍💼 Caseworker

Create child profiles (private)

Define age ranges and support needs

Manage placement eligibility

🛡️ Security Model

SafeNest follows a child-first security architecture:

Children are never publicly searchable

Only verified families see limited child information

Manual admin verification required

Role-based access control

Account banning system

Risk-aware matching logic

🧠 Matching Logic

Families are matched based on:

Preferred age range

City compatibility

Support capabilities (medical, therapy, disability)

Household capacity

Sibling acceptance

Relocation flexibility

Each suggestion includes:

Compatibility score

Clear reasoning for match

🏗️ Tech Stack
Frontend

Next.js 16 (App Router)

React 19

TailwindCSS

Backend

Next.js API Routes

Prisma ORM

PostgreSQL

Authentication

NextAuth (Credentials Provider)

JWT-based session

Role-based redirect

Database

PostgreSQL

Prisma schema

🗂️ Roles
Role	Access
FAMILY	Dashboard, Profile, Verification, Matches
ADMIN	Verification queue, Ban/Verify users
CASEWORKER	Create/manage children
📦 Project Structure
app/
 ├── admin/
 ├── dashboard/
 │    ├── profile/
 │    ├── verification/
 │    ├── matches/
 ├── caseworker/
 │    └── children/
 ├── api/
 │    ├── auth/
 │    ├── admin/
 │    ├── family/
 │    ├── caseworker/
 │    └── matches/
lib/
 └── prisma.js
prisma/
 ├── schema.prisma
 └── seed.js

⚙️ Setup Instructions
1️⃣ Clone the repository
git clone https://github.com/your-username/safenest.git
cd safenest

2️⃣ Install dependencies
npm install

3️⃣ Setup environment variables

Create .env file:

DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/safenest"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

4️⃣ Setup database
npx prisma migrate dev
npx prisma db seed

5️⃣ Run the app
npm run dev


Visit:

http://localhost:3000

🧪 Demo Accounts
Role	Email	Password
Admin	admin@safenest.local
	Password123!
Caseworker	caseworker@safenest.local
	Password123!
Family	hedi@gmail.com
	azertyazerty!
🔐 Role-Based Redirect

After login:

ADMIN → /admin

CASEWORKER → /caseworker/children

FAMILY → /dashboard/profile

🧩 Prisma Models (Simplified)

User

FamilyProfile

Child

Document

Match

RiskEvent
