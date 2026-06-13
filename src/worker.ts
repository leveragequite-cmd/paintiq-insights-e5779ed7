if (typeof (globalThis as any).process === "undefined") {
  ;(globalThis as any).process = { env: {} };
}

const module = await import("./server");
export default module.default;
