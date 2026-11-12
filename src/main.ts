import { App } from "./App";

/** Entry point: find the canvas host and boot the application. */
async function main(): Promise<void> {
  const host = document.getElementById("canvas-host");
  if (!host) {
    throw new Error("Could not find #canvas-host to mount the PIXI canvas.");
  }
  await App.bootstrap(host);
}

main().catch((error) => {
  console.error("Failed to start the application:", error);
});
