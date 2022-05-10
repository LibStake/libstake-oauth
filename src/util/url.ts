/**
 * Check if both url have same baseurl
 * Url is equivalent when
 * - Protocol is same
 * - Host is same (Incl. Port number)
 */
export const compareBaseURL = (url1: string, url2: string) => {
    try {
        const u1 = new URL(url1), u2 = new URL(url2);
        return (u1.protocol === u2.protocol)
            && (u1.host === u2.host)
    } catch (err) {
        return false;
    }
}
