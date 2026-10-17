import { describe, it, expect } from 'vitest';
import { createRouter, matchRoutePattern } from './index.js';

describe('@zuari/router', () => {
  it('matches parameterized route patterns cleanly', () => {
    expect(matchRoutePattern('/users/:id/posts/:postId', '/users/42/posts/99')).toEqual({
      id: '42',
      postId: '99'
    });
    expect(matchRoutePattern('/users/:id', '/settings')).toBeNull();
  });

  it('injects Speculation Rules (<script type="speculationrules">) and View Transitions Level 2 CSS, and navigates reactively', async () => {
    const router = createRouter({
      initialPath: '/',
      routes: [
        { path: '/', action: () => 'Home View' },
        { path: '/dashboard', action: () => 'Dashboard View', prerender: 'eager' },
        { path: '/users/:id', action: (params) => `User ${params.id}` }
      ]
    });

    // Verify View Transitions Level 2 @view-transition { navigation: auto; } style tag
    const vtStyle = document.getElementById('zuari-view-transition-v2');
    expect(vtStyle).not.toBeNull();
    expect(vtStyle?.textContent).toContain('@view-transition { navigation: auto; }');

    // Verify Speculation Rules <script type="speculationrules"> injection
    const specScript = document.querySelector('script[type="speculationrules"]');
    expect(specScript).not.toBeNull();
    const parsedRules = JSON.parse(specScript!.textContent!);
    expect(parsedRules.prerender[0].urls).toContain('/dashboard');

    // Navigate to parameterized route
    const match = await router.navigate('/users/777');
    expect(router.currentPath.value).toBe('/users/777');
    expect(match.params).toEqual({ id: '777' });
    expect(match.data).toBe('User 777');

    router.destroy();
  });
});
