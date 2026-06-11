// Feature flags for platform capabilities
export const FEATURES = {
  auth: false,
  store: true,
  admin: true,
  payments: false,
  email: false,
};

// Toggle helper
export function isEnabled(key) {
  return Boolean(FEATURES[key]);
}
