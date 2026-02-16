SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: building; Type: TABLE DATA; Schema: device_comm_example; Owner: postgres
--

COPY device_comm_example.building (building_id, name, address, city, state, country, created_at) FROM stdin;
1	Uno	Rua Aleatoria 100	Blumenau	SC	Brazil	2025-10-06 14:36:30.668739+00
2	Dos	Av Exemplo 200	Blumenau	SC	Brazil	2025-10-06 14:36:30.668739+00
\.


--
-- Data for Name: device; Type: TABLE DATA; Schema: device_comm_example; Owner: postgres
--

COPY device_comm_example.device (device_id, building_id, device_type, model, serial_number, location_desc, installed_at, status, url) FROM stdin;
1	2	door	DoorModel-Y	DOOR-Dos-1	Door 1 at Dos	2025-10-06 00:58:23.902807+00	active	\N
2	2	reader	FaceReader-ModelB	READER-for-door-1-face-4406	Facial reader for DOOR-Dos-1	2025-10-06 11:18:02.935666+00	active	http://localhost:8101
3	2	door	DoorModel-Y	DOOR-Dos-2	Door 2 at Dos	2025-10-06 11:56:25.313603+00	active	\N
4	2	door	DoorModel-Y	DOOR-Dos-3	Door 3 at Dos	2025-10-06 14:25:13.153345+00	active	\N
5	2	reader	FaceReader-ModelB	READER-for-door-4-face-9473	Facial reader for DOOR-Dos-3	2025-10-06 02:11:31.6727+00	active	http://localhost:8102
6	2	reader	RFIDReader-ModelC	READER-for-door-3-rfid-4669	RFID reader for DOOR-Dos-2	2025-10-06 07:39:49.816987+00	active	http://localhost:8103
7	2	reader	RFIDReader-ModelC	READER-for-door-4-rfid-229	RFID reader for DOOR-Dos-3	2025-10-06 02:55:51.42583+00	active	http://localhost:8104
8	1	door	DoorModel-X	DOOR-Uno-1	Door 1 at Uno	2025-10-06 04:11:20.932494+00	active	\N
9	1	reader	FaceReader-ModelA	READER-for-door-8-face-303	Facial reader for DOOR-Uno-1	2025-10-06 03:34:54.985405+00	active	http://localhost:8105
10	1	door	DoorModel-X	DOOR-Uno-2	Door 2 at Uno	2025-10-06 00:41:56.446747+00	active	\N
11	1	reader	FaceReader-ModelA	READER-for-door-10-face-7718	Facial reader for DOOR-Uno-2	2025-10-06 11:10:51.526138+00	active	http://localhost:8106
12	1	door	DoorModel-X	DOOR-Uno-3	Door 3 at Uno	2025-10-06 10:26:51.329629+00	active	\N
13	1	reader	FaceReader-ModelA	READER-for-door-12-face-3918	Facial reader for DOOR-Uno-3	2025-10-06 08:41:19.776764+00	active	http://localhost:8107
14	1	door	DoorModel-X	DOOR-Uno-4	Door 4 at Uno	2025-10-06 09:58:28.427024+00	active	\N
15	1	reader	FaceReader-ModelA	READER-for-door-14-face-5861	Facial reader for DOOR-Uno-4	2025-10-06 03:50:46.729755+00	active	http://localhost:8108
16	1	door	DoorModel-X	DOOR-Uno-5	Door 5 at Uno	2025-10-06 12:53:14.015786+00	active	\N
17	1	reader	FaceReader-ModelA	READER-for-door-16-face-7643	Facial reader for DOOR-Uno-5	2025-10-06 12:39:15.676851+00	active	http://localhost:8109
\.


--
-- Data for Name: door; Type: TABLE DATA; Schema: device_comm_example; Owner: postgres
--

COPY device_comm_example.door (device_id, door_name, room, is_locked, notes) FROM stdin;
1	DOOR-Dos-1	Room 1	f	auto-generated Dos door
3	DOOR-Dos-2	Room 3	f	auto-generated Dos door
4	DOOR-Dos-3	Room 4	f	auto-generated Dos door
8	DOOR-Uno-1	Room 8	f	auto-generated Uno door
10	DOOR-Uno-2	Room 10	f	auto-generated Uno door
12	DOOR-Uno-3	Room 12	f	auto-generated Uno door
14	DOOR-Uno-4	Room 14	f	auto-generated Uno door
16	DOOR-Uno-5	Room 16	f	auto-generated Uno door
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: device_comm_example; Owner: postgres
--

COPY device_comm_example."user" (user_id, first_name, last_name, email, phone, password_hash, apartment, building_id, created_at, active) FROM stdin;
1	user1	user1 (Uno)	user1.uno@example.com	+55224080782	$2b$10$8GY1yQ9WONlv8I8/z5A6w.14WoEX9/RvJETdBSbOqMS6ZqukMK2a2	Apt 1	1	2025-10-02 14:36:30.668739+00	t
2	user2	user2 (Uno)	user2.uno@example.com	+55158937096	$2b$10$8GY1yQ9WONlv8I8/z5A6w.14WoEX9/RvJETdBSbOqMS6ZqukMK2a2	Apt 2	1	2025-09-30 14:36:30.668739+00	t
3	user3	user3 (Uno)	user3.uno@example.com	+55639486543	$2b$10$8GY1yQ9WONlv8I8/z5A6w.14WoEX9/RvJETdBSbOqMS6ZqukMK2a2	Apt 3	1	2025-09-30 14:36:30.668739+00	t
4	user4	user4 (Uno)	user4.uno@example.com	+55449474376	$2b$10$8GY1yQ9WONlv8I8/z5A6w.14WoEX9/RvJETdBSbOqMS6ZqukMK2a2	Apt 4	1	2025-09-24 14:36:30.668739+00	t
5	user5	user5 (Uno)	user5.uno@example.com	+55225308309	$2b$10$8GY1yQ9WONlv8I8/z5A6w.14WoEX9/RvJETdBSbOqMS6ZqukMK2a2	Apt 5	1	2025-10-04 14:36:30.668739+00	t
6	user6	user6 (Uno)	user6.uno@example.com	+55880643616	$2b$10$8GY1yQ9WONlv8I8/z5A6w.14WoEX9/RvJETdBSbOqMS6ZqukMK2a2	Apt 6	1	2025-09-17 14:36:30.668739+00	t
7	user7	user7 (Uno)	user7.uno@example.com	+55795145360	$2b$10$8GY1yQ9WONlv8I8/z5A6w.14WoEX9/RvJETdBSbOqMS6ZqukMK2a2	Apt 7	1	2025-09-26 14:36:30.668739+00	t
8	user8	user8 (Uno)	user8.uno@example.com	+55462675383	$2b$10$8GY1yQ9WONlv8I8/z5A6w.14WoEX9/RvJETdBSbOqMS6ZqukMK2a2	Apt 8	1	2025-10-03 14:36:30.668739+00	t
9	user9	user9 (Uno)	user9.uno@example.com	+55212344655	$2b$10$8GY1yQ9WONlv8I8/z5A6w.14WoEX9/RvJETdBSbOqMS6ZqukMK2a2	Apt 9	1	2025-09-19 14:36:30.668739+00	t
10	user10	user10 (Uno)	user10.uno@example.com	+55533633919	$2b$10$8GY1yQ9WONlv8I8/z5A6w.14WoEX9/RvJETdBSbOqMS6ZqukMK2a2	Apt 10	1	2025-09-17 14:36:30.668739+00	t
11	user1	user1 (Dos)	user1.dos@example.com	+55596778051	$2b$10$8GY1yQ9WONlv8I8/z5A6w.14WoEX9/RvJETdBSbOqMS6ZqukMK2a2	Apt 1	2	2025-09-08 14:36:30.668739+00	t
12	user2	user2 (Dos)	user2.dos@example.com	+55692299997	$2b$10$8GY1yQ9WONlv8I8/z5A6w.14WoEX9/RvJETdBSbOqMS6ZqukMK2a2	Apt 2	2	2025-09-13 14:36:30.668739+00	t
13	user3	user3 (Dos)	user3.dos@example.com	+55305268618	$2b$10$8GY1yQ9WONlv8I8/z5A6w.14WoEX9/RvJETdBSbOqMS6ZqukMK2a2	Apt 3	2	2025-09-17 14:36:30.668739+00	t
14	user4	user4 (Dos)	user4.dos@example.com	+55264593223	$2b$10$8GY1yQ9WONlv8I8/z5A6w.14WoEX9/RvJETdBSbOqMS6ZqukMK2a2	Apt 4	2	2025-09-10 14:36:30.668739+00	t
15	user5	user5 (Dos)	user5.dos@example.com	+55881510822	$2b$10$8GY1yQ9WONlv8I8/z5A6w.14WoEX9/RvJETdBSbOqMS6ZqukMK2a2	Apt 5	2	2025-09-29 14:36:30.668739+00	t
16	user6	user6 (Dos)	user6.dos@example.com	+55252554938	$2b$10$8GY1yQ9WONlv8I8/z5A6w.14WoEX9/RvJETdBSbOqMS6ZqukMK2a2	Apt 6	2	2025-10-03 14:36:30.668739+00	t
17	user7	user7 (Dos)	user7.dos@example.com	+55281076100	$2b$10$8GY1yQ9WONlv8I8/z5A6w.14WoEX9/RvJETdBSbOqMS6ZqukMK2a2	Apt 7	2	2025-09-26 14:36:30.668739+00	t
18	user8	user8 (Dos)	user8.dos@example.com	+55871569482	$2b$10$8GY1yQ9WONlv8I8/z5A6w.14WoEX9/RvJETdBSbOqMS6ZqukMK2a2	Apt 8	2	2025-09-22 14:36:30.668739+00	t
19	user9	user9 (Dos)	user9.dos@example.com	+55311412562	$2b$10$8GY1yQ9WONlv8I8/z5A6w.14WoEX9/RvJETdBSbOqMS6ZqukMK2a2	Apt 9	2	2025-09-19 14:36:30.668739+00	t
20	user10	user10 (Dos)	user10.dos@example.com	+55718851538	$2b$10$8GY1yQ9WONlv8I8/z5A6w.14WoEX9/RvJETdBSbOqMS6ZqukMK2a2	Apt 10	2	2025-09-21 14:36:30.668739+00	t
\.


--
-- Data for Name: key; Type: TABLE DATA; Schema: device_comm_example; Owner: postgres
--

COPY device_comm_example."key" (key_id, user_id, key_type, key_subtype, key_data_hash, issued_at, expires_at, active, notes) FROM stdin;
1	11	physical	rfid	a84fc89c903f2c2f5d179cba20e8ee66	2025-02-20 08:42:30.900773+00	2026-10-06 14:36:30.668739+00	t	auto-generated rfid key for Dos
2	12	physical	rfid	57413f45bd478ec32cca5028cd7b4680	2025-05-13 20:53:41.867457+00	2026-10-06 14:36:30.668739+00	t	auto-generated rfid key for Dos
3	13	physical	rfid	c9056676b97efafd52f8cdb7562516a2	2025-01-27 21:42:09.576806+00	2026-10-06 14:36:30.668739+00	t	auto-generated rfid key for Dos
4	14	physical	rfid	5aa3020cc0dce2e3a3883bd088548b9f	2025-07-08 16:47:46.542898+00	2026-10-06 14:36:30.668739+00	t	auto-generated rfid key for Dos
5	15	physical	rfid	514578d5d37df83b796c2048167ea6b2	2024-11-19 01:14:25.222682+00	2026-10-06 14:36:30.668739+00	t	auto-generated rfid key for Dos
6	16	physical	rfid	7593b2e802ed08adc6ccedef4203f09f	2025-06-03 20:55:35.740628+00	2026-10-06 14:36:30.668739+00	t	auto-generated rfid key for Dos
7	17	physical	rfid	9821bb7722986dba87ca5af0a87cfa57	2025-09-09 17:35:23.364208+00	2026-10-06 14:36:30.668739+00	t	auto-generated rfid key for Dos
8	18	physical	rfid	e13a1558cb5edf46e12da23384393aa2	2024-12-07 05:25:40.171577+00	2026-10-06 14:36:30.668739+00	t	auto-generated rfid key for Dos
9	19	physical	rfid	a6bc19c71f9f904702ff28a624f2a68c	2025-06-17 01:54:37.686039+00	2026-10-06 14:36:30.668739+00	t	auto-generated rfid key for Dos
10	20	physical	rfid	697f137a7b2e8c6f4f72f2685fa84ca8	2025-02-28 14:18:48.407728+00	2026-10-06 14:36:30.668739+00	t	auto-generated rfid key for Dos
11	11	digital	face	9aa1c464bb07534de15d24a30bcc1d81	2025-08-31 18:22:58.203684+00	2026-10-06 14:36:30.668739+00	t	auto-generated face key for Dos
12	12	digital	face	36be275a1edb6f8ef8faaf2bbd50687c	2025-09-20 22:25:30.402241+00	2026-10-06 14:36:30.668739+00	t	auto-generated face key for Dos
13	13	digital	face	bd317a59803eeaea51f542362e48e722	2025-08-11 04:04:14.857358+00	2026-10-06 14:36:30.668739+00	t	auto-generated face key for Dos
14	14	digital	face	d1d40fcb0e9582ce8fccae3624a4dda6	2025-04-24 03:23:09.099204+00	2026-10-06 14:36:30.668739+00	t	auto-generated face key for Dos
15	15	digital	face	b046d8e52b4d3bdcdbab7dd9d9919e91	2025-02-11 14:35:17.626775+00	2026-10-06 14:36:30.668739+00	t	auto-generated face key for Dos
16	16	digital	face	b6b4e091cee3dad51d5efbbdd02dd43b	2025-01-29 07:13:49.188411+00	2026-10-06 14:36:30.668739+00	t	auto-generated face key for Dos
17	17	digital	face	785e6bd77b408ad090e7cd79627e927c	2025-06-18 00:06:20.714056+00	2026-10-06 14:36:30.668739+00	t	auto-generated face key for Dos
18	18	digital	face	887eeb82350a3f22fe698c2362f173f8	2025-07-24 11:24:05.33186+00	2026-10-06 14:36:30.668739+00	t	auto-generated face key for Dos
19	19	digital	face	7de45229b8548b4f64135a32bc4d9722	2025-07-12 20:54:20.283667+00	2026-10-06 14:36:30.668739+00	t	auto-generated face key for Dos
20	20	digital	face	3376b59c4e13c485e7ed33eed2257d4c	2025-09-29 13:49:46.166431+00	2026-10-06 14:36:30.668739+00	t	auto-generated face key for Dos
21	1	digital	face	cd9dfd7ece6ee97e583555fd198c0516	2025-09-21 08:56:51.907261+00	2026-10-06 14:36:30.668739+00	t	auto-generated face key for Uno
22	2	digital	face	14ac58c9ce705c85c5b3a0b7f356f30c	2025-02-07 15:26:35.204976+00	2026-10-06 14:36:30.668739+00	t	auto-generated face key for Uno
23	3	digital	face	757dc549eccbb8092cbcfc0909324bce	2025-09-01 12:21:42.177151+00	2026-10-06 14:36:30.668739+00	t	auto-generated face key for Uno
24	4	digital	face	137f38b55a26c77bdeca53da4ff7040c	2024-12-10 02:32:58.030088+00	2026-10-06 14:36:30.668739+00	t	auto-generated face key for Uno
25	5	digital	face	09127e6abecff598ca5968948e65cb1b	2025-03-13 23:17:01.135346+00	2026-10-06 14:36:30.668739+00	t	auto-generated face key for Uno
26	6	digital	face	83e6687420ab4fc6bebd91faed9730e4	2024-10-24 23:01:00.418231+00	2026-10-06 14:36:30.668739+00	t	auto-generated face key for Uno
27	7	digital	face	50e88d8c7545d581d9f66a13786d615b	2025-07-17 19:59:29.869365+00	2026-10-06 14:36:30.668739+00	t	auto-generated face key for Uno
28	8	digital	face	e934983544d63f30129ee16f9a32eb50	2025-05-27 03:04:51.079396+00	2026-10-06 14:36:30.668739+00	t	auto-generated face key for Uno
29	9	digital	face	b57a5e0933262da433bc315f72f7abd3	2025-05-05 20:20:40.407982+00	2026-10-06 14:36:30.668739+00	t	auto-generated face key for Uno
30	10	digital	face	fd4b1102271c146b0887172db4e66dad	2025-02-25 22:05:57.440559+00	2026-10-06 14:36:30.668739+00	t	auto-generated face key for Uno
\.


--
-- Data for Name: reader; Type: TABLE DATA; Schema: device_comm_example; Owner: postgres
--

COPY device_comm_example.reader (device_id, reader_type, firmware_version, door_device_id, mounted_height) FROM stdin;
2	biometric	v2.0	1	1.5m
5	biometric	v2.0	4	1.5m
6	rfid	v3.1	3	1.2m
7	rfid	v3.1	4	1.2m
9	biometric	v1.0	8	1.6m
11	biometric	v1.0	10	1.6m
13	biometric	v1.0	12	1.6m
15	biometric	v1.0	14	1.6m
17	biometric	v1.0	16	1.6m
\.


--
-- Data for Name: access_event; Type: TABLE DATA; Schema: device_comm_example; Owner: postgres
--

COPY device_comm_example.access_event (event_id, occurred_at, reader_id, device_id, key_id, user_id, allowed, reason, raw_payload) FROM stdin;
\.


--
-- Data for Name: key_authorization; Type: TABLE DATA; Schema: device_comm_example; Owner: postgres
--

COPY device_comm_example.key_authorization (key_id, reader_id, allowed, allowed_from, allowed_to, schedule_rule, created_at, created_by_user) FROM stdin;
1	7	t	2025-10-06 14:05:27.380272+00	\N	always	2025-10-06 14:36:30.668739+00	\N
2	7	t	2025-10-06 14:02:03.964355+00	\N	always	2025-10-06 14:36:30.668739+00	\N
1	6	t	2025-10-06 13:41:39.621257+00	\N	always	2025-10-06 14:36:30.668739+00	\N
2	6	t	2025-10-06 13:55:25.638285+00	\N	always	2025-10-06 14:36:30.668739+00	\N
3	6	t	2025-10-06 14:26:10.486836+00	\N	always	2025-10-06 14:36:30.668739+00	\N
4	6	t	2025-10-06 14:15:00.998943+00	\N	always	2025-10-06 14:36:30.668739+00	\N
5	6	t	2025-10-06 14:06:01.041662+00	\N	always	2025-10-06 14:36:30.668739+00	\N
6	6	t	2025-10-06 14:04:18.874958+00	\N	always	2025-10-06 14:36:30.668739+00	\N
7	6	t	2025-10-06 14:04:26.271453+00	\N	always	2025-10-06 14:36:30.668739+00	\N
8	6	t	2025-10-06 14:19:01.01522+00	\N	always	2025-10-06 14:36:30.668739+00	\N
9	6	t	2025-10-06 14:30:50.014453+00	\N	always	2025-10-06 14:36:30.668739+00	\N
10	6	t	2025-10-06 14:15:17.871856+00	\N	always	2025-10-06 14:36:30.668739+00	\N
11	2	t	2025-10-06 14:29:42.495165+00	\N	always	2025-10-06 14:36:30.668739+00	\N
11	5	t	2025-10-06 14:15:06.505031+00	\N	always	2025-10-06 14:36:30.668739+00	\N
12	2	t	2025-10-06 14:19:39.001172+00	\N	always	2025-10-06 14:36:30.668739+00	\N
12	5	t	2025-10-06 14:03:02.144738+00	\N	always	2025-10-06 14:36:30.668739+00	\N
13	2	t	2025-10-06 14:27:03.552093+00	\N	always	2025-10-06 14:36:30.668739+00	\N
13	5	t	2025-10-06 14:16:58.279005+00	\N	always	2025-10-06 14:36:30.668739+00	\N
14	2	t	2025-10-06 14:29:45.623134+00	\N	always	2025-10-06 14:36:30.668739+00	\N
14	5	t	2025-10-06 14:36:01.805155+00	\N	always	2025-10-06 14:36:30.668739+00	\N
15	2	t	2025-10-06 13:57:21.05661+00	\N	always	2025-10-06 14:36:30.668739+00	\N
15	5	t	2025-10-06 13:57:23.212545+00	\N	always	2025-10-06 14:36:30.668739+00	\N
16	2	t	2025-10-06 14:19:07.221+00	\N	always	2025-10-06 14:36:30.668739+00	\N
16	5	t	2025-10-06 13:50:02.385544+00	\N	always	2025-10-06 14:36:30.668739+00	\N
17	2	t	2025-10-06 13:46:05.951081+00	\N	always	2025-10-06 14:36:30.668739+00	\N
17	5	t	2025-10-06 14:23:43.884241+00	\N	always	2025-10-06 14:36:30.668739+00	\N
18	2	t	2025-10-06 13:38:13.562818+00	\N	always	2025-10-06 14:36:30.668739+00	\N
18	5	t	2025-10-06 13:38:45.675749+00	\N	always	2025-10-06 14:36:30.668739+00	\N
19	2	t	2025-10-06 13:39:22.278289+00	\N	always	2025-10-06 14:36:30.668739+00	\N
19	5	t	2025-10-06 14:11:38.728135+00	\N	always	2025-10-06 14:36:30.668739+00	\N
20	2	t	2025-10-06 13:48:23.069243+00	\N	always	2025-10-06 14:36:30.668739+00	\N
20	5	t	2025-10-06 13:54:03.924758+00	\N	always	2025-10-06 14:36:30.668739+00	\N
21	9	t	2025-09-28 23:36:26.625322+00	\N	always	2025-10-06 14:36:30.668739+00	\N
21	11	t	2025-10-02 04:40:26.466191+00	\N	always	2025-10-06 14:36:30.668739+00	\N
21	13	t	2025-09-11 09:51:14.439077+00	\N	always	2025-10-06 14:36:30.668739+00	\N
21	15	t	2025-09-19 16:50:10.146184+00	\N	always	2025-10-06 14:36:30.668739+00	\N
21	17	t	2025-09-27 00:13:41.736262+00	\N	always	2025-10-06 14:36:30.668739+00	\N
22	9	t	2025-09-26 21:40:07.797848+00	\N	always	2025-10-06 14:36:30.668739+00	\N
22	11	t	2025-09-29 07:26:21.371586+00	\N	always	2025-10-06 14:36:30.668739+00	\N
22	13	t	2025-10-02 13:35:53.011492+00	\N	always	2025-10-06 14:36:30.668739+00	\N
22	15	t	2025-09-24 10:12:36.766975+00	\N	always	2025-10-06 14:36:30.668739+00	\N
22	17	t	2025-09-28 19:53:29.862282+00	\N	always	2025-10-06 14:36:30.668739+00	\N
23	9	t	2025-10-03 19:31:46.028208+00	\N	always	2025-10-06 14:36:30.668739+00	\N
23	11	t	2025-09-12 06:19:54.863969+00	\N	always	2025-10-06 14:36:30.668739+00	\N
23	13	t	2025-10-04 03:29:56.223963+00	\N	always	2025-10-06 14:36:30.668739+00	\N
23	15	t	2025-10-06 05:04:10.10978+00	\N	always	2025-10-06 14:36:30.668739+00	\N
23	17	t	2025-09-16 08:39:02.525666+00	\N	always	2025-10-06 14:36:30.668739+00	\N
24	9	t	2025-09-16 18:05:50.121871+00	\N	always	2025-10-06 14:36:30.668739+00	\N
24	11	t	2025-09-14 08:16:08.680735+00	\N	always	2025-10-06 14:36:30.668739+00	\N
24	13	t	2025-09-23 02:11:42.451499+00	\N	always	2025-10-06 14:36:30.668739+00	\N
24	15	t	2025-09-28 11:44:24.049104+00	\N	always	2025-10-06 14:36:30.668739+00	\N
24	17	t	2025-09-17 13:10:21.501325+00	\N	always	2025-10-06 14:36:30.668739+00	\N
25	9	t	2025-09-21 01:23:58.350592+00	\N	always	2025-10-06 14:36:30.668739+00	\N
25	11	t	2025-09-24 23:06:26.405974+00	\N	always	2025-10-06 14:36:30.668739+00	\N
25	13	t	2025-09-09 13:06:05.190026+00	\N	always	2025-10-06 14:36:30.668739+00	\N
25	15	t	2025-09-26 09:23:42.642555+00	\N	always	2025-10-06 14:36:30.668739+00	\N
25	17	t	2025-09-20 15:52:04.369856+00	\N	always	2025-10-06 14:36:30.668739+00	\N
26	9	t	2025-09-16 23:16:46.781195+00	\N	always	2025-10-06 14:36:30.668739+00	\N
26	11	t	2025-09-12 03:09:45.472696+00	\N	always	2025-10-06 14:36:30.668739+00	\N
26	13	t	2025-09-20 13:06:53.714957+00	\N	always	2025-10-06 14:36:30.668739+00	\N
26	15	t	2025-09-08 05:36:30.899588+00	\N	always	2025-10-06 14:36:30.668739+00	\N
26	17	t	2025-10-01 21:17:11.50307+00	\N	always	2025-10-06 14:36:30.668739+00	\N
27	9	t	2025-09-15 10:11:49.240298+00	\N	always	2025-10-06 14:36:30.668739+00	\N
27	11	t	2025-10-01 01:22:57.362477+00	\N	always	2025-10-06 14:36:30.668739+00	\N
27	13	t	2025-09-07 19:37:51.772892+00	\N	always	2025-10-06 14:36:30.668739+00	\N
27	15	t	2025-09-08 04:22:41.249223+00	\N	always	2025-10-06 14:36:30.668739+00	\N
27	17	t	2025-09-22 20:06:34.133014+00	\N	always	2025-10-06 14:36:30.668739+00	\N
28	9	t	2025-09-21 00:32:36.298053+00	\N	always	2025-10-06 14:36:30.668739+00	\N
28	11	t	2025-09-22 22:54:41.409723+00	\N	always	2025-10-06 14:36:30.668739+00	\N
28	13	t	2025-09-30 15:15:43.042198+00	\N	always	2025-10-06 14:36:30.668739+00	\N
28	15	t	2025-10-01 10:39:08.13631+00	\N	always	2025-10-06 14:36:30.668739+00	\N
28	17	t	2025-09-10 16:38:30.499393+00	\N	always	2025-10-06 14:36:30.668739+00	\N
29	9	t	2025-09-12 05:46:41.73329+00	\N	always	2025-10-06 14:36:30.668739+00	\N
29	11	t	2025-10-03 07:10:09.043774+00	\N	always	2025-10-06 14:36:30.668739+00	\N
29	13	t	2025-09-23 07:49:33.477364+00	\N	always	2025-10-06 14:36:30.668739+00	\N
29	15	t	2025-09-15 01:10:49.844418+00	\N	always	2025-10-06 14:36:30.668739+00	\N
29	17	t	2025-09-28 06:12:46.512454+00	\N	always	2025-10-06 14:36:30.668739+00	\N
30	9	t	2025-09-27 07:51:40.935718+00	\N	always	2025-10-06 14:36:30.668739+00	\N
30	11	t	2025-09-12 08:22:43.194533+00	\N	always	2025-10-06 14:36:30.668739+00	\N
30	13	t	2025-09-25 10:57:32.401644+00	\N	always	2025-10-06 14:36:30.668739+00	\N
30	15	t	2025-09-28 06:05:19.841971+00	\N	always	2025-10-06 14:36:30.668739+00	\N
30	17	t	2025-09-21 02:35:40.32651+00	\N	always	2025-10-06 14:36:30.668739+00	\N
\.


--
-- Name: access_event_event_id_seq; Type: SEQUENCE SET; Schema: device_comm_example; Owner: postgres
--

SELECT pg_catalog.setval('device_comm_example.access_event_event_id_seq', 1, false);


--
-- Name: building_building_id_seq; Type: SEQUENCE SET; Schema: device_comm_example; Owner: postgres
--

SELECT pg_catalog.setval('device_comm_example.building_building_id_seq', 2, true);


--
-- Name: device_device_id_seq; Type: SEQUENCE SET; Schema: device_comm_example; Owner: postgres
--

SELECT pg_catalog.setval('device_comm_example.device_device_id_seq', 17, true);


--
-- Name: key_key_id_seq; Type: SEQUENCE SET; Schema: device_comm_example; Owner: postgres
--

SELECT pg_catalog.setval('device_comm_example.key_key_id_seq', 30, true);


--
-- Name: user_user_id_seq; Type: SEQUENCE SET; Schema: device_comm_example; Owner: postgres
--

SELECT pg_catalog.setval('device_comm_example.user_user_id_seq', 20, true);
