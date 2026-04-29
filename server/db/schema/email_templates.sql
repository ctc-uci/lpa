CREATE TABLE IF NOT EXISTS public.email_templates
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    body text NOT NULL,
    CONSTRAINT email_templates_pkey PRIMARY KEY (id)
);

INSERT INTO public.email_templates (body)
SELECT 'Hello,

    This is a friendly reminder regarding your upcoming payment. Please ensure that all the necessary details have been updated in our records for timely processing. If there are any changes or concerns regarding the payment, please don''t hesitate to reach out to us.

    Thank you for your cooperation. We truly appreciate your partnership. Should you have any questions or require further assistance, feel free to contact us.

    Best Regards,

    La Peña Team
    classes@lapena.com
    La Peña Cultural Center
    3105 Shattuck Ave., Berkeley, CA 94705
    lapena.org'
WHERE NOT EXISTS (SELECT 1 FROM public.email_templates);
