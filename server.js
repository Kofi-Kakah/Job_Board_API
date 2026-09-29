import express from "express"
import dotenv from "dotenv"

import authRoutes from "./src/routes/auth.routes.js"
import connectDB from "./database/db.js"

const app = express()

dotenv.config()

const PORT = process.env.PORT || 5000

app.use(express.json())
//app.use(cookieParser())

app.use("/api/v1/auth",authRoutes)

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



