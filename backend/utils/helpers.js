const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
};

const parseIdParam = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const toNumber = (value, fallback = null) => {
  if (value === undefined || value === null) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const buildLogoUrl = (logoPath) => {
  const defaultLogo = process.env.STORE_DEFAULT_LOGO || "/assets/logo.svg";
  const baseUrl = (process.env.APP_BASE_URL || "").replace(/\/+$/, "");
  if (!logoPath) {
    return defaultLogo;
  }
  if (/^https?:\/\//i.test(logoPath)) {
    return logoPath;
  }
  const normalized = logoPath.replace(/^\/+/, "");
  return `${baseUrl}/${normalized}`;
};

module.exports = {
  sanitizeUser,
  parseIdParam,
  toNumber,
  buildLogoUrl,
};
