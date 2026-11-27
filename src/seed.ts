/**
 * Default board baked in at build time.
 * Used only when this browser has no existing `tasks-app:data:v1` in localStorage,
 * so people who already created their own board are left alone.
 *
 * Proof image URLs are rooted at import.meta.env.BASE_URL so they work both at
 * `/task/` (sameer.cloud) and `/sameer-cloud-taskmanager/` (GitHub Pages).
 */
import type { AppData, Label, Priority, Status, Task, TaskAttachment } from './types'

const now = (iso: string) => iso
const P = (file: string) => `${import.meta.env.BASE_URL}proof/${file}`

const LABELS: Label[] = [
  { id: 'lbl-audit', name: 'Audit', color: '#6366f1' },
  { id: 'lbl-research', name: 'Research', color: '#0ea5e9' },
  { id: 'lbl-design', name: 'Design', color: '#a855f7' },
  { id: 'lbl-platform', name: 'Platform', color: '#14b8a6' },
  { id: 'lbl-apps', name: 'Apps', color: '#f97316' },
  { id: 'lbl-deploy', name: 'Deploy', color: '#22c55e' },
  { id: 'lbl-blocked', name: 'Blocked', color: '#ef4444' },
]

function img(id: string, file: string, caption: string): TaskAttachment {
  return { id, url: P(file), caption, kind: 'image' }
}
function link(id: string, url: string, caption: string): TaskAttachment {
  return { id, url, caption, kind: 'link' }
}

let orderByStatus: Record<Status, number> = { backlog: 0, todo: 0, in_progress: 0, done: 0 }

function task(opts: {
  id: string
  title: string
  description: string
  status: Status
  priority?: Priority
  labels: string[]
  createdAt: string
  updatedAt?: string
  completedAt?: string | null
  dueDate?: string | null
  attachments?: TaskAttachment[]
}): Task {
  const order = orderByStatus[opts.status]++
  return {
    id: opts.id,
    title: opts.title,
    description: opts.description,
    status: opts.status,
    priority: opts.priority ?? 'medium',
    dueDate: opts.dueDate ?? null,
    labelIds: opts.labels,
    order,
    createdAt: opts.createdAt,
    updatedAt: opts.updatedAt ?? opts.completedAt ?? opts.createdAt,
    completedAt: opts.status === 'done' ? (opts.completedAt ?? opts.updatedAt ?? opts.createdAt) : null,
    attachments: opts.attachments ?? [],
  }
}

export function defaultBoard(): AppData {
  orderByStatus = { backlog: 0, todo: 0, in_progress: 0, done: 0 }
  const tasks: Task[] = [
    // —— COMPLETED (Done) ——
    task({
      id: 't-platform-audit',
      title: 'Deep codebase audit of cold email platform',
      description: 'Read-only audit of the live panel code. Honest verdict: well under a third of the vision is actually built. DNS, registrar connect, domain monitoring, mailbox connect and a low-ceiling sending engine are real; warmup is a stub; domain buying, wallet, reseller, public API and VPS are missing.',
      status: 'done', priority: 'high', labels: ['lbl-audit', 'lbl-platform'],
      createdAt: now('2026-11-27T16:00:00.000Z'), completedAt: now('2026-11-27T17:15:00.000Z'),
      attachments: [img('a-platform-audit', 'platform-audit.png', 'First page of the deep codebase audit (27 Nov 2026). Source: /workspace/design-specs/platform-audit.md')],
    }),
    task({
      id: 't-vps-spec',
      title: 'VPS provisioning research spec (Hetzner/Contabo)',
      description: 'Research-only. Primary: Hetzner Cloud, fallback: Contabo. No wholesale reseller program — provision under our account and bill from the prepaid wallet. Lifecycle, pricing, abuse risk and a minimal v1 scope are in the spec.',
      status: 'done', priority: 'medium', labels: ['lbl-research', 'lbl-design'],
      createdAt: now('2026-11-27T16:30:00.000Z'), completedAt: now('2026-11-27T17:20:00.000Z'),
      attachments: [img('a-vps-spec', 'vps-spec.png', 'First page of the VPS provisioning research spec. Source: /workspace/docs/vps-provisioning-reseller-spec.md')],
    }),
    task({
      id: 't-ui-redesign-spec',
      title: 'Cold email UI redesign spec (Slicey benchmark)',
      description: 'Full UI redesign spec benchmarking against Slicey: red primary, typography, layout, and screen-by-screen direction. Used as the brief for UI Batch A.',
      status: 'done', priority: 'high', labels: ['lbl-design', 'lbl-platform'],
      createdAt: now('2026-11-26T18:00:00.000Z'), completedAt: now('2026-11-27T17:02:00.000Z'),
      attachments: [img('a-ui-redesign-spec', 'ui-redesign-spec.png', 'First page of the Slicey-benchmarked UI redesign spec. Source: /workspace/design-specs/cold-email-panel-redesign-spec.md')],
    }),
    task({
      id: 't-ui-batch-a',
      title: 'UI Batch A global reskin — built, paste-ready',
      description: 'Global repaint to the red-primary design system (74 files). Lint and build pass, every teal class removed. Not published — waiting for go before Base44 pastes it. Built on a fresh live-code snapshot so existing patches are not reverted.',
      status: 'done', priority: 'high', labels: ['lbl-design', 'lbl-platform'],
      createdAt: now('2026-11-27T15:00:00.000Z'), completedAt: now('2026-11-27T17:14:00.000Z'),
      attachments: [img('a-ui-batch-a', 'ui-batch-a.png', 'UI Batch A patch README (paste-ready, not published). Source: /home/box/shared/cold-email-panel-patches/ui-batch-a/README.md')],
    }),
    task({
      id: 't-reseller-spec',
      title: 'Reseller dashboard + signup design spec',
      description: 'Design spec for two-tier tenancy, signup + approval, reseller dashboard, white-label, and pricing models. Full write-up was posted in chat; a short on-disk brief is attached.',
      status: 'done', priority: 'medium', labels: ['lbl-design', 'lbl-platform'],
      createdAt: now('2026-11-27T16:40:00.000Z'), completedAt: now('2026-11-27T17:08:00.000Z'),
      attachments: [img('a-reseller-spec', 'reseller-spec.png', 'On-disk brief for the reseller program design spec. Source: /workspace/design-specs/reseller-program-spec.md')],
    }),
    task({
      id: 't-public-api-spec',
      title: 'Public API + integrations design spec',
      description: 'Design spec for a public REST API (/v1, API-key auth, scopes, webhooks) and HubSpot/Salesforce/Sheets/Zapier/Make integrations. Full write-up was posted in chat; a short on-disk brief is attached.',
      status: 'done', priority: 'medium', labels: ['lbl-design', 'lbl-platform'],
      createdAt: now('2026-11-27T16:45:00.000Z'), completedAt: now('2026-11-27T17:08:00.000Z'),
      attachments: [img('a-public-api-spec', 'public-api-spec.png', 'On-disk brief for the public API + integrations design spec. Source: /workspace/design-specs/public-api-integrations-spec.md')],
    }),
    task({
      id: 't-multi-registrar-spec',
      title: 'Multi-registrar domain connect design spec',
      description: 'Read-only aggregator design: connect GoDaddy, Porkbun, Namecheap, Cloudflare and others, pull domains into one view. Hard read-only constraints and per-registrar capability matrix. Full write-up was posted in chat.',
      status: 'done', priority: 'medium', labels: ['lbl-design', 'lbl-platform'],
      createdAt: now('2026-11-27T16:50:00.000Z'), completedAt: now('2026-11-27T17:10:00.000Z'),
      attachments: [img('a-multi-registrar-spec', 'multi-registrar-spec.png', 'On-disk brief for the multi-registrar connect design spec. Source: /workspace/design-specs/multi-registrar-connect-spec.md')],
    }),
    task({
      id: 't-wallet-spec',
      title: 'Domain marketplace wallet + billing design spec',
      description: 'Wallet and billing design for the domain marketplace (Porkbun reseller backend). Full write-up was posted in chat; a short on-disk brief is attached.',
      status: 'done', priority: 'medium', labels: ['lbl-design', 'lbl-platform'],
      createdAt: now('2026-11-27T16:20:00.000Z'), completedAt: now('2026-11-27T17:03:00.000Z'),
      attachments: [img('a-wallet-spec', 'wallet-billing-spec.png', 'On-disk brief for the wallet + billing design spec. Source: /workspace/domain-marketplace-specs/wallet-billing-spec.md')],
    }),
    task({
      id: 't-domain-reseller-apis',
      title: 'Domain reseller APIs research',
      description: 'Research into registrar reseller/partner APIs for selling domains through the platform. Findings were posted in chat on 27 Nov 2026.',
      status: 'done', priority: 'medium', labels: ['lbl-research'],
      createdAt: now('2026-11-26T16:00:00.000Z'), completedAt: now('2026-11-27T15:00:00.000Z'),
      attachments: [link('a-domain-reseller-apis', 'https://github.com/samayhuf-star/sameer-cloud-taskmanager', 'proof: delivered in chat on 27 Nov 2026; no standalone capturable file found on disk')],
    }),
    task({
      id: 't-warmup-audit',
      title: 'Warmup implementation audit',
      description: 'Confirmed warmup is a stub: a manual ring-ping between your own inboxes, flat 20/day cap, no ramp, no scoring, no cron, no campaign gate. Evidence is section 6 of the deep codebase audit.',
      status: 'done', priority: 'high', labels: ['lbl-audit', 'lbl-platform'],
      createdAt: now('2026-11-27T16:10:00.000Z'), completedAt: now('2026-11-27T17:15:00.000Z'),
      attachments: [img('a-warmup-audit', 'warmup-audit.png', 'Section 6 of the deep codebase audit — warmup confirmed as a stub. Source: /workspace/design-specs/platform-audit.md')],
    }),
    task({
      id: 't-slicey-parity',
      title: 'Slicey feature-parity gap report',
      description: 'Verified against the audit, ranked by impact: open/click tracking missing, warmup is a stub, sending ceiling + HTML thin, OAuth reply/bounce broken, master inbox read-only, A/B testing missing, domain swap on burn missing, per-tenant suppression leaks. DNS handling is already at parity.',
      status: 'done', priority: 'high', labels: ['lbl-audit', 'lbl-research'],
      createdAt: now('2026-11-27T16:50:00.000Z'), completedAt: now('2026-11-27T17:25:00.000Z'),
      attachments: [link('a-slicey-parity', 'https://github.com/samayhuf-star/sameer-cloud-taskmanager', 'proof: posted in chat on 27 Nov 2026; no standalone capturable file found on disk')],
    }),
    task({
      id: 't-taskmanager-built',
      title: 'Open-source task manager — built + MIT GitHub repo + live demo',
      description: 'Vite + React + TS + Tailwind SPA (kanban, list, due dates, priorities, labels, simple auth). MIT licensed at github.com/samayhuf-star/sameer-cloud-taskmanager. Public demo on GitHub Pages. sameer.cloud/task was not yet live when this card was filed.',
      status: 'done', priority: 'medium', labels: ['lbl-deploy'],
      createdAt: now('2026-11-27T16:45:00.000Z'), completedAt: now('2026-11-27T16:47:00.000Z'),
      attachments: [
        img('a-tm-github', 'taskmanager-github.png', 'Public GitHub repo: github.com/samayhuf-star/sameer-cloud-taskmanager'),
        img('a-tm-license', 'taskmanager-license.png', 'MIT License from the repo LICENSE file (the GitHub license page returned an error at capture time)'),
        img('a-tm-demo', 'taskmanager-demo.png', 'Live GitHub Pages demo at samayhuf-star.github.io/sameer-cloud-taskmanager/ (first visit shows the password gate)'),
        img('a-tm-board', 'taskmanager-board.png', 'Seeded board after first-run password setup: 17 Done, 8 In progress, 8 To do. Completed cards show proof thumbnails; pending cards do not.'),
        img('a-tm-task-proof', 'taskmanager-task-proof.png', 'Task modal showing a proof-of-completion screenshot and caption on a completed card.'),
      ],
    }),
    task({
      id: 't-marketing-homepage',
      title: 'samay.cloud marketing homepage',
      description: 'Marketing homepage (public /, /privacy, /terms, dashboard moved to /dashboard) was built as a paste-ready patch. It is not published live yet: https://samay.cloud/ currently shows the app sign-in, and /privacy, /terms and /dashboard return 404.',
      status: 'done', priority: 'medium', labels: ['lbl-deploy', 'lbl-platform'],
      createdAt: now('2026-11-26T18:00:00.000Z'), completedAt: now('2026-11-27T16:03:00.000Z'),
      attachments: [
        img('a-marketing', 'samay-cloud-marketing.png', 'First viewport of the marketing homepage preview (27 Nov 2026). Source: /home/box/shared/cold-email-panel-patches/marketing-homepage/preview/home-desktop.png. Not published live yet.'),
        img('a-marketing-live', 'samay-cloud-app.png', 'What is live today at https://samay.cloud/: the Cold Email Panel sign-in (marketing routes /privacy /terms /dashboard return 404).'),
      ],
    }),
    task({
      id: 't-app-status-report',
      title: 'App status report (all apps)',
      description: 'Written rundown posted in chat on 27 Nov 2026 (~10:22 PM Asia/Dhaka): VM health plus iOS/App Store Connect + EAS state across the apps, pulled live at that moment. Not a hosted page.',
      status: 'done', priority: 'medium', labels: ['lbl-apps', 'lbl-audit'],
      createdAt: now('2026-11-27T16:20:00.000Z'), completedAt: now('2026-11-27T16:22:00.000Z'),
      attachments: [link('a-app-status-report', 'https://samay.cloud/', 'proof: posted in chat 27 Nov 2026 ~10:22 PM Asia/Dhaka; no standalone capturable file (the update was a chat message, not a hosted page)')],
    }),
    task({
      id: 't-app-monitor-investigation',
      title: 'App monitoring panel investigation (no hosted panel found)',
      description: 'Honest finding: there is no separately built, hosted app monitoring panel and no live URL. App monitoring exists as status files and reports under /home/box/shared/app-monitor/, maintained by the monitoring bot — not a deployed dashboard.',
      status: 'done', priority: 'medium', labels: ['lbl-apps', 'lbl-audit'],
      createdAt: now('2026-11-27T16:00:00.000Z'), completedAt: now('2026-11-27T16:30:00.000Z'),
      attachments: [link('a-app-monitor-inv', 'https://github.com/samayhuf-star/sameer-cloud-taskmanager', 'proof: no hosted panel found; data lives at /home/box/shared/app-monitor/ (status.json + reports), not a deployed URL')],
    }),
    task({
      id: 't-app-status-page-investigation',
      title: 'App status page investigation (no hosted URL found)',
      description: 'The “App status” update was a chat message, not a deployed web page. Checked deploy configs, env files, chat history and prior work — nothing was ever deployed as a status dashboard. No Vercel/Netlify/custom-domain link exists.',
      status: 'done', priority: 'medium', labels: ['lbl-apps', 'lbl-audit'],
      createdAt: now('2026-11-27T16:30:00.000Z'), completedAt: now('2026-11-27T16:40:00.000Z'),
      attachments: [link('a-app-status-page-inv', 'https://github.com/samayhuf-star/sameer-cloud-taskmanager', 'proof: no hosted URL found; the 27 Nov “App status” update was a chat message, not a deployed page')],
    }),
    task({
      id: 't-audit-verifications',
      title: 'Deep audit answered: reseller/API/domain-buy/DNS verification',
      description: 'File-by-file verdict from the deep audit: reseller panel = missing (UI placeholder, no tenancy); public API = missing (spec-only; /api routes are admin cron hooks); domain buying = missing; domain managing = real (monitoring + DNS); DNS = real with live registrar write APIs.',
      status: 'done', priority: 'high', labels: ['lbl-audit', 'lbl-platform'],
      createdAt: now('2026-11-27T16:00:00.000Z'), completedAt: now('2026-11-27T17:15:00.000Z'),
      attachments: [img('a-audit-verifications', 'audit-verifications.png', 'Audit summary table: reseller, public API, domain buying, DNS. Source: /workspace/design-specs/platform-audit.md')],
    }),

    // —— PENDING ——
    task({
      id: 't-porkbun',
      title: 'Porkbun signup + API keys',
      description: 'IN PROGRESS — blocked on sign-in. No signed-in Porkbun session, no API keys stored, no saved login. Public pricing API works; availability search needs a key. Do not fund or spend without explicit go-ahead.',
      status: 'in_progress', priority: 'high', labels: ['lbl-blocked', 'lbl-platform'],
      createdAt: now('2026-11-27T15:00:00.000Z'), updatedAt: now('2026-11-27T17:20:00.000Z'),
    }),
    task({
      id: 't-namecheap-reseller',
      title: 'Namecheap reseller signup',
      description: 'Awaiting registrar decision (Porkbun vs Namecheap) before signing up as a reseller.',
      status: 'todo', priority: 'medium', labels: ['lbl-blocked', 'lbl-platform'],
      createdAt: now('2026-11-26T18:00:00.000Z'),
    }),
    task({
      id: 't-competitor-matrix',
      title: 'Competitor comparison matrix + inbox economics',
      description: 'IN PROGRESS. Side-by-side of our platform vs Slicey, Apollo, Instantly, Smartlead, Woodpecker, Lemlist, using verified audit labels. Draft notes exist at /workspace/research/competitor-and-inbox-economics.md.',
      status: 'in_progress', priority: 'high', labels: ['lbl-research'],
      createdAt: now('2026-11-27T16:30:00.000Z'), updatedAt: now('2026-11-27T17:25:00.000Z'),
    }),
    task({
      id: 't-inbox-economics',
      title: 'Google Workspace / M365 inbox economics research',
      description: 'IN PROGRESS. How platforms sell inboxes at $2–2.50 when a Workspace seat is $6–7/month: trials, promo/edu pricing, partner wholesale, M365 Business Basic, loss-leader, margins, and whether we can replicate it.',
      status: 'in_progress', priority: 'high', labels: ['lbl-research'],
      createdAt: now('2026-11-27T16:30:00.000Z'), updatedAt: now('2026-11-27T17:25:00.000Z'),
    }),
    task({
      id: 't-feature-pdf',
      title: 'Comprehensive feature PDF',
      description: 'IN PROGRESS. Every platform feature, flowcharts, and honest built/stub/missing marks from the audit, as a single PDF.',
      status: 'in_progress', priority: 'medium', labels: ['lbl-design', 'lbl-platform'],
      createdAt: now('2026-11-27T17:00:00.000Z'),
    }),
    task({
      id: 't-app-readiness',
      title: 'App readiness audit: onboarding / paywall / plans / OneSignal / RevenueCat',
      description: 'IN PROGRESS. Per-app check of the ready-for-submission iOS/Android apps for 8–10 onboarding screens, a paywall, all four plans (weekly/monthly/annually/lifetime), OneSignal, and RevenueCat, with file-name proof. Do not submit to stores.',
      status: 'in_progress', priority: 'high', labels: ['lbl-apps', 'lbl-audit'],
      createdAt: now('2026-11-27T17:20:00.000Z'),
    }),
    task({
      id: 't-aso-audit',
      title: 'ASO audit + improvement plan for ready apps',
      description: 'IN PROGRESS. Current App Store / Play Store listings, why apps may get no impressions, high-volume keywords, and a per-app metadata plan. Do not submit to stores.',
      status: 'in_progress', priority: 'high', labels: ['lbl-apps', 'lbl-research'],
      createdAt: now('2026-11-27T17:20:00.000Z'),
    }),
    task({
      id: 't-mobile-first',
      title: 'Mobile-first platform redesign spec + patch',
      description: 'IN PROGRESS. Mobile-first audit and paste-ready patch for the cold email platform (sameer.cloud / the panel). Keep the red design system and stay compatible with a future native app. Nothing goes live without go-ahead.',
      status: 'in_progress', priority: 'high', labels: ['lbl-design', 'lbl-platform'],
      createdAt: now('2026-11-27T17:20:00.000Z'),
    }),
    task({
      id: 't-deploy-sameer-task',
      title: 'Task manager deploy to sameer.cloud/task',
      description: 'Deploy this app at https://sameer.cloud/task with the Nov 26–27 board pre-loaded. sameer.cloud currently points at a Hostinger VPS (76.13.33.231, srv1653819.hstgr.cloud) that returns HTTP 502 and a self-signed TLS catchall.',
      status: 'in_progress', priority: 'urgent', labels: ['lbl-deploy', 'lbl-blocked'],
      createdAt: now('2026-11-27T17:20:00.000Z'),
    }),
    task({
      id: 't-mailbox-import',
      title: 'Mailbox import into platform',
      description: 'Paused on Samay’s computer (offline). Bulk mailbox import patch exists but cannot be finished from the box alone.',
      status: 'todo', priority: 'medium', labels: ['lbl-blocked', 'lbl-platform'],
      createdAt: now('2026-11-26T18:00:00.000Z'),
    }),
    task({
      id: 't-ui-batch-a-publish',
      title: 'UI Batch A publish',
      description: 'Awaiting go. Patch is paste-ready at /home/box/shared/cold-email-panel-patches/ui-batch-a/. Do not publish until explicitly approved.',
      status: 'todo', priority: 'high', labels: ['lbl-blocked', 'lbl-design'],
      createdAt: now('2026-11-27T17:14:00.000Z'),
    }),
    task({
      id: 't-build-decisions',
      title: 'Build decisions awaiting go: wallet, reseller, public API, multi-registrar, VPS',
      description: 'Specs are done; implementation is greenfield and must not start until you say go. Covers wallet/billing, reseller/tenancy, public API, multi-registrar aggregator, and VPS provisioning.',
      status: 'todo', priority: 'high', labels: ['lbl-blocked', 'lbl-platform'],
      createdAt: now('2026-11-27T17:10:00.000Z'),
    }),
    task({
      id: 't-domain-bulk-search',
      title: 'Domain bulk search feature',
      description: 'Not built, per the audit. No availability or pricing search on any TLD. (The “bulk domain add” patch only adds names you already own to monitoring.)',
      status: 'todo', priority: 'medium', labels: ['lbl-platform'],
      createdAt: now('2026-11-27T17:15:00.000Z'),
    }),
    task({
      id: 't-card-verification',
      title: 'Card verification',
      description: 'Visa is saved in the vault. Verification / charging still needs an explicit go-ahead. Do not spend.',
      status: 'todo', priority: 'medium', labels: ['lbl-blocked'],
      createdAt: now('2026-11-26T18:00:00.000Z'),
    }),
    task({
      id: 't-dashboard-redesign-spec',
      title: 'Dashboard redesign spec',
      description: 'A dedicated dashboard redesign spec, separate from the global UI Batch A reskin and the mobile-first work.',
      status: 'todo', priority: 'medium', labels: ['lbl-design'],
      createdAt: now('2026-11-27T17:00:00.000Z'),
    }),
    task({
      id: 't-registrar-auth',
      title: 'Registrar auth system',
      description: 'Authentication / connection system for registrars beyond the existing API-key connect for four providers. Related to the multi-registrar design spec.',
      status: 'todo', priority: 'medium', labels: ['lbl-platform'],
      createdAt: now('2026-11-27T17:00:00.000Z'),
    }),
  ]

  return { version: 1, labels: LABELS, tasks }
}
