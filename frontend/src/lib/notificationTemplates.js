// Templates are now stored in MongoDB and managed via /admin/templates UI.
// This module only exposes the variable-substitution helper used at send time.

export function applyTemplateVars(text, app) {
  if (!text) return "";
  const vars = {
    name: app?.user_name || "there",
    cargo_type: app?.cargo_type || "your cargo",
    port: app?.port || "the port",
    containers: app?.containers || "your containers",
    tracking_number: app?.tracking_number || "—",
    eta: app?.eta || "TBD",
  };
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}
