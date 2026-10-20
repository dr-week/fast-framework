import { createSvgElement, type GlyphDefinition } from './base.js';

/**
 * User / Profile Avatar Glyph
 */
export const UserGlyph: GlyphDefinition = (props) =>
  createSvgElement(
    '0 0 24 24',
    `<circle cx="12" cy="8" r="5"/>
     <path d="M20 21a8 8 0 0 0-16 0"/>`,
    props
  );

/**
 * Global Search / Magnifier Glyph
 */
export const SearchGlyph: GlyphDefinition = (props) =>
  createSvgElement(
    '0 0 24 24',
    `<circle cx="11" cy="11" r="8"/>
     <path d="m21 21-4.3-4.3"/>`,
    props
  );

/**
 * Bell / Notification Glyph
 */
export const BellGlyph: GlyphDefinition = (props) =>
  createSvgElement(
    '0 0 24 24',
    `<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
     <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>`,
    props
  );

/**
 * Home / Primary Hub Glyph
 */
export const HomeGlyph: GlyphDefinition = (props) =>
  createSvgElement(
    '0 0 24 24',
    `<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
     <polyline points="9 22 9 12 15 12 15 22"/>`,
    props
  );

/**
 * Plus / Add / Create Positive Action Glyph
 */
export const PlusGlyph: GlyphDefinition = (props) =>
  createSvgElement(
    '0 0 24 24',
    `<path d="M12 5v14"/>
     <path d="M5 12h14"/>`,
    props
  );

/**
 * Close / Dismiss (X) Glyph
 */
export const CloseGlyph: GlyphDefinition = (props) =>
  createSvgElement(
    '0 0 24 24',
    `<path d="M18 6 6 18"/>
     <path d="m6 6 12 12"/>`,
    props
  );

/**
 * Checkmark / Verified Glyph
 */
export const CheckGlyph: GlyphDefinition = (props) =>
  createSvgElement(
    '0 0 24 24',
    `<path d="M20 6 9 17l-5-5"/>`,
    props
  );

/**
 * External Link / Outbound Arrow Glyph
 */
export const ExternalLinkGlyph: GlyphDefinition = (props) =>
  createSvgElement(
    '0 0 24 24',
    `<path d="M15 3h6v6"/>
     <path d="M10 14 21 3"/>
     <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>`,
    props
  );

/**
 * Heart / Favorite / Like Glyph
 */
export const HeartGlyph: GlyphDefinition = (props) =>
  createSvgElement(
    '0 0 24 24',
    `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>`,
    props
  );

/**
 * Share / Broadcast / Repost Glyph
 */
export const ShareGlyph: GlyphDefinition = (props) =>
  createSvgElement(
    '0 0 24 24',
    `<circle cx="18" cy="5" r="3"/>
     <circle cx="6" cy="12" r="3"/>
     <circle cx="18" cy="19" r="3"/>
     <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
     <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>`,
    props
  );

/**
 * Message / Chat / Comment Glyph
 */
export const MessageGlyph: GlyphDefinition = (props) =>
  createSvgElement(
    '0 0 24 24',
    `<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>`,
    props
  );

/**
 * Bookmark / Save Glyph
 */
export const BookmarkGlyph: GlyphDefinition = (props) =>
  createSvgElement(
    '0 0 24 24',
    `<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>`,
    props
  );

/**
 * Hardware / Device / Monitor Glyph
 */
export const MonitorGlyph: GlyphDefinition = (props) =>
  createSvgElement(
    '0 0 24 24',
    `<rect width="20" height="14" x="2" y="3" rx="2"/>
     <line x1="8" y1="21" x2="16" y2="21"/>
     <line x1="12" y1="17" x2="12" y2="21"/>`,
    props
  );

/**
 * 3D Printer / Box / Model Glyph
 */
export const PrinterGlyph: GlyphDefinition = (props) =>
  createSvgElement(
    '0 0 24 24',
    `<path d="M6 9V2h12v7"/>
     <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
     <rect width="12" height="8" x="6" y="14"/>`,
    props
  );

/**
 * Flame / Thermal Glyph
 */
export const FlameGlyph: GlyphDefinition = (props) =>
  createSvgElement(
    '0 0 24 24',
    `<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>`,
    props
  );
