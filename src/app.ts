// SPDX-License-Identifier: AGPL-3.0-or-later

import express from "express";
import { fileURLToPath } from "node:url";

import {
  deliveryPosture,
  payload,
  pipelineGaps,
  refreshLane,
  summary,
  verification
} from "./services/powerBiRefreshReliabilityHubService.js";
import {
  renderDeliveryPosture,
  renderDocs,
  renderOverview,
  renderPipelineGaps,
  renderRefreshLane,
  renderVerification
} from "./services/render.js";

const app = express();
const port = Number(process.env.PORT ?? 5524);
const host = process.env.HOST || "0.0.0.0";

app.get("/", (_req, res) => res.type("html").send(renderOverview()));
app.get("/refresh-lane", (_req, res) => res.type("html").send(renderRefreshLane()));
app.get("/pipeline-gaps", (_req, res) => res.type("html").send(renderPipelineGaps()));
app.get("/delivery-posture", (_req, res) => res.type("html").send(renderDeliveryPosture()));
app.get("/verification", (_req, res) => res.type("html").send(renderVerification()));
app.get("/docs", (_req, res) => res.type("html").send(renderDocs()));

app.get("/api/dashboard/summary", (_req, res) => res.json(summary()));
app.get("/api/refresh-lane", (_req, res) => res.json(refreshLane()));
app.get("/api/pipeline-gaps", (_req, res) => res.json(pipelineGaps()));
app.get("/api/delivery-posture", (_req, res) => res.json(deliveryPosture()));
app.get("/api/verification", (_req, res) => res.json(verification()));
app.get("/api/sample", (_req, res) => res.json(payload()));

const currentFile = fileURLToPath(import.meta.url);
const invokedDirectly = process.argv[1] !== undefined && currentFile === process.argv[1];

if (invokedDirectly) {
  app.listen(port, host, () => {
    console.log(`Power BI Refresh Reliability Hub listening on http://${host}:${port}`);
  });
}

export default app;
