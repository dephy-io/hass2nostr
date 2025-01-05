function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function unimplemented() {
  throw new Error("Not implemented");
}
