const filePathPrefix = "https://commons.wikimedia.org/wiki/Special:FilePath/";

export const peakThumbnail = (url: string, width: number): string =>
  url.startsWith(filePathPrefix) ? `${url}?width=${width}` : url;
