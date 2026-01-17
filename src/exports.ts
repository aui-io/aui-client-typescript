/**
 * Custom exports for the Apollo SDK
 * 
 * This file is in .fernignore and won't be overwritten by Fern generation.
 * Add any custom exports here that need to be available at the package root.
 */

// Direct export of WebSocket Socket class for TypeScript users
// This allows: import { ApolloWsSessionSocket } from '@aui.io/aui-client'
export { ApolloWsSessionSocket } from "./api/resources/apolloWsSession/client/Socket.js";
