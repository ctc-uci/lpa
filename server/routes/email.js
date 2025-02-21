import express, { Router } from "express";

import { transporter, emailSender } from "../common/transporter";

const emailRouter = Router();
emailRouter.use(express.json());

async function sendEmail(to, subject, text, html) {
    const info = await transporter.sendMail({
        from: emailSender,
        to: to,
        subject: subject,
        text: text,
        html: html,
        attachments: [{
            filename: 'Test.pdf',
            path: 'Test.pdf',
            contentType: 'application/pdf'
        }],
    })
    return info;
}

emailRouter.post("/send", async (req, res) => {
    const { to, subject, text, html } = req.body

    try {
        const info = await sendEmail(to, subject, text, html);
        res.status(200).json(info);
    } catch (error) {
        res.status(500).send(error.message);
    }
})

export { emailRouter };