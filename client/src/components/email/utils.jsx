import { pdf } from "@react-pdf/renderer";

import { InvoicePDFDocument } from "../invoices/InvoicePDFDocument.jsx";
import { getPastDue } from "../../utils/pastDueCalc";


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
  pdf_title
) => {
  try {
    setLoading(true);
    
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
      setLoading,
      emails,
      title,
      message,
      ccEmails,
      bccEmails
    );
    await saveEmail(backend, blob, pdf_title, id);
   
    setisConfirmModalOpen(true);
  } catch (error) {
    console.error("Error sending email:", error);
  } finally {
    setLoading(false);
  }
};

export const sendEmail = async (
  backend,
  blob,
  pdf_title,
  setLoading,
  emails,
  title,
  message,
  ccEmails,
  bccEmails
) => {
  try {
    if (blob) {
      const formData = new FormData();
      formData.append("pdfFile", blob, `${pdf_title}.pdf`);
      const toString = Array.isArray(emails)
        ? emails.filter(Boolean).join(",")
        : (emails || "");
      const ccString = Array.isArray(ccEmails)
        ? ccEmails.filter(Boolean).join(",")
        : (ccEmails || "");
      const bccString = Array.isArray(bccEmails)
        ? bccEmails.filter(Boolean).join(",")
        : (bccEmails || "");

      formData.append("to", toString);
      formData.append("subject", title);
      formData.append("text", message);
      formData.append("html", `<p>${message.replace(/\n/g, "<br />")}</p>`);
      formData.append("cc", ccString);
      formData.append("bcc", bccString);

      const response = await backend.post("/email/send", formData);

    }
  } catch (error) {
    console.error("Error sending email:", error);
  } finally {
    if (typeof setLoading === "function") setLoading(false);
  }
};

export const saveEmail = async (backend, blob, pdf_title, id) => {
  try {
    if (blob) {
      const formData = new FormData();
      formData.append("file", blob, `${pdf_title}.pdf`);
      formData.append("comment", "");

      console.log("Saving email to database");
      await backend.post(`/invoices/backupInvoice/` + id, formData);
    } 
  } catch (error) {
    console.error("Error saving email to database:", error);
  }
};
