import express from "express"; // API framework
import cors from "cors"; //cross origin: allow frontend to call backend
import dotenv from "dotenv"; //environment variables

// use swagger for API testing and documenting
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
// import path from "path";
// import { fileURLToPath } from "url";
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

/**
 * customized routes
 */
import jobRoutes from "./routes/jobs.js";

dotenv.config(); // <-- loads .env into process.env

const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Job Tracker API",
            version: "1.0.0",
        },
    },
    apis: [`./src/routes/*.js`], // where your route files live
});

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/jobs", jobRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
    res.json(swaggerSpec);
    // res.send("API running");
});

const PORT = process.env.PORT || 5000; // process is built into Node.js

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
