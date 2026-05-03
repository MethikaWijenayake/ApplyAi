// =============================================================
// ApplyAI — Background Workers Entry Point
// =============================================================
//
// This file starts all background worker processes.
// Run with: npm run workers:start
//
// Workers are added here as each Part is built:
//   Part 4  → emailWorker     (processes inbound emails)
//   Part 5  → crawlerWorker   (discovers new job listings)
//   Part 6  → matchingWorker  (scores jobs against user profiles)
//   Part 9  → applicationWorker (submits job applications)
//
// For now this file just confirms the workers process starts.
// =============================================================

console.log('[Workers] ApplyAI background workers starting...');
console.log('[Workers] No workers registered yet — they are added in Parts 4–9.');

// Graceful shutdown handlers
// These ensure in-progress jobs complete before the process exits
process.on('SIGTERM', async () => {
  console.log('[Workers] Received SIGTERM signal. Shutting down gracefully...');
  // Worker close() calls will be added here in later parts
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[Workers] Received SIGINT signal (Ctrl+C). Shutting down gracefully...');
  // Worker close() calls will be added here in later parts
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('[Workers] Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Workers] Unhandled rejection:', reason);
  process.exit(1);
});
