import express, { Router } from "express";

import { transporter, emailSender } from "../common/transporter";

const emailRouter = Router();
emailRouter.use(express.json());

async function sendEmail(to, subject, text, html, cc, bcc) {
    const mailOptions = {
        from: emailSender,
        to: Array.isArray(to) ? to.join(", ") : to,
        subject,
        text,
        html,
        attachments: [{
            filename: 'Test.pdf',
            path: 'Test.pdf',
            contentType: 'application/pdf'
        }],
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



emailRouter.post("/send", async (req, res) => {
    const { to, subject, text, html, cc, bcc } = req.body;

    try {
        const info = await sendEmail(to, subject, text, html, cc, bcc);
        res.status(200).json(info);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

export { emailRouter };