/**
 * Utility functions for generating Wikipedia links
 */

export function getWikipediaUrl(name) {
  if (!name) return null
  // Replace spaces with underscores and encode the URL
  const encodedName = name.replace(/\s+/g, '_')
  return `https://en.wikipedia.org/wiki/${encodedName}`
}

