/**
 * Utility functions for URL processing
 */

/**
 * Extracts and processes the actual URL from a Facebook redirect URL
 * @param {string} url - The URL to process, which may be a Facebook redirect URL
 * @returns {string} - The extracted and processed URL
 */
export const extractFacebookRedirectUrl = (url: string): string => {
  if (!url) return url;

  let processedUrl = url;

  // Handle Facebook redirect URLs
  if (url.includes('facebook.com/l.php?u=')) {
    try {
      // Extract the URL from the 'u' parameter
      const urlParts = url.split('?');
      if (urlParts.length > 1) {
        const urlParam = new URLSearchParams(urlParts[1]).get('u');
        if (urlParam) {
          // Decode the URL
          const decodedUrl = decodeURIComponent(urlParam);
          console.log(`Extracted URL from Facebook redirect: ${decodedUrl}`);
          processedUrl = decodedUrl;

          // Handle any additional URL parameters after the extracted URL
          // Some Facebook redirects might have fbclid or other parameters
          if (processedUrl.includes('?')) {
            try {
              const extractedUrlObj = new URL(processedUrl);
              // Keep only the essential parts of the URL
              processedUrl = extractedUrlObj.origin + extractedUrlObj.pathname;
            } catch (innerError) {
              console.log('Error processing extracted URL:', innerError);
            }
          }
        }
      }
    } catch (e) {
      console.log('Error extracting URL from Facebook redirect:', e);
    }
  }

  return safeDecodeURI(processedUrl);
};

// Safer decoding function
function safeDecodeURI(uri: string): string {
  try {
    return decodeURIComponent(uri);
  } catch {
    // Handle malformed URI by removing trailing % if present
    if (uri.endsWith('%')) {
      return safeDecodeURI(uri.slice(0, -1));
    }

    // Try to decode as much as possible by processing each segment
    return uri
      .split('%')
      .map((part, index) => {
        if (index === 0) return part;
        try {
          // Check if this is a valid percent encoding (needs at least 2 chars)
          if (part.length >= 2) {
            const hex = part.substring(0, 2);
            const remainder = part.substring(2);
            return String.fromCharCode(parseInt(hex, 16)) + remainder;
          }
          return '%' + part;
        } catch {
          return '%' + part;
        }
      })
      .join('');
  }
}

/**
 * Normalizes a URL by removing protocol prefixes and extracting domain and path
 * @param {string} url - The URL to normalize
 * @param {boolean} addPercentSign - Whether to add % at the end for database matching
 * @returns {string} - The normalized URL (domain + path)
 */
export const normalizeUrl = (url: string, addPercentSign = false): string => {
  if (!url) return url;

  let normalizedUrl = url;

  // First extract any Facebook redirect URL
  normalizedUrl = extractFacebookRedirectUrl(normalizedUrl);

  // If URL looks like a URL, extract just the domain and path part
  if (normalizedUrl.includes('http://') || normalizedUrl.includes('https://')) {
    try {
      const urlObj = new URL(normalizedUrl);
      normalizedUrl = urlObj.hostname + urlObj.pathname;
    } catch {
      // If not a valid URL, use as is
      console.log('Could not parse as URL, using as-is');
    }
  }

  // Remove any query parameters (everything after the question mark)
  if (normalizedUrl.includes('?')) {
    normalizedUrl = normalizedUrl.split('?')[0];
  }

  // Remove protocol prefixes if present
  normalizedUrl = normalizedUrl.replace(/^https?:\/\//i, '');

  // Also remove www. prefix if present
  normalizedUrl = normalizedUrl.replace(/^www\./i, '');

  normalizedUrl = safeDecodeURI(normalizedUrl);

  if (addPercentSign) {
    normalizedUrl = `${normalizedUrl}%`;
  }

  return normalizedUrl;
};

const urlUtils = {
  extractFacebookRedirectUrl,
  normalizeUrl,
};

export default urlUtils;
