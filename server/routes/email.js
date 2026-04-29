import express, { Router } from "express";
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

import { transporter, emailSender } from "../common/transporter";
import { db } from "../db/db-pgp";

const emailRouter = Router();
emailRouter.use(express.json());

async function sendEmail(to, subject, text, html, cc, bcc, attachments ) {

    const mailOptions = {
        from: emailSender,
        to: Array.isArray(to) ? to.join(", ") : to,
        subject,
        text,
        html,
        attachments: attachments,
    };

    if (cc && cc.length > 0) {
        mailOptions.cc = Array.isArray(cc) ? cc.join(", ") : cc;
    }

    if (bcc && bcc.length > 0) {
        mailOptions.bcc = Array.isArray(bcc) ? bcc.join(", ") : bcc;
    }

    const info = await transporter.sendMail(mailOptions);
    return info;
}

emailRouter.post("/send", upload.fields([{ name: "pdfFile" }, { name: "logoFile" }]), async (req, res) => {
  try {
    const to = req.body.to;
    const cc = req.body.cc ? req.body.cc : [];
    const bcc = req.body.bcc ? req.body.bcc : [];
    const { subject, text, html } = req.body;

    const pdfFile = req.files?.["pdfFile"]?.[0];
    const logoFile = req.files?.["logoFile"]?.[0];

    const attachments = [];
    if (pdfFile) {
      attachments.push({
        filename: pdfFile.originalname,
        content: pdfFile.buffer,
        contentType: "application/pdf",
      });
    }
    if (logoFile) {
      attachments.push({
        filename: "logo.png",
        content: logoFile.buffer,
        contentType: "image/png",
        cid: "lapena-logo",
      });
    }

    const info = await sendEmail(to, subject, text, html, cc, bcc, attachments);

    res.status(200).json(info);
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).send(error.message);
  }
});


emailRouter.get("/template", async (req, res) => {
  try {
    const template = await db.oneOrNone(`SELECT body FROM email_templates ORDER BY id LIMIT 1`);
    res.status(200).json({ body: template ? template.body : "" });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

emailRouter.put("/template", async (req, res) => {
  try {
    const { body } = req.body;
    if (!body && body !== "") {
      return res.status(400).json({ error: "body is required" });
    }
    const existing = await db.oneOrNone(`SELECT id FROM email_templates ORDER BY id LIMIT 1`);
    if (existing) {
      await db.none(`UPDATE email_templates SET body = $1 WHERE id = $2`, [body, existing.id]);
    } else {
      await db.none(`INSERT INTO email_templates (body) VALUES ($1)`, [body]);
    }
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export { emailRouter };
