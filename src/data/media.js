/**
 * Where the video is served from.
 *
 * The clips are 880MB — too much to keep in the repo, so they live in
 * Cloudflare R2 and the site fetches them from there. R2 was chosen over
 * uploading them to the host because it charges no egress, so the
 * library can grow without the bill following it, and because it keeps
 * the media independent of whichever host the site is deployed to.
 *
 * `projects.js` still stores plain paths — "/video/clips/foo.mp4" — so
 * the data describes what a file *is* rather than where it happens to be
 * kept this month. This is the only place that knows the difference, and
 * moving hosts is a one-line change here.
 *
 * The bucket is laid out with the contents of public/video at its root,
 * so the mapping is just dropping the leading "/video" segment.
 */
export const VIDEO_BASE = "https://pub-4610bcae1eb8415daa64ea7ee1777e20.r2.dev";

const LOCAL_PREFIX = "/video";

/**
 * Resolve a stored media path to the URL to actually request.
 *
 * Anything that isn't one of our own video paths is handed back
 * untouched, so this is safe to wrap around a value that might already
 * be absolute, might be a YouTube id's sibling field, or might be null.
 */
export const mediaUrl = (path) =>
  typeof path === "string" && path.startsWith(`${LOCAL_PREFIX}/`)
    ? VIDEO_BASE + path.slice(LOCAL_PREFIX.length)
    : path;
