/**
 * @fileoverview Type definitions for the Zuari Lua Scripting Engine Bridge.
 * Enables game HUD scripting, dynamic behavior triggers, and modding.
 */

import type { Signal } from '@zuari/signals';

export type LuaValue = string | number | boolean | null | undefined | Record<string, unknown> | unknown[];

export interface LuaEnvironment {
  readonly globals: Map<string, unknown>;
  /** Register a Zuari signal as a live Lua global variable */
  bindSignal<T>(name: string, signal: Signal<T>): void;
  /** Register a host function callable from Lua scripts */
  registerFunction(name: string, fn: (...args: unknown[]) => unknown): void;
  /** Execute a Lua script string */
  execute(script: string): unknown;
  /** Evaluate a Lua expression and return the result */
  eval<T = unknown>(expr: string): T;
}
