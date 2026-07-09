/**
 * Custom exports for the Apollo SDK.
 *
 * This file is in .fernignore and won't be overwritten by Fern generation.
 * Add any additional package-root exports here. Imported by index.ts via
 * `export * from "./exports.js"`.
 */

export * from "./core/exports.js";

// The generated session resource doesn't re-export its socket class, so consumers
// couldn't name the type returned by `client.connect()`. Surface it at the package root.
export { SessionSocket } from "./api/resources/session/client/Socket.js";
