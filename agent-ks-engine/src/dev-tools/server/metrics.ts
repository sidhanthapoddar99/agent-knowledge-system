/**
 * Server-side metrics collection for the "More Dev Tools" toolbar app.
 *
 * CPU% is computed as a delta between samples. A single global `prevCpu`
 * means `/metrics` polling from the toolbar drives the window; the first
 * call after startup reports CPU% over the whole process lifetime.
 *
 * Dev-only — never loaded in production builds.
 */

import os from 'os';

export interface ServerMetrics {
  memory: {
    /** Resident set size — total memory held by the process, bytes. */
    rss: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
    arrayBuffers: number;
  };
  cpu: {
    /** % of a single core used by this process since the last sample. */
    percent: number;
    user: number;
    system: number;
  };
  system: {
    loadAvg: [number, number, number];
    freeMem: number;
    totalMem: number;
    cpuCount: number;
    uptimeSec: number;
    platform: string;
    nodeVersion: string;
  };
}

let prevCpu = process.cpuUsage();
let prevHr = process.hrtime.bigint();

export function collectServerMetrics(): ServerMetrics {
  const mem = process.memoryUsage();
  const cpu = process.cpuUsage();
  const hr = process.hrtime.bigint();

  const cpuDelta = (cpu.user + cpu.system) - (prevCpu.user + prevCpu.system); // µs
  const wallNs = Number(hr - prevHr);
  const wallUs = Math.max(wallNs / 1000, 1);
  const percent = (cpuDelta / wallUs) * 100;

  prevCpu = cpu;
  prevHr = hr;

  return {
    memory: {
      rss: mem.rss,
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal,
      external: mem.external,
      arrayBuffers: mem.arrayBuffers,
    },
    cpu: {
      percent: Math.max(0, Math.min(percent, 100 * os.cpus().length)),
      user: cpu.user,
      system: cpu.system,
    },
    system: {
      loadAvg: os.loadavg() as [number, number, number],
      freeMem: os.freemem(),
      totalMem: os.totalmem(),
      cpuCount: os.cpus().length,
      uptimeSec: Math.floor(process.uptime()),
      platform: process.platform,
      nodeVersion: process.version,
    },
  };
}
