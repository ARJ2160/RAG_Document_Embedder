import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

import embedRouter from "./routes/embed";
import promptRouter from "./routes/prompt";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(compression());

app.use("/api", embedRouter);
app.use("/api", promptRouter);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
