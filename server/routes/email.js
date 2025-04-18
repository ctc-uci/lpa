import express, { Router } from "express";
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

import { transporter, emailSender } from "../common/transporter";

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

emailRouter.post("/send", upload.single('pdfFile'), async (req, res) => {
  try {
    const to = req.body.to;
    const cc = req.body.cc ? req.body.cc : [];
    const bcc = req.body.bcc ? req.body.bcc : [];
    const { subject, text, html } = req.body;

    const attachments = req.file ? [{
      filename: req.file.originalname,
      content: req.file.buffer,
      contentType: 'application/pdf'
    }] : [];

    const info = await sendEmail(to, subject, text, html, cc, bcc, attachments);

    res.status(200).json(info);
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).send(error.message);
  }
});


export { emailRouter };
