import { describe, it, expect, vi } from 'vitest';
import { signal } from '@zuari/signals';
import { createLuaEnvironment } from './index.js';

describe('@zuari/lua Scripting Bridge', () => {
  it('executes Lua script and binds bidirectional mutations with Zuari signals', () => {
    const lua = createLuaEnvironment();
    const health = signal(100);

    lua.bindSignal('health', health);
    expect(lua.globals.get('health')).toBe(100);

    // Run Lua code that damages the player
    lua.execute(`
      -- Take damage
      health = health - 25
    `);

    // Signal must reflect mutation
    expect(health.value).toBe(75);
    expect(lua.globals.get('health')).toBe(75);
  });

  it('registers host TypeScript functions and invokes them from Lua', () => {
    const lua = createLuaEnvironment();
    const triggerSpy = vi.fn();

    lua.registerFunction('triggerAbility', triggerSpy);

    lua.execute(`
      triggerAbility("teleport", 42)
    `);

    expect(triggerSpy).toHaveBeenCalledWith('teleport', 42);
  });

  it('evaluates dynamic Lua expressions', () => {
    const lua = createLuaEnvironment();
    lua.globals.set('multiplier', 3);

    const result = lua.eval<number>('multiplier * 10');
    expect(result).toBe(30);
  });
});
