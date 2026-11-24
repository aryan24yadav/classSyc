/**
 * Reads the token from an "Authorization: Bearer <token>" header.
 * Returns null when the header is missing or malformed.
 */
export function getBearerToken(authorizationHeader) {
    if (typeof authorizationHeader !== 'string') return null;

    const [scheme, token, ...rest] = authorizationHeader.trim().split(/\s+/);
    if (rest.length > 0 || !token || scheme.toLowerCase() !== 'bearer') return null;

    return token;
}
