import express from "express"
import dotenv from "dotenv"

import authRoutes from "./src/routes/auth.routes.js"

const app = express()

dotenv.config()

const PORT = process.env.PORT || 5000

app.use(express.json())
//app.use(cookieParser())

app.use("/api/v1/auth",authRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on PORT: http://localhost:${PORT}`)
})



