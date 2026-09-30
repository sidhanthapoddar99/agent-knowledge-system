---
title: "Hosting: the domain agentks.neuralabs.org and TLS"
status: open
---

The subdomain agentks.neuralabs.org must point at wherever the website runs, with a valid TLS certificate. neuralabs.org's DNS belongs to sidhantha's organisation, so sidhantha makes the change; Claude decides the exact records once the host is chosen, writes them here, and verifies the result.

# 01 To Do
- [ ] **Claude: write the exact records** once the host is known ([20](./20_build-and-deploy-pipeline.md)), in this leaf's Result:
    - [ ] For a VM or container host with a fixed address: `A` (and `AAAA` if IPv6) records for `agentks.neuralabs.org`.
    - [ ] For a platform or CDN: a `CNAME` for `agentks.neuralabs.org` to the platform's hostname, plus any verification `TXT` record it asks for.
    - [ ] A low TTL (300 s) for the launch, raised to 3600 s after a week.
- [ ] **sidhantha: add the records** at neuralabs.org's DNS provider.
- [ ] **TLS.** The certificate is issued by the host's proxy or CDN (automatic ACME), or by a TLS-terminating proxy in front of nginx on a VM (Caddy or Traefik with Let's Encrypt). The website container itself serves plain HTTP on port 80.
    - [ ] sidhantha: turn on the certificate in the host or CDN account if it needs a click.
    - [ ] Redirect `http://` to `https://`, and set `Strict-Transport-Security` once HTTPS is confirmed working.
- [ ] **Claude: verify** with `dig +short agentks.neuralabs.org`, `curl -I http://agentks.neuralabs.org/` (301 to HTTPS) and `curl -I https://agentks.neuralabs.org/` (200), and record the output in Result.
- [ ] **Check CAA records** on neuralabs.org: if one exists, it must allow the certificate authority the host uses.

## Guardrails
- Claude does not access the DNS provider. sidhantha makes every DNS change.
- No wildcard records; only `agentks.neuralabs.org`.

## Done when
- `dig +short agentks.neuralabs.org` returns the host's address or CNAME target.
- `curl -I https://agentks.neuralabs.org/` returns 200 with a valid certificate, and `http://` redirects to `https://`.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Repository:** none for the DNS itself; notes go in this leaf.
- **Read first:** [Deployment and hosting](../../notes/05_delivery/06_deployment-and-hosting.md), section 03 ("TLS is terminated by the host's proxy or the CDN in front of nginx, not inside this container").
- **Depends on:** [195/20 build and deploy pipeline](./20_build-and-deploy-pipeline.md) (the host choice).
- **Unblocks:** [195/30 docs at /docs](./30_docs-at-slash-docs.md) going live, [195/40 monitoring](./40_monitoring-and-rollback.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the domain is agentks.neuralabs.org ([deployment and hosting](../../notes/05_delivery/06_deployment-and-hosting.md)).

# 05 Notes & Analysis

## Watch out
- DNS changes can take up to the old TTL to spread. Lower the TTL a day before switching an existing record; for a new record this does not apply.
