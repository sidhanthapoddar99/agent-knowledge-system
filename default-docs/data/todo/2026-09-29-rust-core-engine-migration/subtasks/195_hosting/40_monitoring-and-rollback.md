---
title: "Hosting: smoke tests, uptime monitoring and rollback"
status: open
---

Once the site is live, a bad deploy or an outage must be noticed and undone quickly. This leaf adds smoke tests that run after every deploy, an external uptime check, a nightly link check of the live site, and a rollback that redeploys the previous image. The site holds no state, so rollback is just running an older image.

# 01 To Do
- [ ] **Claude: smoke tests** (`docs/deploy/smoke.sh`, run by the website workflow after deploy and usable by hand):
    - [ ] `GET /` → 200, contains the homepage title.
    - [ ] `GET /docs/` → 200, contains the docs title.
    - [ ] One deep docs page → 200.
    - [ ] `GET /install.sh` and `/install.ps1` → 302 to a `github.com/NeuraLabsHQ/agent-knowledge-system/releases/…` asset that itself answers 200 after redirects.
    - [ ] `GET /docs/llms.txt`, `/sitemap.xml`, `/robots.txt` → 200.
    - [ ] A missing page → 404 with the right 404 page.
    - [ ] HTTPS certificate valid for at least 14 more days.
- [ ] **Claude: automatic rollback in the workflow.** If the smoke tests fail after a deploy, redeploy the previous image tag and fail the workflow.
- [ ] **Claude: manual rollback.** A workflow dispatch input `image_tag` that redeploys any earlier tag. Keep the last 20 tags in the registry.
- [ ] **Claude: nightly live link check** — a scheduled workflow crawls the live site and opens an issue in the main repository when a link breaks.
- [ ] **sidhantha: an uptime monitor** on `https://agentks.neuralabs.org/` and `/docs/` from an external service the organisation uses, alerting sidhantha. Claude lists the URLs and expected responses.
- [ ] **Rehearse** one rollback after the first deploy and record it in Result.

## Guardrails
- Monitoring accounts and alert destinations are sidhantha's. Claude does not sign up to services.
- A rollback never rebuilds; it redeploys an existing image.

## Done when
- The smoke tests run after every deploy and pass.
- A deliberately broken deploy (a staging tag with a missing `/docs/` folder) is rolled back automatically.
- The uptime monitor exists and has alerted once in a test.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, folders `docs/deploy/` and `.github/workflows/`.
- **Read first:** [Deployment and hosting](../../notes/05_delivery/06_deployment-and-hosting.md), section 04 ("Rollback: redeploy the previous image tag. The site holds no state").
- **Depends on:** [195/20 build and deploy pipeline](./20_build-and-deploy-pipeline.md), [195/10 domain and DNS](./10_domain-and-dns.md).
- **Unblocks:** [200/20 switch-over](../200_launch/20_switch-over.md) (the site must be proven stable before users are pointed at it).

# 04 Decisions
- Decided (claude, 2026-09-30): failed smoke tests roll the deploy back automatically, because the site is stateless and the previous image is known good.

# 05 Notes & Analysis

## Watch out
- GitHub's release redirects add a second hop; smoke tests must follow redirects to the final asset, or a missing asset looks like a working redirect.
