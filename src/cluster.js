import express from "express";

import cluster from "node:cluster";
import os from "os";

let totalCpu = os.cpus().length;
// console.log("totalCpu", totalCpu);

if (cluster.isPrimary) {
  for (let i = 0; i < totalCpu; i++) {
    cluster.fork();
  }
} else {
  const app = express();
  const PORT = 8000;

  app.get("/home", (req, res, next) => {
    res.send("hello from cluster test" + process.pid);
  });

  app.listen(PORT, () => {
    console.log("server connected successfully", PORT);
  });
}
