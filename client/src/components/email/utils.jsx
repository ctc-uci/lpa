import { pdf } from "@react-pdf/renderer";
import { InvoicePDFDocument } from "../invoices/InvoicePDFDocument.jsx";

export const sendSaveEmail = async (
  setLoading,
  setisConfirmModalOpen,
  invoice,
  pdf_title,
  invoiceData,
  emails,
  title,
  message,
  ccEmails,
  bccEmails,
  backend,
  id
) => {
  setLoading(true);
  await new Promise(resolve => setTimeout(resolve, 0));
  const blob = await makeBlob(invoice, invoiceData);
  await sendEmail(backend, blob, pdf_title, setLoading, emails, title, message, ccEmails, bccEmails);
  await saveEmail(backend, blob, pdf_title, id);
  setisConfirmModalOpen(true);
};

const makeBlob = async (invoice, invoiceData) => {
  const pdfDocument = (
    <InvoicePDFDocument
      invoice={invoice}
      {...invoiceData}
    />
  );

  const blob = await pdf(pdfDocument).toBlob();
  return blob;
}

const sendEmail = async (
  backend,
  blob,
  pdf_title,
  setLoading,
  emails,
  title,
  message,
  ccEmails,
  bccEmails,) => {
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

      // console.log("Email sent successfully!", response.data);
    }
  } catch (error) {
    console.error("Error sending email:", error);
  } finally {
    setLoading(false);
  }
};

const saveEmail = async (backend, blob, pdf_title, id) => {
  try {
    if (blob) {
      const formData = new FormData();
      formData.append("file", blob, `${pdf_title}.pdf`);
      formData.append("comment", "");

      await backend.post(`invoices/backupInvoice/` + id, formData);
    }
    else {
      console.log("no formData for save email");
    }
  } catch (error) {
    console.error("Error saving email to database:", error);
  }
};
