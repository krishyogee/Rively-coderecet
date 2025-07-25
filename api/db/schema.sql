SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: company_updates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_updates (
    id integer NOT NULL,
    company_update_uid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(500) NOT NULL,
    description text NOT NULL,
    update_category character varying(255) NOT NULL,
    update_type character varying(255) NOT NULL,
    source_type character varying(255) NOT NULL,
    source_url character varying(500) NOT NULL,
    posted_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    action_point text,
    tracked_company_uid uuid NOT NULL,
    is_saved boolean DEFAULT false
);


--
-- Name: company_updates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.company_updates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: company_updates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.company_updates_id_seq OWNED BY public.company_updates.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    customer_uid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    domain character varying(255),
    subscription_uid uuid,
    is_trial_expired boolean DEFAULT false,
    is_subscription_active boolean DEFAULT false,
    is_verified boolean DEFAULT false,
    verification_token character varying(255),
    verification_token_sent_at timestamp with time zone,
    onboarding_completion boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    customer_context text,
    owner_id integer
);


--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    department_uid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(50) NOT NULL
);


--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: email_recipients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_recipients (
    id integer NOT NULL,
    email_recipient_uid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    department_uid uuid NOT NULL,
    customer_uid uuid NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: email_recipients_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.email_recipients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: email_recipients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.email_recipients_id_seq OWNED BY public.email_recipients.id;


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying(128) NOT NULL
);


--
-- Name: tracked_companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tracked_companies (
    id integer NOT NULL,
    tracked_company_uid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    domain character varying(256) NOT NULL,
    type character varying(255) NOT NULL,
    interests character varying(255)[] NOT NULL,
    customer_uid uuid NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    linkedin_username character varying(255),
    changelogs_url character varying(255),
    isactive boolean DEFAULT true NOT NULL
);


--
-- Name: COLUMN tracked_companies.isactive; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.tracked_companies.isactive IS 'Flag indicating whether the company tracking is active';


--
-- Name: tracked_companies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tracked_companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tracked_companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tracked_companies_id_seq OWNED BY public.tracked_companies.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    user_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255),
    email character varying(255) NOT NULL,
    is_verified boolean DEFAULT false,
    customer_uid uuid,
    created_at timestamp with time zone DEFAULT now(),
    role character varying(50),
    clerk_id character varying,
    department_uid uuid
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: company_updates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_updates ALTER COLUMN id SET DEFAULT nextval('public.company_updates_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: email_recipients id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_recipients ALTER COLUMN id SET DEFAULT nextval('public.email_recipients_id_seq'::regclass);


--
-- Name: tracked_companies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tracked_companies ALTER COLUMN id SET DEFAULT nextval('public.tracked_companies_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: company_updates company_updates_company_update_uid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_updates
    ADD CONSTRAINT company_updates_company_update_uid_key UNIQUE (company_update_uid);


--
-- Name: company_updates company_updates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_updates
    ADD CONSTRAINT company_updates_pkey PRIMARY KEY (id);


--
-- Name: customers customers_customer_uid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_customer_uid_key UNIQUE (customer_uid);


--
-- Name: customers customers_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_email_key UNIQUE (email);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: departments departments_department_uid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_department_uid_key UNIQUE (department_uid);


--
-- Name: departments departments_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key UNIQUE (name);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: email_recipients email_recipients_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_recipients
    ADD CONSTRAINT email_recipients_email_key UNIQUE (email);


--
-- Name: email_recipients email_recipients_email_recipient_uid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_recipients
    ADD CONSTRAINT email_recipients_email_recipient_uid_key UNIQUE (email_recipient_uid);


--
-- Name: email_recipients email_recipients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_recipients
    ADD CONSTRAINT email_recipients_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: tracked_companies tracked_companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tracked_companies
    ADD CONSTRAINT tracked_companies_pkey PRIMARY KEY (id);


--
-- Name: tracked_companies tracked_companies_tracked_company_uid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tracked_companies
    ADD CONSTRAINT tracked_companies_tracked_company_uid_key UNIQUE (tracked_company_uid);


--
-- Name: users users_clerk_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_clerk_id_key UNIQUE (clerk_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_user_id_key UNIQUE (user_id);


--
-- Name: tracked_companies fk_customer; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tracked_companies
    ADD CONSTRAINT fk_customer FOREIGN KEY (customer_uid) REFERENCES public.customers(customer_uid);


--
-- Name: email_recipients fk_customer; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_recipients
    ADD CONSTRAINT fk_customer FOREIGN KEY (customer_uid) REFERENCES public.customers(customer_uid);


--
-- Name: users fk_customer_uid; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_customer_uid FOREIGN KEY (customer_uid) REFERENCES public.customers(customer_uid);


--
-- Name: email_recipients fk_department; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_recipients
    ADD CONSTRAINT fk_department FOREIGN KEY (department_uid) REFERENCES public.departments(department_uid);


--
-- Name: customers fk_owner; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: company_updates fk_tracked_company; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_updates
    ADD CONSTRAINT fk_tracked_company FOREIGN KEY (tracked_company_uid) REFERENCES public.tracked_companies(tracked_company_uid);


--
-- Name: users users_department_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_department_uid_fkey FOREIGN KEY (department_uid) REFERENCES public.departments(department_uid);


--
-- PostgreSQL database dump complete
--


--
-- Dbmate schema migrations
--

INSERT INTO public.schema_migrations (version) VALUES
    ('20250620034553'),
    ('20250620034700'),
    ('20250620034952'),
    ('20250620035139'),
    ('20250620040437'),
    ('20250620040600'),
    ('20250620052133'),
    ('20250703060020'),
    ('20250709110217'),
    ('20250710063225');
