if (import.meta.main) {
  const cli = await import('./cli.js');
  cli.run();
}
