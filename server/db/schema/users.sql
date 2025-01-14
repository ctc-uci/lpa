CREATE TABLE IF NOT EXISTS public.users
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    email character varying(256) COLLATE pg_catalog."default" NOT NULL,
    firebase_uid character varying(128) COLLATE pg_catalog."default" NOT NULL,
    first_name character varying(256) COLLATE pg_catalog."default" NOT NULL,
    last_name character varying(256) COLLATE pg_catalog."default" NOT NULL,
    edit_perms boolean NOT NULL DEFAULT false,
    CONSTRAINT user_pkey PRIMARY KEY (id),
    CONSTRAINT email UNIQUE (email),
    CONSTRAINT firebase_uid UNIQUE (firebase_uid)
)
