import type { Editor, EditorPosition, TFile } from 'obsidian';

export type SubpathKind = 'file' | 'heading' | 'block';
export type CopyPasteMode = 'ask' | 'plain' | 'file-name';
export type AliasFallbackMode =
  | 'target'
  | 'file-target'
  | 'file'
  | 'link'
  | 'none';

export type LinkOptionSettingKey =
  | 'enableWikiLink'
  | 'enableFileLinkWithText'
  | 'enableHeadingLink'
  | 'enableHeadingLinkWithText'
  | 'enableBlockLink'
  | 'enableBlockLinkWithText';

export interface LinkRequest {
  subpath: SubpathKind;
  embed: boolean;
  named: boolean;
}

export interface LinkOption {
  id: string;
  title: string;
  description: string;
  example: string;
  icon: string;
  settingKey: LinkOptionSettingKey;
  request: LinkRequest;
}

export interface InsertionTarget {
  editor: Editor;
  from: EditorPosition;
  to: EditorPosition;
  sourcePath: string;
  suggestedAlias: string;
}

export interface HeadingChoice {
  heading: string;
  level: number;
  line: number;
}

export interface BlockChoice {
  id: string;
  label: string;
  line: number;
}

export interface DestinationChoice {
  file: TFile;
  heading?: HeadingChoice;
  block?: BlockChoice;
}

export interface LinkrSettings {
  aliasFallback: AliasFallbackMode;
  copyPasteMode: CopyPasteMode;
  enableWikiLink: boolean;
  enableFileLinkWithText: boolean;
  enableHeadingLink: boolean;
  enableHeadingLinkWithText: boolean;
  enableBlockLink: boolean;
  enableBlockLinkWithText: boolean;
  recentFileLimit: number;
  recentFilePaths: string[];
  showFilePaths: boolean;
  allowCreateNotes: boolean;
  addHeadingToNewNotes: boolean;
  preferredUniversalOption: string;
  rememberLastUniversalOption: boolean;
  lastUniversalOption: string;
}

export const LINK_OPTIONS: LinkOption[] = [
  {
    id: 'file-plain',
    title: 'Wiki link',
    description: 'Link to a note or attachment without custom text.',
    example: '[[my_file]]',
    icon: 'brackets',
    settingKey: 'enableWikiLink',
    request: { subpath: 'file', embed: false, named: false },
  },
  {
    id: 'file-named',
    title: 'File link with text',
    description: 'Link to a file using custom display text.',
    example: '[[my_file|photosynthesis]]',
    icon: 'text-cursor-input',
    settingKey: 'enableFileLinkWithText',
    request: { subpath: 'file', embed: false, named: true },
  },
  {
    id: 'heading-named',
    title: 'Heading link with text',
    description: 'Link to a heading using custom display text.',
    example: '[[my_file#Heading|photosynthesis]]',
    icon: 'heading-2',
    settingKey: 'enableHeadingLinkWithText',
    request: { subpath: 'heading', embed: false, named: true },
  },
  {
    id: 'block-named',
    title: 'Block link with text',
    description: 'Link to a block ID using custom display text.',
    example: '[[my_file#^block-id|important idea]]',
    icon: 'text-select',
    settingKey: 'enableBlockLinkWithText',
    request: { subpath: 'block', embed: false, named: true },
  },
  {
    id: 'heading-plain',
    title: 'Heading link',
    description: 'Link directly to a heading without display text.',
    example: '[[my_file#Heading]]',
    icon: 'heading',
    settingKey: 'enableHeadingLink',
    request: { subpath: 'heading', embed: false, named: false },
  },
  {
    id: 'block-plain',
    title: 'Block link',
    description: 'Link directly to a block ID without display text.',
    example: '[[my_file#^block-id]]',
    icon: 'pilcrow',
    settingKey: 'enableBlockLink',
    request: { subpath: 'block', embed: false, named: false },
  },
];

const LEGACY_OPTION_IDS: Record<string, string> = {
  'embed-file-plain': 'file-plain',
  'embed-file-named': 'file-named',
  'embed-heading-plain': 'heading-plain',
  'embed-heading-named': 'heading-named',
  'embed-block-plain': 'block-plain',
  'embed-block-named': 'block-named',
};

export function normalizeLinkOptionId(id: string): string {
  return LEGACY_OPTION_IDS[id] ?? id;
}

export function getLinkOption(id: string): LinkOption {
  const normalizedId = normalizeLinkOptionId(id);
  return LINK_OPTIONS.find((option) => option.id === normalizedId) ?? LINK_OPTIONS[0]!;
}

export function isLinkOptionEnabled(
  option: LinkOption,
  settings: LinkrSettings,
): boolean {
  return settings[option.settingKey];
}
