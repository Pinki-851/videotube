import dotenv from "dotenv";
import { app } from "./app.js";
import { connectDB } from "./db/index.js";

const PROT = process.env.PROT || 8000;
dotenv.config();

connectDB()
  .then(() => {
    app.on("error", (err) => {
      console.log("app error", err);
    });
    app.listen(PROT, () => {
      console.log(`server running at port:${PROT}`);
    });
  })
  .catch((err) => {
    console.log("server error", err);
  });
