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
      formData.append("to", emails);
      formData.append("subject", title);
      formData.append("text", message);
      formData.append("html", `<p>${message.replace(/\n/g, "<br />")}</p>`);
      formData.append("cc", ccEmails);
      formData.append("bcc", bccEmails);

      const response = await backend.post("/email/send", formData);

    }
  } catch (error) {
    console.error("Error sending email:", error);
  } finally {
    setLoading(false);
  }
};

export const saveEmail = async (backend, blob, pdf_title, id) => {
  try {
    if (blob) {
      const formData = new FormData();
      formData.append("file", blob, `${pdf_title}.pdf`);
      formData.append("comment", "");

      await backend.post(`invoices/backupInvoice/` + id, formData);
    } else {
      console.log("no formData for save email");
    }
  } catch (error) {
    console.error("Error saving email to database:", error);
  }
};
