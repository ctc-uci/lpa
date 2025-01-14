CREATE TABLE IF NOT EXISTS public.comments
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    user_id integer NOT NULL,
    booking_id integer,
    invoice_id integer NOT NULL,
    datetime timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    comment text COLLATE pg_catalog."default" NOT NULL,
    adjustment_type adjustment NOT NULL DEFAULT 'none'::adjustment,
    adjustment_value numeric NOT NULL DEFAULT 0,
    CONSTRAINT comment_pkey PRIMARY KEY (id),
    CONSTRAINT booking_id FOREIGN KEY (booking_id)
        REFERENCES public.bookings (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT invoice_id FOREIGN KEY (invoice_id)
        REFERENCES public.invoices (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT user_id FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);
