CREATE TABLE IF NOT EXISTS public.rooms
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    name character varying(256) COLLATE pg_catalog."default" NOT NULL,
    description character varying(256) COLLATE pg_catalog."default",
    rate numeric NOT NULL,
    CONSTRAINT room_pkey PRIMARY KEY (id)
)
