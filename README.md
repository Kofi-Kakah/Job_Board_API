# 💼 Job Board API

<p align="center">
  A REST API for connecting candidates and employers — account registration → candidate profiles → company and job listings → job search → applications and hiring status updates.
</p>

<p align="center">
  Built with <strong>Express 5</strong>, <strong>MongoDB</strong>, and <strong>Mongoose</strong>.
</p>

<p align="center">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-ES%20modules-339933?logo=node.js&logoColor=white">
  <img alt="Express" src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white">
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white">
  <img alt="JWT" src="https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white">
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> ·
  <a href="#api-reference">API Reference</a> ·
  <a href="#data-models">Data Models</a> ·
  <a href="#authentication">Authentication</a> ·
  <a href="#project-structure">Project Structure</a>
</p>

---

## 📖 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Authentication](#authentication)
- [API Reference](#api-reference)
- [Data Models](#data-models)
- [Errors and Status Codes](#errors-and-status-codes)
- [Notes](#notes)

## ✨ Features

- Candidate and employer registration, login, and logout.
- JWT authentication using an HTTP-only cookie or an `Authorization: Bearer` header.
- Candidate profile management, candidate discovery, experience, education, and resume metadata.
- Employer company profiles and job posting management.
- Public job search with location, type, workplace, experience, skills, and salary filters.
- Job applications, application history, withdrawal, and employer status updates.
- MongoDB persistence through Mongoose models and references.

## 🧰 Tech Stack

| Component | Technology |
| --- | --- |
| Runtime | Node.js with ES modules |
| HTTP API | Express 5 |
| Database | MongoDB with Mongoose |
| Authentication | JSON Web Tokens (`jsonwebtoken`) |
| Password hashing | `bcrypt` |
| Configuration | `dotenv` |
| Cookie parsing | `cookieparser` package and project middleware |
| Development server | Nodemon |

## 🏗️ Architecture

`server.js` loads environment configuration, creates the Express application, and installs JSON body parsing and cookie parsing middleware. It mounts resource routers under `/api/v1`, connects to MongoDB, and only starts listening after a successful connection.

Requests are handled by route modules in `src/routes/`. Protected routes use the authentication middleware, which verifies a JWT and attaches its user ID and role to `req.user`. Controllers in `src/controllers/` enforce role and ownership rules and read or write Mongoose documents in `models/`.

## 📁 Project Structure

```text
.
├── server.js                 # Application setup and startup
├── database/
│   └── db.js                 # MongoDB connection
├── models/                   # Mongoose schemas and models
├── src/
│   ├── controllers/          # Request handlers and business rules
│   ├── middleware/           # Authentication and cookie parsing
│   ├── routes/               # API route definitions
│   └── utils/                # JWT signing and verification
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js and npm.
- A MongoDB deployment or local MongoDB instance.

### Install and run

```bash
git clone https://github.com/Kofi-Kakah/Job_Board_API.git
cd Job_Board_API
npm install
```

Create a `.env` file in the project root as described in [Environment Variables](#environment-variables), then start the development server:

```bash
npm run dev
```

The server listens on port `5000` by default. Set `PORT` to use a different port. Startup fails with an error if MongoDB cannot connect or the required connection URI is missing.

## 🔐 Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `MONGO_URI` | Yes | MongoDB connection string used by Mongoose. |
| `JWT_SECRET` | Yes | Secret used to sign and verify authentication tokens. Use a long, private value. |
| `PORT` | No | HTTP port; defaults to `5000`. |
| `NODE_ENV` | No | Set to `production` to mark the authentication cookie as `Secure`. |

Example `.env` (replace the example values):

```dotenv
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/job_board
JWT_SECRET=replace-this-with-a-long-random-secret
NODE_ENV=development
```

Do not commit `.env` or real secrets to source control.

## 🔑 Authentication

Signup and login issue a signed JWT with a seven-day expiry. The API returns it in an `authToken` cookie configured as `HttpOnly`, `SameSite=Lax`, and `Secure` when `NODE_ENV=production`. The custom cookie middleware parses incoming cookies before routes run.

For clients that do not use cookies, send the same token as a bearer token:

```http
Authorization: Bearer <token>
```

Protected endpoints require either credential. Roles used by the API are `candidate`, `employer`, and `admin`; signup accepts `candidate` or `employer` and defaults to `candidate`.

## 📚 API Reference

All paths below are relative to `/api/v1`. Request and response bodies use JSON unless stated otherwise. Protected routes require authentication; role requirements are noted.

### Authentication — `/auth`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/signup` | Public | Create an account. Body: `username` or `name`, `email`, `password`, optional `role`. Password must be at least 8 characters. |
| `POST` | `/auth/login` | Public | Sign in with `email` and `password`. Sets the `authToken` cookie. |
| `POST` | `/auth/logout` | Authenticated | Clear the authentication cookie. |

Signup returns `201` and a public user summary. `name` is accepted as an alias/fallback for the username and is split into first and last name when provided. Duplicate email or username returns `409`.

### Users — `/users`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/users/me` | Authenticated | Get the current profile with experience, education, resumes, applications, and companies populated. |
| `PATCH` | `/users/me` | Authenticated | Update allowed profile fields: name, headline, job title, summary, contact, location, skills, experience preferences, salary preferences, open-to-work, and visibility. |
| `GET` | `/users/candidates/search` | Employer or admin | Search public, active candidate profiles. Supports `skills` (comma-separated), `city`, `country`, `experienceLevel`, `page`, and `limit` (maximum 100). |

Candidate search excludes candidate email addresses and passwords. Results include pagination metadata.

### Companies — `/companies`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/companies` | Employer | Create a company. The authenticated employer becomes its owner. |
| `GET` | `/companies/:companyId` | Authenticated | Get a company and its owner's username. |
| `PATCH` | `/companies/:companyId` | Owner | Update company name, description, website, industry, size, logo, or location. |
| `DELETE` | `/companies/:companyId` | Owner | Delete the company and remove it from the owner's company lists. |

Company sizes may be `1-10`, `11-50`, `51-200`, `201-500`, `501-1000`, or `1000+`.

### Jobs — `/jobs`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/jobs/search` | Public | Search open jobs. See filters below. |
| `GET` | `/jobs/:jobId` | Public | Get an open job with public company details. |
| `GET` | `/jobs/mine` | Employer | List the authenticated employer's jobs; optional `status=draft\|open\|closed`. |
| `POST` | `/jobs` | Employer | Create a job for a company the employer owns. Requires a valid `companyId`. |
| `PATCH` | `/jobs/:jobId` | Owner | Update an owned job unless it is closed. |
| `PATCH` | `/jobs/:jobId/close` | Owner | Close an owned job. |

Job search accepts these optional query parameters:

| Parameter | Meaning |
| --- | --- |
| `title`, `city`, `region`, `country` | Case-insensitive text match. |
| `employmentType` | One or comma-separated values: `full-time`, `part-time`, `contract`, `temporary`, `internship`, `freelance`. |
| `workplaceType` | `remote`, `hybrid`, or `onsite`; comma-separated values are supported. |
| `experienceLevel` | `entry`, `junior`, `mid`, `senior`, `lead`, or `executive`; comma-separated values are supported. |
| `skills` | One or comma-separated skill names. |
| `salaryMin`, `salaryMax` | Non-negative numeric salary bounds. |
| `page`, `limit` | Pagination; defaults to page `1` and limit `20`, maximum limit `100`. |

Search results are sorted newest first and include pagination metadata. Job creation accepts `title`, `description`, `responsibilities`, `requirements`, `skills`, `companyId`, `location`, employment and workplace types, experience requirements, salary, and application deadline. The job status defaults to `open` in the schema.

### Applications — `/applications` and `/jobs/:jobId/applications`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/applications/me` | Authenticated candidate | List the current user's applications; optional `status` filter. |
| `POST` | `/jobs/:jobId/applications` | Candidate | Apply to an open job. Optional body field `resume` must reference a resume on the candidate's profile. |
| `GET` | `/jobs/:jobId/applications` | Employer who owns job | List applications to an owned job; optional `status` filter. Includes candidate profile fields and resume. |
| `PATCH` | `/applications/:applicationId/status` | Employer who owns job | Set status to `viewed`, `shortlisted`, `interviewing`, `offered`, or `rejected`. Body: `{ "status": "shortlisted" }`. |
| `PATCH` | `/applications/:applicationId/withdraw` | Authenticated candidate | Withdraw an application unless it is already rejected or withdrawn. |

An application begins with status `submitted`. A unique job/candidate index prevents repeat applications; duplicates return `409`.

### Resumes — `/resumes`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/resumes` | Authenticated | List the current user's resume records. |
| `POST` | `/resumes` | Authenticated | Add resume metadata. `url` is required; `name`, `mimeType`, `size`, and `isDefault` are optional. |
| `PATCH` | `/resumes/:resumeId/default` | Owner | Make one of the user's resumes the default. |
| `DELETE` | `/resumes/:resumeId` | Owner | Delete a resume record. If it was default, the first remaining resume is made default. |

### Experience — `/experiences`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/experiences` | Authenticated | Add an experience record. `title` and `company` are required. |
| `PATCH` | `/experiences/:experienceId` | Owner | Update an experience record. |
| `DELETE` | `/experiences/:experienceId` | Owner | Delete an experience record. |

Experience records support location, employment type, start and end dates, current status, and description.

### Education — `/education`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/education` | Authenticated | Add an education record. `institution` is required. |
| `PATCH` | `/education/:educationId` | Owner | Update an education record. |
| `DELETE` | `/education/:educationId` | Owner | Delete an education record. |

Education records support qualification, field of study, dates, and description.

## 🗃️ Data Models

| Model | Purpose and main relationships |
| --- | --- |
| `User` | Account, role, candidate profile, preferences, and references to resumes, experience, education, applications, companies, and posted jobs. |
| `Company` | Employer-owned organization profile; jobs reference a company. |
| `Job` | Job description, requirements, location, type, salary, status, company, and posting employer. |
| `Application` | Candidate's application to a job, optional resume, status, and timestamps. One application per candidate/job pair. |
| `Resume` | Resume URL and related metadata, including default selection. This API stores metadata and does not upload file bytes. |
| `Experience` | Candidate work history. |
| `Education` | Candidate education history. |

Mongoose schemas validate required fields and enumerated values, and add timestamps to records. The user model includes indexes for geospatial location, skills and experience, and role/location. Jobs have text and filter indexes. Applications enforce uniqueness for each job and candidate.

## ⚠️ Errors and Status Codes

Responses generally return JSON with a `message`; many validation or server errors also include an `error` detail. Common status codes include:

| Code | Meaning |
| --- | --- |
| `200` | Request completed. |
| `201` | Resource created. |
| `400` | Invalid input, ID, or model validation failure. |
| `401` | Authentication is missing, invalid, or expired. |
| `403` | The account role does not have access. |
| `404` | Resource not found or not owned by the current user. |
| `409` | Duplicate account or duplicate application. |
| `500` | Unexpected server-side failure. |

## 📝 Notes

- The application has a development script (`npm run dev`); `package.json` does not currently define a production start or test script.
- Resume routes manage URL and metadata records. File upload or storage is not implemented here.
- Candidate and employer operations enforce role and/or document ownership in their controllers. Company and job lookups for public display are available without authentication.
