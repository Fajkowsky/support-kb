<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { groupByCause, uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  // One row per problem in a ticket, each counted once: the causes causes.ts finds, minus the reports
  // the desk read as a one-day move (desk-notes.json), which are a problem of their own.
  // `tickets`: problem → the issue in the GitHub `repo` that tracks it, and where that issue stands.
  type Tracked = { issue: number; state: string };
  let { ticket, repo, tickets = {} }: { ticket: number; repo: string; tickets?: Record<string, Tracked> } = $props();

  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const isOneDayMove = (r: Report) => notes.oneDayMove.includes(r.id);
  const problems = $derived([
    ...groupByCause(merged.filter((r) => !isOneDayMove(r)), tenantOf),
    // A one-day move is one problem whatever the tenant, so these skip the tenant lookup and land in one group.
    ...groupByCause(merged.filter(isOneDayMove), () => undefined).map((g) => ({ ...g, cause: 'one-day move' })),
  ]);
</script>

<p class="sum">
  <strong>{reports.length}</strong> rows in the export ·
  <strong>{merged.length}</strong> reports merged into #{ticket} ·
  <strong>{problems.length}</strong> problems
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th><th>state</th></tr>
  </thead>
  <tbody>
    {#each problems as p (p.cause)}
      <tr>
        <td><code>{p.cause}</code></td>
        <td>{p.reports.length}</td>
        <td>{p.tenants}</td>
        <td>{p.firstSeen} → {p.lastSeen}</td>
        {#if tickets[p.cause]}
          <td><a href="https://github.com/{repo}/issues/{tickets[p.cause].issue}">{repo}#{tickets[p.cause].issue}</a></td>
          <td class:open={tickets[p.cause].state === 'open'}>{tickets[p.cause].state}</td>
        {:else}
          <td>none yet</td>
          <td class="open">open</td>
        {/if}
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .open { color: var(--warn); font-weight: 600; }
</style>
