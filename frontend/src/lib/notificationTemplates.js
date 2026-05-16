// Predefined notification templates for the admin Manage Application dialog.
// {{vars}} get substituted with application data before send.
// Available vars: name, cargo_type, port, containers, tracking_number, eta

export const NOTIFICATION_TEMPLATES = [
  {
    key: "request_paar",
    label: "Request PAAR",
    subject: "PAAR document needed for your {{cargo_type}} shipment",
    body:
`Hello {{name}},

Kindly share your latest PAAR (Pre-Arrival Assessment Report) for the {{cargo_type}} consignment arriving at {{port}}. We need this on file before we can begin filing your clearing documentation.

You can upload it directly from your JDOM dashboard → Document Vault.

Thanks,
JDOM Clearing Desk`
  },
  {
    key: "request_bol",
    label: "Request Bill of Lading",
    subject: "Bill of Lading needed — {{cargo_type}}",
    body:
`Hello {{name}},

Please send across the signed Bill of Lading for your {{containers}} consignment heading to {{port}}. Once we have it, we can move your application into active processing.

Upload at: dashboard → Document Vault → Bill of Lading.

JDOM Clearing Desk`
  },
  {
    key: "request_form_m",
    label: "Request Form M",
    subject: "Form M required for your shipment",
    body:
`Hello {{name}},

We're missing the Form M for your {{cargo_type}} consignment. Without it, customs cannot accept the declaration. Kindly upload at your earliest convenience.

JDOM Clearing Desk`
  },
  {
    key: "cargo_arrived",
    label: "Cargo arrived at port",
    subject: "Your cargo has arrived at {{port}}",
    body:
`Hello {{name}},

Quick update — your {{cargo_type}} consignment ({{containers}}) has arrived at {{port}}. Our agent on the ground has visual confirmation and we are now lining up the customs filing.

Tracking #: {{tracking_number}}

JDOM Clearing Desk`
  },
  {
    key: "processing_started",
    label: "Processing started",
    subject: "Customs processing has started",
    body:
`Hello {{name}},

We've begun active customs processing for your {{cargo_type}} consignment at {{port}}. You'll get a fresh update from us as soon as the entry is filed.

Tracking #: {{tracking_number}}

JDOM Clearing Desk`
  },
  {
    key: "cleared",
    label: "Cleared — ready for pickup",
    subject: "Your cargo is cleared and ready",
    body:
`Hello {{name}},

Great news — your {{cargo_type}} consignment has been cleared by Nigerian Customs at {{port}}. Please coordinate pickup or last-mile delivery at your convenience.

Tracking #: {{tracking_number}}

JDOM Clearing Desk`
  },
  {
    key: "demurrage_notice",
    label: "Demurrage warning",
    subject: "Action needed to avoid demurrage",
    body:
`Hello {{name}},

A quick heads-up: your {{cargo_type}} consignment at {{port}} is approaching free-time expiry. To avoid demurrage charges, please send any outstanding documentation today.

JDOM Clearing Desk`
  },
  {
    key: "additional_docs",
    label: "Additional documents requested",
    subject: "More documents needed for {{cargo_type}}",
    body:
`Hello {{name}},

Customs has requested additional supporting documents for your {{cargo_type}} consignment. Kindly reach out on WhatsApp so we can walk you through what's needed.

JDOM Clearing Desk`
  },
];

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
