/**
 * Patches expo-asset's getManifestBaseUrl to avoid assigning to URL properties.
 * URL.protocol (and .pathname, .search, .hash) are getter-only on Hermes in RN 0.81+,
 * so any assignment throws: "Cannot assign to property 'protocol' which has only a getter".
 *
 * The patched version reads URL parts and reconstructs the string — no setters used.
 * This runs automatically via the "postinstall" script in package.json.
 */

const fs = require('fs');
const path = require('path');

const candidates = [
  path.resolve(__dirname, '../node_modules/expo/node_modules/expo-asset/build/AssetUris.js'),
  path.resolve(__dirname, '../node_modules/expo-asset/build/AssetUris.js'),
];

const MARKER = '// Patched: avoid assigning to URL properties';

const ORIGINAL_FN =
  `export function getManifestBaseUrl(manifestUrl) {
    const urlObject = new URL(manifestUrl);
    let nextProtocol = urlObject.protocol;
    // Change the scheme to http(s) if it is exp(s)
    if (nextProtocol === 'exp:') {
        nextProtocol = 'http:';
    }
    else if (nextProtocol === 'exps:') {
        nextProtocol = 'https:';
    }
    urlObject.protocol = nextProtocol;
    // Trim filename, query parameters, and fragment, if any
    const directory = urlObject.pathname.substring(0, urlObject.pathname.lastIndexOf('/') + 1);
    urlObject.pathname = directory;
    urlObject.search = '';
    urlObject.hash = '';
    // The URL spec doesn't allow for changing the protocol to \`http\` or \`https\`
    // without a port set so instead, we'll just swap the protocol manually.
    return urlObject.protocol !== nextProtocol
        ? urlObject.href.replace(urlObject.protocol, nextProtocol)
        : urlObject.href;
}`;

const PATCHED_FN =
  `export function getManifestBaseUrl(manifestUrl) {
    ${MARKER} — they are getter-only on Hermes (RN 0.81+).
    // Read all values, then reconstruct the string manually.
    const urlObject = new URL(manifestUrl);
    let protocol = urlObject.protocol;
    if (protocol === 'exp:') {
        protocol = 'http:';
    }
    else if (protocol === 'exps:') {
        protocol = 'https:';
    }
    const directory = urlObject.pathname.substring(0, urlObject.pathname.lastIndexOf('/') + 1);
    return protocol + '//' + urlObject.host + directory;
}`;

for (const target of candidates) {
  if (!fs.existsSync(target)) continue;

  let code = fs.readFileSync(target, 'utf8');
  if (code.includes(MARKER)) {
    // Already patched
    continue;
  }

  if (code.includes('urlObject.protocol = nextProtocol')) {
    code = code.replace(ORIGINAL_FN, PATCHED_FN);
    fs.writeFileSync(target, code);
    console.log('[postinstall] Patched expo-asset getManifestBaseUrl →', target);
  }
}
