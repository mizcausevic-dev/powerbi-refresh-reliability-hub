# Changelog

## 1.0.0-prod — 2026-05-31

- Hardened to v1.0-prod per squad doctrine, Operator Diagnostics lane.
- GitHub Pages enabled, custom domain https://powerbi.kineticgain.com/.
- Added to AI Procurement Pulse universe.csv.
- Surfaced on mizcausevic-dev profile README + apex /constellation/ Operator Diagnostics lane.
- No src changes; CI gates green, AGPL-3.0-or-later, synthetic data only.



## v0.1-shipped

- Initial release: operator surface for Power BI refresh reliability and report-delivery posture.
- Added a public dashboard surface with overview, refresh-lane, pipeline-gaps, delivery-posture, verification, and docs routes.
- Added prerendered GitHub Pages packaging for `powerbi.kineticgain.com` with `CNAME`, `robots.txt`, `sitemap.xml`, and OG/meta injection at deploy time.
- Added an offline analyzer and CLI for refresh SLA breaches, gateway pressure, semantic-model drift, stale report delivery, telemetry gaps, and stale remediation windows.