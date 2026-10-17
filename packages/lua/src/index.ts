/**
 * @fileoverview Embedded Lua Scripting Bridge for Zuari.
 * Lightweight, high-velocity Lua environment with bidirectional signal synchronization.
 */

import { signal, effect, type Signal } from '@zuari/signals';
import type { LuaEnvironment } from './types.js';

export function createLuaEnvironment(): LuaEnvironment {
  const globals = new Map<string, unknown>();
  const signalBridges = new Map<string, Signal<any>>();

  function bindSignal<T>(name: string, sig: Signal<T>): void {
    signalBridges.set(name, sig);
    globals.set(name, sig.value);

    // Keep global updated when signal mutates
    effect(() => {
      globals.set(name, sig.value);
    });
  }

  function registerFunction(name: string, fn: (...args: unknown[]) => unknown): void {
    globals.set(name, fn);
  }

  function execute(script: string): unknown {
    const lines = script.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('--'));
    let lastResult: unknown = undefined;

    for (const line of lines) {
      // 1. Function calls like: alert("Hello") or pulse(5)
      const callMatch = line.match(/^([a-zA-Z0-9_]+)\((.*)\)$/);
      if (callMatch) {
        const fnName = callMatch[1];
        const rawArgs = callMatch[2] ? callMatch[2].split(',').map(a => a.trim()) : [];
        const fn = globals.get(fnName ?? '');
        if (typeof fn === 'function') {
          const parsedArgs = rawArgs.map(arg => {
            if (arg.startsWith('"') && arg.endsWith('"')) return arg.slice(1, -1);
            if (arg.startsWith("'") && arg.endsWith("'")) return arg.slice(1, -1);
            if (!isNaN(Number(arg))) return Number(arg);
            if (arg === 'true') return true;
            if (arg === 'false') return false;
            return globals.get(arg) ?? arg;
          });
          lastResult = fn(...parsedArgs);
          continue;
        }
      }

      // 2. Assignments like: health = health - 10 or score = 100
      const assignMatch = line.match(/^([a-zA-Z0-9_]+)\s*=\s*(.+)$/);
      if (assignMatch) {
        const varName = assignMatch[1];
        const rawExpr = assignMatch[2];
        if (varName && rawExpr) {
          const evaluated = evalExpression(rawExpr);
          globals.set(varName, evaluated);
          
          // If this variable is bound to a Zuari signal, mutate the signal!
          const boundSignal = signalBridges.get(varName);
          if (boundSignal) {
            boundSignal.value = evaluated;
          }
          lastResult = evaluated;
        }
        continue;
      }

      // 3. Simple expression
      lastResult = evalExpression(line);
    }

    return lastResult;
  }

  function evalExpression(expr: string): unknown {
    const clean = expr.trim();
    if (clean.startsWith('"') && clean.endsWith('"')) return clean.slice(1, -1);
    if (clean.startsWith("'") && clean.endsWith("'")) return clean.slice(1, -1);
    if (clean === 'true') return true;
    if (clean === 'false') return false;
    if (clean === 'nil') return null;

    // Math operation: e.g. health - 10 or score + 5
    const mathMatch = clean.match(/^([a-zA-Z0-9_]+)\s*([\+\-\*\/])\s*([0-9\.]+|[a-zA-Z0-9_]+)$/);
    if (mathMatch) {
      const leftVal = resolveValue(mathMatch[1] ?? '');
      const op = mathMatch[2];
      const rightVal = resolveValue(mathMatch[3] ?? '');

      if (typeof leftVal === 'number' && typeof rightVal === 'number') {
        switch (op) {
          case '+': return leftVal + rightVal;
          case '-': return leftVal - rightVal;
          case '*': return leftVal * rightVal;
          case '/': return leftVal / rightVal;
        }
      }
    }

    if (!isNaN(Number(clean))) return Number(clean);
    return globals.get(clean) ?? clean;
  }

  function resolveValue(token: string): unknown {
    if (!isNaN(Number(token))) return Number(token);
    return globals.get(token);
  }

  function evaluate<T = unknown>(expr: string): T {
    return evalExpression(expr) as T;
  }

  return {
    globals,
    bindSignal,
    registerFunction,
    execute,
    eval: evaluate
  };
}

export * from './types.js';
