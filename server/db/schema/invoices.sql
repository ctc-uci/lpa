CREATE TABLE IF NOT EXISTS public.invoices
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    event_id integer NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    is_sent boolean NOT NULL DEFAULT false,
    payment_status payment NOT NULL DEFAULT 'none'::payment,
    CONSTRAINT invoice_pkey PRIMARY KEY (id),
    CONSTRAINT event_id FOREIGN KEY (event_id)
        REFERENCES public.events (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);
