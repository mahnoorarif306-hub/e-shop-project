// Offline placeholder (inline SVG) - no external request, so it can never "fail to load"
export const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="#f3f4f6"/><g fill="none" stroke="#9ca3af" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><rect x="75" y="90" width="150" height="120" rx="10"/><circle cx="120" cy="130" r="12"/><path d="M80 200l45-45 30 30 22-22 43 43"/></g></svg>`
  );

// Accepts a string, a {url} / {secure_url} object, or an array of those
export const getImageUrl = (src) => {
  if (!src) return PLACEHOLDER_IMG;
  if (typeof src === "string") return src;
  if (Array.isArray(src)) return getImageUrl(src[0]);
  return src.url || src.secure_url || PLACEHOLDER_IMG;
};

// Image of a product / event / cart item (works for DB items and static demo data)
export const getProductImage = (item, index = 0) => {
  const getAtIndex = (source) =>
    Array.isArray(source) ? source[index] : index === 0 ? source : undefined;
  const image =
    getAtIndex(item?.images) ??
    getAtIndex(item?.image_Url) ??
    getAtIndex(item?.image);

  return getImageUrl(image);
};

export const getProductImages = (item) => {
  const candidates = [item?.images, item?.image_Url, item?.image].map(
    (source) => (Array.isArray(source) ? source : source ? [source] : [])
  );
  const list = candidates.find((images) => images.length) ?? [];

  return list.map(getImageUrl);
};

// use as: <img onError={onImgError} />
export const onImgError = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = PLACEHOLDER_IMG;
};

// Avatar helper: DB may still hold old broken "via.placeholder.com" urls -> show an inline initial avatar instead
export const getInitialAvatar = (name = "U") => {
  const letter = (String(name).trim()[0] || "U").toUpperCase();
  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150"><rect width="150" height="150" fill="#3321c8"/><text x="50%" y="50%" dy=".35em" text-anchor="middle" font-family="Arial,sans-serif" font-size="70" font-weight="700" fill="#fff">${letter}</text></svg>`
    )
  );
};

export const getAvatarUrl = (entity) => {
  const url = entity?.avatar?.url;
  if (
    url &&
    typeof url === "string" &&
    !url.includes("placeholder") &&
    entity?.avatar?.public_id !== "default"
  )
    return url;
  return getInitialAvatar(entity?.name);
};

export const onAvatarError = (name) => (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = getInitialAvatar(name);
};
