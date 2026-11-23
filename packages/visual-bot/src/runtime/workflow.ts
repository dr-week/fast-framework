/**
 * @fileoverview Deterministic Rule & Workflow Engine with Step Checkpointing & Retry.
 * Supports conditional branching (matched / unmatched), step-by-step checkpointing,
 * and idempotent retry resuming from the exact failed action index.
 */

import { signal, type Signal } from '@zuari/signals';

export type WorkflowRunStatus = 'running' | 'succeeded' | 'failed' | 'skipped';

export interface WorkflowAction<TParams = Record<string, unknown>> {
  type: string;
  params?: TParams;
}

export interface WorkflowRule<TInput = Record<string, unknown>> {
  id: string;
  condition?: (input: TInput) => boolean;
  actions: WorkflowAction[];
  elseActions?: WorkflowAction[];
}

export interface WorkflowActionResult {
  branch: 'matched' | 'unmatched';
  index: number;
  type: string;
  output: unknown;
}

export interface WorkflowRunRecord<TInput = Record<string, unknown>> {
  id: string;
  ruleId: string;
  triggerId: string;
  status: WorkflowRunStatus;
  input: TInput;
  actionResults: WorkflowActionResult[];
  error: string | null;
  startedAt: string;
  completedAt: string | null;
}

export interface WorkflowActionContext<TInput = Record<string, unknown>> {
  ruleId: string;
  triggerId: string;
  actionIndex: number;
  input: TInput;
}

export type WorkflowActionExecutor<TInput = Record<string, unknown>> = (
  action: WorkflowAction,
  ctx: WorkflowActionContext<TInput>
) => unknown | Promise<unknown>;

export interface WorkflowEngine<TInput = Record<string, unknown>> {
  runs: Signal<WorkflowRunRecord<TInput>[]>;
  run: (rule: WorkflowRule<TInput>, input: TInput, triggerId?: string) => Promise<WorkflowRunRecord<TInput>>;
  retry: (runId: string, rule: WorkflowRule<TInput>) => Promise<WorkflowRunRecord<TInput>>;
  getRun: (runId: string) => WorkflowRunRecord<TInput> | undefined;
}

export function createWorkflowEngine<TInput = Record<string, unknown>>(
  executeAction: WorkflowActionExecutor<TInput>,
  options: { now?: () => Date; maxHistory?: number } = {}
): WorkflowEngine<TInput> {
  const now = options.now ?? (() => new Date());
  const maxHistory = options.maxHistory ?? 100;
  const runs = signal<WorkflowRunRecord<TInput>[]>([]);
  let seq = 0;

  function upsert(record: WorkflowRunRecord<TInput>): WorkflowRunRecord<TInput> {
    const idx = runs.value.findIndex((r) => r.id === record.id);
    if (idx >= 0) {
      const next = runs.value.slice();
      next[idx] = record;
      runs.value = next;
    } else {
      runs.value = [...runs.value.slice(-(maxHistory - 1)), record];
    }
    return record;
  }

  async function execute(
    rule: WorkflowRule<TInput>,
    input: TInput,
    triggerId: string,
    existing?: WorkflowRunRecord<TInput>
  ): Promise<WorkflowRunRecord<TInput>> {
    const startedAt = now().toISOString();
    const actionResults = existing ? existing.actionResults.slice() : [];
    const base: WorkflowRunRecord<TInput> = existing
      ? { ...existing, status: 'running', actionResults, error: null, startedAt, completedAt: null }
      : {
          id: `run_${Date.now().toString(36)}_${++seq}`,
          ruleId: rule.id,
          triggerId,
          status: 'running',
          input,
          actionResults,
          error: null,
          startedAt,
          completedAt: null,
        };
    upsert(base);

    const matched = rule.condition ? Boolean(rule.condition(input)) : true;
    const branch = matched ? 'matched' : 'unmatched';
    const actions = matched ? rule.actions : (rule.elseActions ?? []);

    if (actions.length === 0) {
      return upsert({ ...base, status: 'skipped', completedAt: now().toISOString() });
    }

    try {
      const completed = actionResults.filter((r) => r.branch === branch).length;
      for (let i = completed; i < actions.length; i++) {
        const action = actions[i];
        if (!action) continue;
        const output = await executeAction(action, {
          ruleId: rule.id,
          triggerId,
          actionIndex: i,
          input,
        });
        actionResults.push({ branch, index: i, type: action.type, output });
        upsert({ ...base, status: 'running', actionResults: actionResults.slice() });
      }
      return upsert({
        ...base,
        status: 'succeeded',
        actionResults: actionResults.slice(),
        completedAt: now().toISOString(),
      });
    } catch (err) {
      return upsert({
        ...base,
        status: 'failed',
        actionResults: actionResults.slice(),
        error: err instanceof Error ? err.message : String(err),
        completedAt: now().toISOString(),
      });
    }
  }

  function run(
    rule: WorkflowRule<TInput>,
    input: TInput,
    triggerId = 'manual'
  ): Promise<WorkflowRunRecord<TInput>> {
    return execute(rule, input, triggerId);
  }

  function retry(runId: string, rule: WorkflowRule<TInput>): Promise<WorkflowRunRecord<TInput>> {
    const existing = runs.value.find((r) => r.id === runId);
    if (!existing) throw new Error(`Workflow run "${runId}" not found.`);
    if (existing.status !== 'failed') {
      throw new Error('Only failed workflow runs can be retried.');
    }
    return execute(rule, existing.input, existing.triggerId, existing);
  }

  function getRun(runId: string): WorkflowRunRecord<TInput> | undefined {
    return runs.value.find((r) => r.id === runId);
  }

  return { runs, run, retry, getRun };
}
