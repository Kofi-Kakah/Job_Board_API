import express from "express"
import dotenv from "dotenv"

import authRoutes from "./src/routes/auth.routes.js"
import userRoutes from "./src/routes/user.routes.js"
import companyRoutes from "./src/routes/company.routes.js"
import experienceRoutes from "./src/routes/experience.routes.js"
import educationRoutes from "./src/routes/education.routes.js"
import resumeRoutes from "./src/routes/resume.routes.js"
import applicationRoutes from "./src/routes/application.routes.js"
import connectDB from "./database/db.js"
import parseCookies from "./src/middleware/cookieParser.middleware.js"

const app = express()

dotenv.config()

const PORT = process.env.PORT || 5000

app.use(express.json())
app.use(parseCookies)

app.use("/api/v1/auth",authRoutes)
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/companies", companyRoutes)
app.use("/api/v1/experiences", experienceRoutes)
app.use("/api/v1/education", educationRoutes)
app.use("/api/v1/resumes", resumeRoutes)
app.use("/api/v1/application", applicationRoutes)

const startServer = async () => {
    try {
        await connectDB()
        app.listen(PORT, () => {
            console.log(`Server is running on PORT: http://localhost:${PORT}`)
        })
    } catch (error) {
        console.error(`Server startup failed: ${error.message}`)
        process.exit(1)
    }
}

startServer()



