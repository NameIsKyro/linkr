import type { Editor, EditorPosition, TFile } from 'obsidian';

export type SubpathKind = 'file' | 'heading' | 'block';
export type AliasFallbackMode = 'destination' | 'file' | 'empty';

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
    title: 'File link — plain',
    description: 'Link to any note or attachment.',
    example: '[[my_file]]',
    icon: 'file-text',
    request: { subpath: 'file', embed: false, named: false },
  },
  {
    id: 'file-named',
    title: 'File link — with name',
    description: 'Link to a file with a custom display name.',
    example: '[[my_file|photosynthesis]]',
    icon: 'text-cursor-input',
    request: { subpath: 'file', embed: false, named: true },
  },
  {
    id: 'heading-plain',
    title: 'File heading link — plain',
    description: 'Link directly to a heading in a Markdown note.',
    example: '[[my_file#Heading]]',
    icon: 'heading',
    request: { subpath: 'heading', embed: false, named: false },
  },
  {
    id: 'heading-named',
    title: 'File heading link — with name',
    description: 'Link to a heading with a custom display name.',
    example: '[[my_file#Heading|photosynthesis]]',
    icon: 'heading-2',
    request: { subpath: 'heading', embed: false, named: true },
  },
  {
    id: 'block-plain',
    title: 'File block link — plain',
    description: 'Link directly to an explicit Obsidian block ID.',
    example: '[[my_file#^block-id]]',
    icon: 'pilcrow',
    request: { subpath: 'block', embed: false, named: false },
  },
  {
    id: 'block-named',
    title: 'File block link — with name',
    description: 'Link to a block with a custom display name.',
    example: '[[my_file#^block-id|important idea]]',
    icon: 'text-select',
    request: { subpath: 'block', embed: false, named: true },
  },
  {
    id: 'embed-file-plain',
    title: 'Embed file — plain',
    description: 'Embed a note, image, PDF, audio file, or other attachment.',
    example: '![[my_file]]',
    icon: 'panel-top-open',
    request: { subpath: 'file', embed: true, named: false },
  },
  {
    id: 'embed-file-named',
    title: 'Embed file — with name',
    description: 'Embed a file and include a name after the pipe.',
    example: '![[my_file|photosynthesis]]',
    icon: 'panel-top',
    request: { subpath: 'file', embed: true, named: true },
  },
  {
    id: 'embed-heading-plain',
    title: 'Embed heading — plain',
    description: 'Embed one section from a Markdown note.',
    example: '![[my_file#Heading]]',
    icon: 'between-horizontal-start',
    request: { subpath: 'heading', embed: true, named: false },
  },
  {
    id: 'embed-heading-named',
    title: 'Embed heading — with name',
    description: 'Embed a section and include a name after the pipe.',
    example: '![[my_file#Heading|photosynthesis]]',
    icon: 'between-horizontal-end',
    request: { subpath: 'heading', embed: true, named: true },
  },
  {
    id: 'embed-block-plain',
    title: 'Embed block — plain',
    description: 'Embed one block from a Markdown note.',
    example: '![[my_file#^block-id]]',
    icon: 'square-dashed',
    request: { subpath: 'block', embed: true, named: false },
  },
  {
    id: 'embed-block-named',
    title: 'Embed block — with name',
    description: 'Embed a block and include a name after the pipe.',
    example: '![[my_file#^block-id|important idea]]',
    icon: 'scan-text',
    request: { subpath: 'block', embed: true, named: true },
  },
];

export function getLinkOption(id: string): LinkOption {
  return LINK_OPTIONS.find((option) => option.id === id) ?? LINK_OPTIONS[0]!;
}
