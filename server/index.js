import express from "express";
const app = express();
import "dotenv/config";

//middleware imports
import "express-async-errors";
import cors from "cors";
import { errorHandler } from "./utils/errorHandler.js";

// router imports
import invoiceRoute from "./route/invoice.route.js";

//middleware
app.use(express.json());
app.use(cors());

//routes
app.use("/invoice", invoiceRoute)

//error handler middleware
app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, async () => {
    console.log(`server listening on ${process.env.PORT}`);
});
