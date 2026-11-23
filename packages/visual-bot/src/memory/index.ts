export {
  createDedupeMemory,
  type DedupeMemoryOptions,
  type DedupeMemory,
} from './dedupe.js';
export {
  computeTasteProfile,
  type OutcomeRating,
  type VoteDirection,
  type FeedbackRecord,
  type TasteProfileWeights,
  type TasteProfile,
} from './taste.js';
export {
  serializeSnapshot,
  parseSnapshot,
  type PortableSnapshot,
} from './snapshot.js';
