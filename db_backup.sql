PGDMP  5    1                |            scrc-node-simulator    16.2 (Debian 16.2-1.pgdg120+2)    16.4 ]    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    16619    scrc-node-simulator    DATABASE     �   CREATE DATABASE "scrc-node-simulator" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';
 %   DROP DATABASE "scrc-node-simulator";
                postgres    false            �           1247    18587    simtypeenum    TYPE     I   CREATE TYPE public.simtypeenum AS ENUM (
    'SINGLE',
    'MULTIPLE'
);
    DROP TYPE public.simtypeenum;
       public          postgres    false            �            1259    18528    alerts    TABLE     �   CREATE TABLE public.alerts (
    "timestamp" integer NOT NULL,
    node_id character varying,
    status_code integer,
    error_message character varying
);
    DROP TABLE public.alerts;
       public         heap    postgres    false            �            1259    18527    alerts_timestamp_seq    SEQUENCE     �   CREATE SEQUENCE public.alerts_timestamp_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.alerts_timestamp_seq;
       public          postgres    false    233            �           0    0    alerts_timestamp_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.alerts_timestamp_seq OWNED BY public.alerts."timestamp";
          public          postgres    false    232            �            1259    18329    ccsp    TABLE     �   CREATE TABLE public.ccsp (
    ccsp_id character varying NOT NULL,
    ccsp_cert character varying,
    ccsp_key character varying
);
    DROP TABLE public.ccsp;
       public         heap    postgres    false            �            1259    18346    ctop    TABLE     X   CREATE TABLE public.ctop (
    id integer NOT NULL,
    ctop_token character varying
);
    DROP TABLE public.ctop;
       public         heap    postgres    false            �            1259    18345    ctop_id_seq    SEQUENCE     �   CREATE SEQUENCE public.ctop_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE public.ctop_id_seq;
       public          postgres    false    221            �           0    0    ctop_id_seq    SEQUENCE OWNED BY     ;   ALTER SEQUENCE public.ctop_id_seq OWNED BY public.ctop.id;
          public          postgres    false    220            �            1259    18431    mobius    TABLE     �   CREATE TABLE public.mobius (
    mobius_id integer NOT NULL,
    xm2m_origin character varying,
    xm2m_ri character varying
);
    DROP TABLE public.mobius;
       public         heap    postgres    false            �            1259    18430    mobius_mobius_id_seq    SEQUENCE     �   CREATE SEQUENCE public.mobius_mobius_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.mobius_mobius_id_seq;
       public          postgres    false    226            �           0    0    mobius_mobius_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.mobius_mobius_id_seq OWNED BY public.mobius.mobius_id;
          public          postgres    false    225            �            1259    18378    nodes    TABLE     �  CREATE TABLE public.nodes (
    node_id character varying NOT NULL,
    parameter json[],
    vertical_id integer,
    platform character varying,
    protocol character varying,
    frequency integer,
    services character varying,
    ccsp_id character varying,
    om2m_id integer,
    ctop_id integer,
    url character varying(255),
    port integer,
    mobius_id integer,
    user_id integer DEFAULT 1
);
    DROP TABLE public.nodes;
       public         heap    postgres    false            �            1259    18337    om2m    TABLE     �   CREATE TABLE public.om2m (
    id integer NOT NULL,
    om2m_username character varying,
    om2m_password character varying
);
    DROP TABLE public.om2m;
       public         heap    postgres    false            �            1259    18336    om2m_id_seq    SEQUENCE     �   CREATE SEQUENCE public.om2m_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE public.om2m_id_seq;
       public          postgres    false    219            �           0    0    om2m_id_seq    SEQUENCE OWNED BY     ;   ALTER SEQUENCE public.om2m_id_seq OWNED BY public.om2m.id;
          public          postgres    false    218            �            1259    18364 
   parameters    TABLE     �   CREATE TABLE public.parameters (
    id integer NOT NULL,
    name character varying,
    min_value double precision,
    max_value double precision,
    vertical_id integer,
    data_type character varying
);
    DROP TABLE public.parameters;
       public         heap    postgres    false            �            1259    18363    parameters_id_seq    SEQUENCE     �   CREATE SEQUENCE public.parameters_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.parameters_id_seq;
       public          postgres    false    223            �           0    0    parameters_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.parameters_id_seq OWNED BY public.parameters.id;
          public          postgres    false    222            �            1259    18578 
   predefined    TABLE     �   CREATE TABLE public.predefined (
    id integer NOT NULL,
    configuration json[] NOT NULL,
    sim_type character varying NOT NULL,
    user_id integer NOT NULL
);
    DROP TABLE public.predefined;
       public         heap    postgres    false            �            1259    18577    predefined_id_seq    SEQUENCE     �   CREATE SEQUENCE public.predefined_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.predefined_id_seq;
       public          postgres    false    235            �           0    0    predefined_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.predefined_id_seq OWNED BY public.predefined.id;
          public          postgres    false    234            �            1259    18519    simulations    TABLE     �   CREATE TABLE public.simulations (
    "timestamp" integer NOT NULL,
    node_ids character varying[],
    platform character varying,
    parameter character varying,
    success integer,
    failure integer,
    user_id integer DEFAULT 1
);
    DROP TABLE public.simulations;
       public         heap    postgres    false            �            1259    18518    simulations_timestamp_seq    SEQUENCE     �   CREATE SEQUENCE public.simulations_timestamp_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE public.simulations_timestamp_seq;
       public          postgres    false    231            �           0    0    simulations_timestamp_seq    SEQUENCE OWNED BY     Y   ALTER SEQUENCE public.simulations_timestamp_seq OWNED BY public.simulations."timestamp";
          public          postgres    false    230            �            1259    18475    token    TABLE     �   CREATE TABLE public.token (
    user_id integer,
    access_token character varying(450) NOT NULL,
    refresh_token character varying(450) NOT NULL,
    status boolean,
    created_date timestamp without time zone
);
    DROP TABLE public.token;
       public         heap    postgres    false            �            1259    18465    users    TABLE     '  CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(100) NOT NULL,
    user_type integer,
    platform_access character varying[],
    verticals integer[] DEFAULT ARRAY[1]
);
    DROP TABLE public.users;
       public         heap    postgres    false            �            1259    18464    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public          postgres    false    228            �           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public          postgres    false    227            �            1259    18319 	   verticals    TABLE     W   CREATE TABLE public.verticals (
    id integer NOT NULL,
    name character varying
);
    DROP TABLE public.verticals;
       public         heap    postgres    false            �            1259    18318    verticals_id_seq    SEQUENCE     �   CREATE SEQUENCE public.verticals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.verticals_id_seq;
       public          postgres    false    216            �           0    0    verticals_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.verticals_id_seq OWNED BY public.verticals.id;
          public          postgres    false    215            �           2604    18531    alerts timestamp    DEFAULT     v   ALTER TABLE ONLY public.alerts ALTER COLUMN "timestamp" SET DEFAULT nextval('public.alerts_timestamp_seq'::regclass);
 A   ALTER TABLE public.alerts ALTER COLUMN "timestamp" DROP DEFAULT;
       public          postgres    false    232    233    233            �           2604    18349    ctop id    DEFAULT     b   ALTER TABLE ONLY public.ctop ALTER COLUMN id SET DEFAULT nextval('public.ctop_id_seq'::regclass);
 6   ALTER TABLE public.ctop ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    220    221    221            �           2604    18434    mobius mobius_id    DEFAULT     t   ALTER TABLE ONLY public.mobius ALTER COLUMN mobius_id SET DEFAULT nextval('public.mobius_mobius_id_seq'::regclass);
 ?   ALTER TABLE public.mobius ALTER COLUMN mobius_id DROP DEFAULT;
       public          postgres    false    225    226    226            �           2604    18340    om2m id    DEFAULT     b   ALTER TABLE ONLY public.om2m ALTER COLUMN id SET DEFAULT nextval('public.om2m_id_seq'::regclass);
 6   ALTER TABLE public.om2m ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    218    219    219            �           2604    18367    parameters id    DEFAULT     n   ALTER TABLE ONLY public.parameters ALTER COLUMN id SET DEFAULT nextval('public.parameters_id_seq'::regclass);
 <   ALTER TABLE public.parameters ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    222    223    223            �           2604    18581    predefined id    DEFAULT     n   ALTER TABLE ONLY public.predefined ALTER COLUMN id SET DEFAULT nextval('public.predefined_id_seq'::regclass);
 <   ALTER TABLE public.predefined ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    235    234    235            �           2604    18522    simulations timestamp    DEFAULT     �   ALTER TABLE ONLY public.simulations ALTER COLUMN "timestamp" SET DEFAULT nextval('public.simulations_timestamp_seq'::regclass);
 F   ALTER TABLE public.simulations ALTER COLUMN "timestamp" DROP DEFAULT;
       public          postgres    false    230    231    231            �           2604    18468    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    227    228    228            �           2604    18322    verticals id    DEFAULT     l   ALTER TABLE ONLY public.verticals ALTER COLUMN id SET DEFAULT nextval('public.verticals_id_seq'::regclass);
 ;   ALTER TABLE public.verticals ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    215    216    216            �          0    18528    alerts 
   TABLE DATA           R   COPY public.alerts ("timestamp", node_id, status_code, error_message) FROM stdin;
    public          postgres    false    233   �g       �          0    18329    ccsp 
   TABLE DATA           <   COPY public.ccsp (ccsp_id, ccsp_cert, ccsp_key) FROM stdin;
    public          postgres    false    217   Eh       �          0    18346    ctop 
   TABLE DATA           .   COPY public.ctop (id, ctop_token) FROM stdin;
    public          postgres    false    221   j       �          0    18431    mobius 
   TABLE DATA           A   COPY public.mobius (mobius_id, xm2m_origin, xm2m_ri) FROM stdin;
    public          postgres    false    226   "j       �          0    18378    nodes 
   TABLE DATA           �   COPY public.nodes (node_id, parameter, vertical_id, platform, protocol, frequency, services, ccsp_id, om2m_id, ctop_id, url, port, mobius_id, user_id) FROM stdin;
    public          postgres    false    224   Zj       �          0    18337    om2m 
   TABLE DATA           @   COPY public.om2m (id, om2m_username, om2m_password) FROM stdin;
    public          postgres    false    219   nm       �          0    18364 
   parameters 
   TABLE DATA           \   COPY public.parameters (id, name, min_value, max_value, vertical_id, data_type) FROM stdin;
    public          postgres    false    223   �m       �          0    18578 
   predefined 
   TABLE DATA           J   COPY public.predefined (id, configuration, sim_type, user_id) FROM stdin;
    public          postgres    false    235   �m       �          0    18519    simulations 
   TABLE DATA           l   COPY public.simulations ("timestamp", node_ids, platform, parameter, success, failure, user_id) FROM stdin;
    public          postgres    false    231   �n       �          0    18475    token 
   TABLE DATA           [   COPY public.token (user_id, access_token, refresh_token, status, created_date) FROM stdin;
    public          postgres    false    229   p       �          0    18465    users 
   TABLE DATA           e   COPY public.users (id, username, email, password, user_type, platform_access, verticals) FROM stdin;
    public          postgres    false    228   W�       �          0    18319 	   verticals 
   TABLE DATA           -   COPY public.verticals (id, name) FROM stdin;
    public          postgres    false    216   �       �           0    0    alerts_timestamp_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.alerts_timestamp_seq', 1, false);
          public          postgres    false    232            �           0    0    ctop_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.ctop_id_seq', 1, false);
          public          postgres    false    220            �           0    0    mobius_mobius_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.mobius_mobius_id_seq', 5, true);
          public          postgres    false    225            �           0    0    om2m_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.om2m_id_seq', 25, true);
          public          postgres    false    218            �           0    0    parameters_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.parameters_id_seq', 1, true);
          public          postgres    false    222            �           0    0    predefined_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.predefined_id_seq', 7, true);
          public          postgres    false    234            �           0    0    simulations_timestamp_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public.simulations_timestamp_seq', 1, false);
          public          postgres    false    230            �           0    0    users_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.users_id_seq', 12, true);
          public          postgres    false    227            �           0    0    verticals_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.verticals_id_seq', 3, true);
          public          postgres    false    215            �           2606    18535    alerts alerts_pkey 
   CONSTRAINT     Y   ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_pkey PRIMARY KEY ("timestamp");
 <   ALTER TABLE ONLY public.alerts DROP CONSTRAINT alerts_pkey;
       public            postgres    false    233            �           2606    18335    ccsp ccsp_pkey 
   CONSTRAINT     Q   ALTER TABLE ONLY public.ccsp
    ADD CONSTRAINT ccsp_pkey PRIMARY KEY (ccsp_id);
 8   ALTER TABLE ONLY public.ccsp DROP CONSTRAINT ccsp_pkey;
       public            postgres    false    217            �           2606    18353    ctop ctop_pkey 
   CONSTRAINT     L   ALTER TABLE ONLY public.ctop
    ADD CONSTRAINT ctop_pkey PRIMARY KEY (id);
 8   ALTER TABLE ONLY public.ctop DROP CONSTRAINT ctop_pkey;
       public            postgres    false    221            �           2606    18438    mobius mobius_pkey 
   CONSTRAINT     W   ALTER TABLE ONLY public.mobius
    ADD CONSTRAINT mobius_pkey PRIMARY KEY (mobius_id);
 <   ALTER TABLE ONLY public.mobius DROP CONSTRAINT mobius_pkey;
       public            postgres    false    226            �           2606    18386    nodes nodes_ccsp_id_key 
   CONSTRAINT     U   ALTER TABLE ONLY public.nodes
    ADD CONSTRAINT nodes_ccsp_id_key UNIQUE (ccsp_id);
 A   ALTER TABLE ONLY public.nodes DROP CONSTRAINT nodes_ccsp_id_key;
       public            postgres    false    224            �           2606    18390    nodes nodes_ctop_id_key 
   CONSTRAINT     U   ALTER TABLE ONLY public.nodes
    ADD CONSTRAINT nodes_ctop_id_key UNIQUE (ctop_id);
 A   ALTER TABLE ONLY public.nodes DROP CONSTRAINT nodes_ctop_id_key;
       public            postgres    false    224            �           2606    18440    nodes nodes_mobius_id_key 
   CONSTRAINT     Y   ALTER TABLE ONLY public.nodes
    ADD CONSTRAINT nodes_mobius_id_key UNIQUE (mobius_id);
 C   ALTER TABLE ONLY public.nodes DROP CONSTRAINT nodes_mobius_id_key;
       public            postgres    false    224            �           2606    18388    nodes nodes_om2m_id_key 
   CONSTRAINT     U   ALTER TABLE ONLY public.nodes
    ADD CONSTRAINT nodes_om2m_id_key UNIQUE (om2m_id);
 A   ALTER TABLE ONLY public.nodes DROP CONSTRAINT nodes_om2m_id_key;
       public            postgres    false    224            �           2606    18384    nodes nodes_pkey 
   CONSTRAINT     S   ALTER TABLE ONLY public.nodes
    ADD CONSTRAINT nodes_pkey PRIMARY KEY (node_id);
 :   ALTER TABLE ONLY public.nodes DROP CONSTRAINT nodes_pkey;
       public            postgres    false    224            �           2606    18344    om2m om2m_pkey 
   CONSTRAINT     L   ALTER TABLE ONLY public.om2m
    ADD CONSTRAINT om2m_pkey PRIMARY KEY (id);
 8   ALTER TABLE ONLY public.om2m DROP CONSTRAINT om2m_pkey;
       public            postgres    false    219            �           2606    18371    parameters parameters_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.parameters
    ADD CONSTRAINT parameters_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.parameters DROP CONSTRAINT parameters_pkey;
       public            postgres    false    223            �           2606    18585    predefined predefined_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.predefined
    ADD CONSTRAINT predefined_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.predefined DROP CONSTRAINT predefined_pkey;
       public            postgres    false    235            �           2606    18526    simulations simulations_pkey 
   CONSTRAINT     c   ALTER TABLE ONLY public.simulations
    ADD CONSTRAINT simulations_pkey PRIMARY KEY ("timestamp");
 F   ALTER TABLE ONLY public.simulations DROP CONSTRAINT simulations_pkey;
       public            postgres    false    231            �           2606    18481    token token_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.token
    ADD CONSTRAINT token_pkey PRIMARY KEY (access_token);
 :   ALTER TABLE ONLY public.token DROP CONSTRAINT token_pkey;
       public            postgres    false    229            �           2606    18474    users users_email_key 
   CONSTRAINT     Q   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
 ?   ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key;
       public            postgres    false    228            �           2606    18470    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public            postgres    false    228            �           2606    18472    users users_username_key 
   CONSTRAINT     W   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);
 B   ALTER TABLE ONLY public.users DROP CONSTRAINT users_username_key;
       public            postgres    false    228            �           2606    18326    verticals verticals_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.verticals
    ADD CONSTRAINT verticals_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.verticals DROP CONSTRAINT verticals_pkey;
       public            postgres    false    216            �           1259    18377    ix_parameters_id    INDEX     E   CREATE INDEX ix_parameters_id ON public.parameters USING btree (id);
 $   DROP INDEX public.ix_parameters_id;
       public            postgres    false    223            �           1259    18327    ix_verticals_id    INDEX     C   CREATE INDEX ix_verticals_id ON public.verticals USING btree (id);
 #   DROP INDEX public.ix_verticals_id;
       public            postgres    false    216            �           1259    18328    ix_verticals_name    INDEX     N   CREATE UNIQUE INDEX ix_verticals_name ON public.verticals USING btree (name);
 %   DROP INDEX public.ix_verticals_name;
       public            postgres    false    216            �           2606    18441    nodes fk_nodes_mobius    FK CONSTRAINT     ~   ALTER TABLE ONLY public.nodes
    ADD CONSTRAINT fk_nodes_mobius FOREIGN KEY (mobius_id) REFERENCES public.mobius(mobius_id);
 ?   ALTER TABLE ONLY public.nodes DROP CONSTRAINT fk_nodes_mobius;
       public          postgres    false    224    226    3294            �           2606    18592    nodes fk_user    FK CONSTRAINT     l   ALTER TABLE ONLY public.nodes
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id);
 7   ALTER TABLE ONLY public.nodes DROP CONSTRAINT fk_user;
       public          postgres    false    3298    228    224            �           2606    18396    nodes nodes_ccsp_id_fkey    FK CONSTRAINT     {   ALTER TABLE ONLY public.nodes
    ADD CONSTRAINT nodes_ccsp_id_fkey FOREIGN KEY (ccsp_id) REFERENCES public.ccsp(ccsp_id);
 B   ALTER TABLE ONLY public.nodes DROP CONSTRAINT nodes_ccsp_id_fkey;
       public          postgres    false    3275    217    224            �           2606    18406    nodes nodes_ctop_id_fkey    FK CONSTRAINT     v   ALTER TABLE ONLY public.nodes
    ADD CONSTRAINT nodes_ctop_id_fkey FOREIGN KEY (ctop_id) REFERENCES public.ctop(id);
 B   ALTER TABLE ONLY public.nodes DROP CONSTRAINT nodes_ctop_id_fkey;
       public          postgres    false    224    3279    221            �           2606    18401    nodes nodes_om2m_id_fkey    FK CONSTRAINT     v   ALTER TABLE ONLY public.nodes
    ADD CONSTRAINT nodes_om2m_id_fkey FOREIGN KEY (om2m_id) REFERENCES public.om2m(id);
 B   ALTER TABLE ONLY public.nodes DROP CONSTRAINT nodes_om2m_id_fkey;
       public          postgres    false    224    3277    219            �           2606    18391    nodes nodes_vertical_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.nodes
    ADD CONSTRAINT nodes_vertical_id_fkey FOREIGN KEY (vertical_id) REFERENCES public.verticals(id);
 F   ALTER TABLE ONLY public.nodes DROP CONSTRAINT nodes_vertical_id_fkey;
       public          postgres    false    216    3273    224            �           2606    18372 &   parameters parameters_vertical_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.parameters
    ADD CONSTRAINT parameters_vertical_id_fkey FOREIGN KEY (vertical_id) REFERENCES public.verticals(id);
 P   ALTER TABLE ONLY public.parameters DROP CONSTRAINT parameters_vertical_id_fkey;
       public          postgres    false    3273    223    216            �   ~   x�]�1!@�z8�\@�c6�^��چ���`X��ۻ&T�?y�fGtbr3\K�YK��M��k���Q�FC����dA�u�%�Ąo�	�"��[��Q^#s'��Rk��YRU|K�D�?d�Gc��-�      �   �  x�Ŗ�O�0���_��#�kW�7#$� �?�K2ǌdd+��V�{a�lȒ�w�ݵw�q��H����J��2-J!�����\�|-�*��a�}n��̋���8Y����Z�]����$-d��%�L��p��)�i�|�e�}:�NRHO�E�l����L��@�z�7��>���p=	%Jo@ky
."@�D^���U���g��������������;xj� �p��:��G����ס�<w���W����]B]�nC�n P�����i 'cOŠN���S��� �D4^~�|U�"m|"I�a���Y���24 +����W5 �l���jA���@u�pP��Wiڨ�{�\�@Ԫ�Ƴ�e/q`S>wռ�^�G�E�cM�$ب�h<��K�U+�����^�V{u�%�;�Qd���k�?���7�<J      �      x������ � �      �   (   x�3��/�L���44261�2B���M���h�=... ���      �     x��Y[o�0~�_1�i��s|��ۤE�˺�/}���iHr�զ��}6$,��W��� 2|��wnN���1`uxO���|�Ei�.���i�"W�+�=�~-��CuH5�d'�H�G�xy���n����|��o<d���(6ד	� ��$�o����l��vg�2a��x�S(��]�,��"YUs��UTD����~x��g'V�����_S�.!�������(��r�A�M��״@�g԰r��27[Y-� )�Ȑ_Z�"N7�.*v�e`�p!���c�Gڬ'�l��g�Ғܟ�׹F?`m�W� ����Z Y�@J�t��s_��J�,v����p�慚��IIB�I�SƗ޵�h�0��� P��6����w*� A���Ή�;�4�/'��I%��]ym��Z}��y(M�'g�U�F�e��+A0ɥ�(P��gj-���UVb$*\+�ׂ��`҉K���:�A�7$vu�\�U��U�L�*�Bv!'~n2z���~�P��JN�}�S�Sæ#��0=+�۫s߮V��+JJ,���)P-��^�KUP��]�\�G҇̡�N�@X�9Ҽ1Se�E��N�i�=yؿ��ޛ��+mB�����M)���k�;41����籖�rƁGܐ������Iȡ'�)\�\4�7�-�r6<q�!o�iA�tYy��V	N�(�{U4���W�Rk;�I�
�knI��i��\I�ݥN
��X̫�Z9Xz)m�-n�;�D"�u��t�E��\8���� -��o      �   Q   x�UΫ�PA�+�p.�^0$�/�1���t�����V��M��-��m��ep�ʉ���H�����RU�JU�*U���[kP6qV      �       x�3��52�44�46�4���+����� 7`V      �   �   x�3�V���Q��OI��L���DqIQf^:�������%W���b�E���%�E�`�h�!@�&�f�A��At�&V�����rK��r��/(�/�O�����U���-�)�,�I�4�2��0��p�������o�L��ob���� ��ũ      �   W  x����j�@���)����/\tᶴ�Z$�.c��P(�{'�&��8�d`f��s.������=��s�T1�����1]���c��]�{�Yf�;ݛl�0�)�ү�	��A�C�R��bj��ӜrA[�o�@@�8�g���z��'���ÞenLO��~tǺm�hb5Q��k���Fa�Fu�(N�*J1,�.�	�HU��+��4�6�U��o�
�SM�:7iP)\%:c��oD���>�Ǒ�ȩٴ�c�����U[��Ӧ��"=��!��S�w��"�YP�`��1\�m
Y���_V:��`���Yii;�'�Ү��Ď餍4���D�鵊dV�N�Z�d�O��k ۉ      �      x���َ�Z���z�� �C��#�Ԓel���M���NS�RI%���;"V��_:K����c!��"�Z!>��DcZ���滴D��թ@ǒ�Յ�E�����K��{��ދ��2��ဝH�hqRr�@�)�̰�F#��n��6�|�T��lC�胮;T��u˝t;w6��
sΑS�*��� !;܁�? ��_0�0'�?�f�f�?�ve4��D�i�\/�\,cmsͽ/�aT�|��g�;~��Q딝5D��tQh���<"�<Ä&�y��w/"{�Q���#C�+sBb�0���y۪]�M�H�\�+|:a��ۜ���q|�:����+�����)P5V�|������Ox | {Epَ���-,�*�����}��ÒH7��SUT��P9?��֜����A�����F^���#֫���)�'��N��Ë�8�/ ؓ ��/p ���$e\8$�-���X-x�a?�4>:���4A}d+q���HG�3 S���=�&�c��C�:�*EY?�ۮz�_0��0��~�;��������d˂�VN�H�����ӹ�D&�u��LI��vt�0t)(���c����Q�Б��v^�e�z���8�/[s	�v���3�G5ll��A�
����+ϵ�;����p-�й�Ix~lš�t���e��o��DFeZ��
s�r���ޚ��w�h���J|��BA���P���%����8{4,��z`����k�|��@�	�!�qs��ݷ�D�S�E�ǎ�������������@��d�?p�_(���{ a��n
�j=�_a9�}���1p�\P���r�`�;1��1�OjgJ������5���K=8�9�x������TU����$�k�2�c�k��7�WE�`r�8 ��q�?�wX�!1ԩ-�q���a��n'7��aG����Kl�Q�tO� ?��K��UE����!+B�bΚr�89������@�W�A @q��qE�3�H���1%Ѱ�.���p�k��}��Aϱpx�ݫ�_�M�tI�C��������.e#*�4��S���a�����@��/�B�=
��ڕn���;�aa����$SE��R��ы��̧'\�u�(�@��I_q���7]$aCt΢A��F*��><Zةx$��P���Zx|Á��܁�(!��1���3,6��JpjHh�Ь >F#�ڇ���� �p5�6�2q3��H��V�kP��p��>2K$d/h�
���F���8е1� �����h�[Jc𼞐�A�Au��`Ľ~-{�L�OFe���Ҕ~��{� ?�(�;a7�<�G���o�������=~�GPB�q�_ ��H ��_��?|K]���5�N�l�q��O�<�����T�`K���4�l3�.����a� �`��d��k���KC�>t���D)���t@H`�/p ����v.�Տ�b�t�i��!xyx.T4��H���No�!�t�0��3�����ڏ�ꆅ��B�)�g��L#���j�xǁ��Rh���־�cM�o�3yr=��`�>$p4,y�H� O!��EaN��n�1}ЍI�#G�4b������v���1����.�ћ&����B��+u�¡}��{����:rs�[�&�Ofr�ú�)�����"Nt^ሠ���"���R�ģ��RqN=Kp�59$�%�Z�_�,��Zg��l��/u�ܐk�*��)��OB�ˮ�݋۴����q[S��1�5�"@�[�D;9	��?�Uz���r\$>+��iR!�A\��� ���ξ%x�R�ˋ�"��Mn�]{�L�n�c'1��V��ko.,��Aw�偵����d�P���m�"�z���8�i���̤+p=��_��_R��3�t8Y:]�(�Ǭ�ǃăs8]
��߆G�]����䃮zR��:��BM.&��7�G�i%]��qx d�~:���{ @�8H��2Z�g��"��D��p�P�n{l-���mfP��8T䃮ԩ95�i.�.6���Zѥa��
b<�6}띟M�k���� �����Z:?�
R~��:��%9E���9.�zh@N~3g�@<�%c�ٲ���)�M�ҳ��<0���/����}B С`��r�wkaA�$�/,K����Ͳ M�q?R&0��H|<��\�{ qd�D:�5k�[q�ݬ�� .M-����`Lբݹ#w��C��|����ؓk�@���oG��߮�I*S0��j'O��s��8ovK�f�`��fe�^��]��	���Y0���')�L5�/�qR�ܜ�D`��T
#��q��%^����P�#4�ȑ����SU��F���!u󤒨���1���A7�U��>�t��{=rL}���(�KB]�5|��q�{*�����	�A�78�������RCG�ˍ�vMJ�(�7=7�H(�����P>K���X>�*'D/,�gX�qG���)��5�32�P� ���T�O8 x#@��t��C+�C���[}c<�b,n��UUEFe�w���Ɂ�6�ǻn۷�{2sA���)N���-���@8�2'��⧿�ƱZ"P�7�cV�gX����nƧo>5eW�gg�:��j6G6�'��lh���u��0��`0���UcZ�hx:4�fW��>]S�8��X-
A�0��o3���C��v�'�7A�ZvY�����s����K�t�0�S:cm��H;�����.�;��  =����A%�_L�5ÿ����Y��E�s�#� ˙�$UK����P��V�Gٶ����A�{��)�/��F	��4hnle�Hȅ����\B�d���_ ���|��t,���i��)�q=�����]YI�򴘈�̈9?�W��nX��hetL<�MM��Bw�Γ�mg�S '���?��8�������5��>4�w9����1:!�������w\��?*m�=����i���O���ytj,$�8[��B�
��ɤ��s�~!��I�Q �ZX���&���Uq���D:�<^�N/��.8����ͳ0>�����SV�v�R�`Cg�+����a���� »�m� ��� �1�@~�PߛÅ�n���q" S�=�z8;�uG��Mƛ���j؎��*�[���"�,N.�@��>>Apγ������Q���@���oS
࿙����~sRp�8zv��}��]ء���O.a�>s����m��3~���%��$��?������Dy�_�vW��㐇��|:���A�7/�a��@�?	�{q��b�#��+iR>yR�"\?b���r��dr7��x�He��+��n��f9wKLܜQ��T_��N}$�E6�JE?av�~���� d�� ���8l
�ʿ����MLu�A]��n�y��t"�$�����e�W}ka)c�.q���+�8�̈́������>��������-�A_�,�����`��6�����)��_*I�p��\�Kk�����-C�
x���&f[{�2�?覥>�voՏƭ�e����I�-��v3Y.{ϋ���,�kC�jJAd{*}�U�m��t'M��`��N',����h0�=���H����n����A�g0�,,0M+�g�	�s���w;��>ֱo#�O�����C$�"�r3T-�.x�+�zyvPWq��D]Ʊ�)�yQO^V��0�I�zp7��j��;G��Y�1�K�5�c��I��ݝ�69)��8w�����s��#[G�����I|P̣��������)�����
lJ�ht�{j�QR�����7],v�����D�I)g1Wv�n*kJ[�:`@x���ٿq`��k��.��
��6�E�]X�]��WX���,B�A��#���Cro��ՓI���ݶ����~[��]X��
0H���M1�5����o�r��J0R%� �R|T?p _0�����X�/pĐ�8?�B��9�F~ 5  ���S��e0�=��C�A�0�6C��xm��t��%,�>�sT����(n���_Jy���I�%�����%��q E6OеZT��:�O�A��m�.a`�����<U7�Iy#�������XӨ~н㌙6m�X1�̺2g���7��ͽ�zN{�g$��f!� p= Ln��+�ך��:0ה�>�����Kp�*��̵��YC�\��_�m�V�,���B�nGU?Mآ�I!����hRE|�.Vž�X����G�/k�����;4����u�.��+@Mp��Tpm�ИH-��d�T�$�fh_/;��`N^��8��E����ũx�s��"<�	z���Ѿ�@�Px�l�:��Z�a�y�;�6/��	�d+;#�,9��;��)�ۣ���lćm�T]�.&E�~.��
,iL�	f7�,6aS�W-h��4T��8�g����_ �m;�j��˰��X=k�i����Ho_k��wK�]�j�������Њ����]T�=@�Z�0{�#�x�ǉ@��3�"�Ӣ�U����q�?���R�1|��V�3j����o9��`��ve�Lx�fZ�=+�6�q:2����0n���TLJ�3�h�E��x��x��|���?߀�=� 8��E�G��?�Q(�:�~��;�L���6g���͉͞.y�5u]8�6�x�H{��h?�{�t���/�[�D�\v�k�R[H��Y�n �����2��0�/�z`u�����˲;�4�l�� �,�G�E-�0\�bŏ�(��h�S(um�)��n&/�z�����A��Im�uJ�b�nZ>M� �߳@; �~���w(A��fe��[�'���ճ�a��� Qw��_�����v��FN�M+ZuZ[0䃮-�}�E3 ��f���f�J���N���U"��K��ZV^K8È�/�U@�c��T�ngG��tIs�X��R��5/��9e.
<+ܨ�0oS7��󚕾�����p^��3F�Rn�y3ۛ�;}�W3g��[��q �@���5[/	C���ϟ?�� �*      �   �  x�m��r�P���)z�e
��]4�+B��\�g�B Sy�N4�J7����W�a��Fy�|a��p��ѧ;����_��Vh���eZ�
L�|I<ʛ�8c���
%2�GU���X��.>ߗ9���W�m���qqˇk~g=w��O&7p=��A!�b�t�q�v�A%sG�L��ze����Pߘ��<�-�i<P�4��d�9.&�=���(1��T!��G0��"��W-ܔ�,����u��&��h���/���sc��3��m_������eh�vs���~��0;�Q��S_�K�5n���K��yjv!~�G�Q_Y����:=�:�*��قxZU��O���E=|I7����_��|2��6��p�8��l"�RniC�K�lIHV~V�M��Q8�f��>�,����2u�
�����9���TG�m��|�5i�T";Eg��K���70����k
�IÏE�G�c�)�۲�u\�]��g\x|L�d-'!cB��/)�=�PC��Ϥff���{|���F�X���F��˲輽������"f�ψfF�#�Sz��r;�?����"T�]Ɛ�m��(����\O�lk�'}ڋ���ݴ�wr��N
�1kc����~��&&��E?Z      �      x�3�t�2��2�t������ $�E     