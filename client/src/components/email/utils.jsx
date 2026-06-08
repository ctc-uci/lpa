import { pdf } from "@react-pdf/renderer";

import logo from "../../assets/logo/logo.png";
import { InvoicePDFDocument } from "../invoices/InvoicePDFDocument.jsx";

export const mergeUniqueEmails = (...emailLists) => {
  const seen = new Set();
  const merged = [];

  for (const list of emailLists) {
    const emails = Array.isArray(list) ? list : [list];
    for (const email of emails) {
      const trimmed = typeof email === "string" ? email.trim() : "";
      const key = trimmed.toLowerCase();
      if (trimmed && !seen.has(key)) {
        seen.add(key);
        merged.push(trimmed);
      }
    }
  }

  return merged;
};

export const recipientsToEmails = (recipients) =>
  mergeUniqueEmails(recipients.map((recipient) => recipient?.email));

export const recipientsEqual = (current, defaults) => {
  if (current.length !== defaults.length) return false;
  return current.every(
    (recipient, index) => recipient?.email === defaults[index]?.email
  );
};

export const cloneRecipients = (recipients) => recipients.map((r) => ({ ...r }));

export const sendSaveEmail = async (
  setLoading,
  setisConfirmModalOpen,
  invoice,
  invoiceData,
  sessions,
  emails,
  title,
  message,
  ccEmails,
  bccEmails,
  backend,
  id,
  pdf_title,
  onEmailSent
) => {
  try {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const safeSessions = Array.isArray(sessions) ? sessions : [];

    const blob = await pdf(
      <InvoicePDFDocument
        sessions={safeSessions}
        invoice={invoice}
        {...invoiceData}
      />
    ).toBlob();

    await sendEmail(
      backend,
      blob,
      pdf_title,
      emails,
      title,
      message,
      ccEmails,
      bccEmails
    );
    await saveEmail(backend, blob, pdf_title, id);
    await backend.put(`/invoices/${id}`, { isSent: true });
    if (onEmailSent) onEmailSent();

    setisConfirmModalOpen(true);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  } finally {
    setLoading(false);
  }
};

export const sendEmail = async (
  backend,
  blob,
  pdf_title,
  emails,
  title,
  message,
  ccEmails,
  bccEmails
) => {
  if (!blob) {
    throw new Error("Failed to generate invoice PDF");
  }

  const formData = new FormData();
  formData.append("pdfFile", blob, `${pdf_title}.pdf`);

  const logoResponse = await fetch(logo);
  const logoBlob = await logoResponse.blob();
  formData.append("logoFile", logoBlob, "logo.png");

  const toString = Array.isArray(emails)
    ? emails.filter(Boolean).join(",")
    : emails || "";
  const ccString = Array.isArray(ccEmails)
    ? ccEmails.filter(Boolean).join(",")
    : ccEmails || "";
  const bccString = Array.isArray(bccEmails)
    ? bccEmails.filter(Boolean).join(",")
    : bccEmails || "";

  if (!toString) {
    throw new Error("At least one recipient is required");
  }

  formData.append("to", toString);
  formData.append("subject", title);
  formData.append("text", message);
  formData.append(
    "html",
    `<p>${message.replace(/\n/g, "<br />")}</p><br /><img src="cid:lapena-logo" width="100" />`
  );
  formData.append("cc", ccString);
  formData.append("bcc", bccString);

  await backend.post("/email/send", formData);
};

export const saveEmail = async (backend, blob, pdf_title, id) => {
  if (!blob) {
    throw new Error("Failed to generate invoice PDF");
  }

  const formData = new FormData();
  formData.append("file", blob, `${pdf_title}.pdf`);
  formData.append("comment", "");

  await backend.post(`/invoices/backupInvoice/` + id, formData);
};
