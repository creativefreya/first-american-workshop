# Cursor's connection options — MCP vs API vs CLI vs the rest

Facilitator reference. Researched from Cursor's own docs, August 2026. The room
will ask "why this one and not that one", and the honest answer is that they do
different jobs — it is not a ranking.

---

## The six mechanisms

| | What it is | Reach for it when |
|---|---|---|
| **Native integration** | Cursor connects the service itself, from the Integrations dashboard. GitHub, GitLab, Bitbucket, Azure DevOps, Slack, Jira, Linear, Teams, Notion. | The service is on Cursor's list. Nothing to install, nothing to configure. |
| **MCP server** | A connector speaking the Model Context Protocol. Installed one-click from the Cursor Marketplace with OAuth, or by hand in `.cursor/mcp.json`. | You want the agent to **read and write a tool as context** during a chat. This is the workshop's default answer. |
| **CLI** | `cursor-agent` in the terminal. Interactive, or non-interactive for scripts and CI. Agent / Plan / Ask modes, same as the editor. | The work has no business being in a GUI — pipelines, batch jobs, a hundred files. |
| **Cursor API** | Cursor's own REST API: Admin, Analytics, AI Code Tracking, Bugbot, Cloud Agents, Origin. SDKs in TypeScript and Python. | You are building **around** Cursor — dashboards, compliance reporting, triggering agents from your own systems. |
| **Hooks** | Scripts on the agent loop, talking JSON over stdio. Fire on `beforeShellExecution`, `beforeMCPExecution`, `beforeReadFile`, `afterFileEdit`, `preToolUse`, session start/stop. | You need to **police** the agent — audit it, block a command, redact a secret before it reaches the model, force a formatter. |
| **Plugins** | A bundle. Packages rules, skills, agents, commands, MCP servers and hooks into one installable thing. | You want a whole team on the same setup without nine separate instructions. |

Rules and skills sit alongside these but connect nothing — they are context and
instruction, not plumbing.

---

## The distinction that actually matters

**A native integration and an MCP for the same tool are not the same feature.**
This trips people up, so it is worth being precise in the room.

Cursor's **native Slack integration** lets you mention `@cursor` in a Slack thread
and have a Cloud Agent go and do the work, then report back with a PR. It reads
the thread to understand the task. It is a way of *starting work from Slack*.

A **Slack MCP** lets the agent search Slack and post to it *as a tool, mid-chat* —
"find me the thread where we decided the onboarding cut-off" — while you are
working on something else.

Same tool, opposite directions. The native one brings work **into** Cursor. The
MCP brings Slack **into the conversation**.

Cursor's **native Jira integration** is the same shape: assign an issue to Cursor
or `@Cursor` it, and a Cloud Agent picks it up and opens a PR. It reads the
issue's title, description and comments. It does not give you Jira as a
searchable context source, and it does not touch Confluence at all.

The **Atlassian MCP** does: one OAuth connection, 70-odd tools across Jira,
Confluence, Compass, Bitbucket and JSM, respecting the permissions the user
already has. That is why the Day 1 activities use the MCP and not the native
integration — the workshop is about pulling context into the product brain, not
about delegating tickets.

---

## Why MCP is the right default for this workshop

1. **No code, no engineer.** Customise → search → authenticate. Two minutes, and
   the room can all do it at once without anyone touching a config file.
2. **Once per machine, not once per chat.** The point of the product brain is
   that context accumulates. A connection that has to be re-made every session
   defeats it.
3. **It respects existing permissions.** The Atlassian server proxies the user's
   own access — nobody sees anything they could not already see. That is the
   answer when someone's security instinct fires.
4. **It is the same protocol everywhere.** Learn it in Cursor, and it transfers
   to whatever tool the company standardises on next.

## When an API is the honest answer

When no MCP exists, or the one that exists is not available to you yet. Then
somebody writes the calls — the participant with Cursor's help, or an engineer.
More setup, more control, and no way around it.

Note the wording trap: **"the API" means two different things.** In the booklet it
means *the service's* API (Microsoft Graph, for SharePoint). Cursor also has its
own API, which is for building around Cursor — admin, analytics, cloud agents.
Different thing. Say "the Microsoft Graph API" rather than "the API" if there is
any chance of confusion.

## When the CLI is the honest answer

Rarely, on Day 1. The CLI earns its place when the work is repetitive and
scriptable — run the same agent task across forty files, wire a review step into
CI, hand a long-running job off to a cloud agent. It is a Day 2 idea at best, and
mostly a "this exists, come find me" idea.

---

## Tool by tool, for First American's approved stack

| Tool | Route | Notes |
|---|---|---|
| Jira | MCP (Atlassian) | GA since Feb 2026. OAuth 2.1, cloud-only. Also has a native Cursor integration for delegating issues — different job. |
| Confluence | MCP (Atlassian) | Same connection as Jira. No native Cursor integration. |
| Slack | MCP | Native Cursor integration exists but is for triggering agents, not reading threads as context. |
| Miro | MCP | |
| Figma | MCP | |
| FigJam | MCP | Same Figma connection. |
| GitHub | **Native** | Connect from the Integrations dashboard. Powers Cloud Agents and Bugbot. No MCP needed — do not send people looking for one. |
| SharePoint | MCP, preview | Microsoft's Work IQ server. Needs an M365 Copilot licence and an Entra app registration with admin consent. Microsoft Graph API until then. |
| Microsoft Teams | MCP, preview | Same server, same licence, same approval. |

**The IT conversation is the real blocker for the Microsoft two.** Not the
technology — the Entra app registration and admin consent. Anyone who wants
SharePoint or Teams connected should start that conversation the week of the
workshop, not the day they need it.

---

## Security lines worth having ready

- MCP servers execute code and reach external services on your behalf. Cursor's
  own docs say to verify the source, review permissions, and use restricted API
  keys. Treat an unknown MCP like an unknown npm package.
- Enterprise has allowlisting and network restrictions if First American's
  security team asks. Worth mentioning that it exists rather than pretending the
  question does not come up.
- Hooks are the tool for anyone who wants a hard guarantee — `beforeMCPExecution`
  can block a call outright, and `beforeReadFile` can redact before anything
  reaches the model.

---

## Sources

- [Cursor — MCP](https://cursor.com/docs/mcp)
- [Cursor — GitHub integration](https://cursor.com/docs/integrations/github)
- [Cursor — Slack integration](https://cursor.com/docs/integrations/slack)
- [Cursor — Jira integration](https://cursor.com/docs/integrations/jira)
- [Cursor — CLI overview](https://cursor.com/docs/cli/overview)
- [Cursor — API](https://cursor.com/docs/api)
- [Cursor — Hooks](https://cursor.com/docs/hooks)
- [Cursor — Plugins](https://cursor.com/docs/plugins)
- [Atlassian — official remote MCP server](https://github.com/atlassian/atlassian-mcp-server)
- [Microsoft Learn — Work IQ MCP overview (preview)](https://learn.microsoft.com/en-us/microsoft-agent-365/tooling-servers-overview)
