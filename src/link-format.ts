import type {
  AliasFallbackMode,
  DestinationChoice,
  LinkRequest,
} from './types';

export function buildDestinationText(
  fileLink: string,
  destination: DestinationChoice,
): string {
  if (destination.heading) {
    return `${fileLink}#${destination.heading.heading}`;
  }

  if (destination.block) {
    return `${fileLink}#^${destination.block.id}`;
  }

  return fileLink;
}

export function getFallbackAlias(
  destination: DestinationChoice,
  mode: AliasFallbackMode,
): string {
  if (mode === 'empty') {
    return '';
  }

  if (mode === 'file') {
    return destination.file.basename;
  }

  return (
    destination.heading?.heading ??
    destination.block?.label ??
    destination.file.basename
  );
}

export function buildWikiLink(
  destinationText: string,
  request: LinkRequest,
  alias: string,
): string {
  const prefix = request.embed ? '!' : '';
  const aliasPart = request.named ? `|${escapeAlias(alias)}` : '';
  return `${prefix}[[${destinationText}${aliasPart}]]`;
}

export function escapeAlias(alias: string): string {
  return alias
    .replace(/\r?\n/g, ' ')
    .replace(/\|/g, '\\|')
    .replace(/\]/g, '\\]');
}

export function sanitizeNewNoteName(value: string): string {
  return value
    .trim()
    .replace(/\.md$/i, '')
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/[. ]+$/g, '')
    .trim();
}
