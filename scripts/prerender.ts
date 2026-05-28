import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  deliveryPosture,
  payload,
  pipelineGaps,
  refreshLane,
  summary,
  verification
} from "../src/services/powerBiRefreshReliabilityHubService.js";
import {
  renderDeliveryPosture,
  renderDocs,
  renderOverview,
  renderPipelineGaps,
  renderRefreshLane,
  renderSample,
  renderVerification
} from "../src/services/render.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "site");

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(path.join(outputDir, "api", "dashboard"), { recursive: true });
fs.copyFileSync(path.join(root, "CNAME"), path.join(outputDir, "CNAME"));

const pages: Record<string, string> = {
  "index.html": renderOverview(),
  [path.join("refresh-lane", "index.html")]: renderRefreshLane(),
  [path.join("pipeline-gaps", "index.html")]: renderPipelineGaps(),
  [path.join("delivery-posture", "index.html")]: renderDeliveryPosture(),
  [path.join("verification", "index.html")]: renderVerification(),
  [path.join("docs", "index.html")]: renderDocs(),
  [path.join("sample", "index.html")]: renderSample()
};

for (const [relativePath, html] of Object.entries(pages)) {
  const fullPath = path.join(outputDir, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, html, "utf8");
}

const apiPayloads: Record<string, unknown> = {
  [path.join("api", "dashboard", "summary.json")]: summary(),
  [path.join("api", "refresh-lane.json")]: refreshLane(),
  [path.join("api", "pipeline-gaps.json")]: pipelineGaps(),
  [path.join("api", "delivery-posture.json")]: deliveryPosture(),
  [path.join("api", "verification.json")]: verification(),
  [path.join("api", "sample.json")]: payload()
};

for (const [relativePath, data] of Object.entries(apiPayloads)) {
  const fullPath = path.join(outputDir, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf8");
}
