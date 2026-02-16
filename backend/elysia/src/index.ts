import cluster from 'node:cluster';
import process from 'node:process';
import os from 'node:os';

if (!cluster.isPrimary)
  import('@/server').then(() => console.log(`Worker ${process.pid} started`));

if (cluster.isPrimary)
  for (let i = 0; i < os.availableParallelism(); i++) cluster.fork();
