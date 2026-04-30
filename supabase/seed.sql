-- Seed sample Kolkata listings for HomesAway
-- NOTE: This seed script assumes corresponding auth.users entries already exist for the seeded owner IDs.

INSERT INTO public.profiles (id, role, full_name, phone, email, city, college, avatar_url, is_verified)
VALUES
  ('2d15f0b4-24b4-4aca-94e1-f1560cafeb12', 'owner', 'Ananya Das', '+91 98765 11001', 'ananya@example.com', 'Kolkata', NULL, NULL, true),
  ('826d72c1-a5f3-4418-a3f8-9d1b7d2e4f88', 'owner', 'Sohini Ghosh', '+91 98765 11002', 'sohini@example.com', 'Kolkata', NULL, NULL, true),
  ('38cbd7b8-1f10-4ef2-92e6-8fb019b3ceba', 'owner', 'Ritwik Sen', '+91 98765 11003', 'ritwik@example.com', 'Kolkata', NULL, NULL, true);

INSERT INTO public.listings (
  id,
  owner_id,
  title,
  description,
  area,
  locality,
  rent,
  deposit,
  gender_type,
  room_type,
  available_beds,
  food_preference,
  property_type,
  owner_name,
  owner_phone,
  created_by_owner_id,
  amenities,
  image_color,
  available,
  occupied,
  verified,
  aura_score,
  distance_to_metro,
  distance_to_college
)
VALUES
  ('fb8c4d51-1a4a-47c9-8cf7-7a6f09429c85', '2d15f0b4-24b4-4aca-94e1-f1560cafeb12', 'Sunrise PG', 'Well-maintained PG with daily cleaning, home-style meals, and calm study spaces ideal for students.', 'Ballygunge', 'Ballygunge', 6500, 6500, 'Unisex', 'Double', 4, 'Both', 'pg', 'Ananya Das', '+91 98765 11001', '2d15f0b4-24b4-4aca-94e1-f1560cafeb12', ARRAY['WiFi', 'Food Included', 'AC', 'Laundry', 'CCTV'], '#D9E7FF', true, false, true, 8.4, '0.9 km to Ballygunge Metro', '1.4 km to Gokhale Memorial'),
  ('fa23619c-3b9e-4d69-9e3a-84eab22c21de', '826d72c1-a5f3-4418-a3f8-9d1b7d2e4f88', 'Park Circus Student Nest', 'Budget-friendly rooms with strong student community, secure entry, and quick access to nearby eateries.', 'Park Circus', 'Park Circus', 5800, 5000, 'Boys', 'Triple', 6, 'Veg', 'hostel', 'Sohini Ghosh', '+91 98765 11002', '826d72c1-a5f3-4418-a3f8-9d1b7d2e4f88', ARRAY['WiFi', 'Food Included', 'Laundry', 'CCTV', 'Water Purifier'], '#E4F7EA', true, false, true, 8.1, '0.8 km to Park Circus Metro', '1.2 km to Lady Brabourne College'),
  ('2bc79866-8d2e-4f3b-bdb4-2b7ae5f4b6a1', '38cbd7b8-1f10-4ef2-92e6-8fb019b3ceba', 'Metro Stay', 'Modern co-living setup with furnished rooms, biometric access, and high-speed internet for study sessions.', 'Salt Lake', 'Salt Lake', 7200, 7200, 'Unisex', 'Single', 2, 'Both', 'flat', 'Ritwik Sen', '+91 98765 11003', '38cbd7b8-1f10-4ef2-92e6-8fb019b3ceba', ARRAY['WiFi', 'Food Included', 'AC', 'Power Backup', 'CCTV'], '#FDEAD7', true, false, true, 8.6, '1.1 km to Sector V Metro', '2.0 km to Techno India University'),
  ('d71d3a9c-96a6-4876-af10-3f9fa4e9a0cf', '2d15f0b4-24b4-4aca-94e1-f1560cafeb12', 'Gariahat Comfort Rooms', 'Comfortable twin-sharing rooms with strict security and women-friendly environment near transport links.', 'Gariahat', 'Gariahat', 5400, 5000, 'Girls', 'Double', 5, 'Veg', 'pg', 'Ananya Das', '+91 98765 11001', '2d15f0b4-24b4-4aca-94e1-f1560cafeb12', ARRAY['WiFi', 'Food Included', 'Laundry', 'CCTV', 'Housekeeping'], '#E7E4FF', true, false, true, 7.9, '1.0 km to Kalighat Metro', '1.3 km to South City College'),
  ('7bfe3c4a-a214-4d3d-9a0f-821ee7c9e6a4', '826d72c1-a5f3-4418-a3f8-9d1b7d2e4f88', 'Ballygunge Prime Hostel', 'Energetic student hostel with spacious common areas, gym tie-up, and convenient transit options.', 'Ballygunge', 'Ballygunge', 6900, 6000, 'Boys', 'Single', 1, 'Non-Veg', 'hostel', 'Sohini Ghosh', '+91 98765 11002', '826d72c1-a5f3-4418-a3f8-9d1b7d2e4f88', ARRAY['WiFi', 'AC', 'Laundry', 'CCTV', 'Gym Access'], '#D8F1F4', true, false, false, 7.8, '1.0 km to Ballygunge Metro', '2.1 km to Asutosh College'),
  ('219c4ad3-4b79-4472-af4a-3f5dbdd842ec', '38cbd7b8-1f10-4ef2-92e6-8fb019b3ceba', 'Park Circus Residency', 'Neat and airy property with elevator access, hygienic kitchen setup, and reliable maintenance support.', 'Park Circus', 'Park Circus', 6100, 5500, 'Unisex', 'Double', 3, 'Both', 'pg', 'Ritwik Sen', '+91 98765 11003', '38cbd7b8-1f10-4ef2-92e6-8fb019b3ceba', ARRAY['WiFi', 'Food Included', 'AC', 'Laundry', 'CCTV'], '#FFE3E3', true, false, true, 8.0, '0.6 km to Park Circus Metro', '2.1 km to St. Xavier''s College'),
  ('6f03a94b-74d0-4db3-bbb1-2c16426f3397', '2d15f0b4-24b4-4aca-94e1-f1560cafeb12', 'New Town Smart Living', 'Premium student housing with study pods, smart lock rooms, and dedicated support staff on site.', 'New Town', 'New Town', 7600, 8000, 'Unisex', 'Single', 3, 'Both', 'flat', 'Ananya Das', '+91 98765 11001', '2d15f0b4-24b4-4aca-94e1-f1560cafeb12', ARRAY['WiFi', 'AC', 'Laundry', 'CCTV', 'Power Backup'], '#E0EDFF', true, false, true, 8.8, '1.5 km to New Town Metro', '2.4 km to Amity University Kolkata'),
  ('6e3037f0-1e75-4a7a-8c15-a580d2e1f5bc', '826d72c1-a5f3-4418-a3f8-9d1b7d2e4f88', 'Gariahat Study Hub', 'Affordable and peaceful PG with meal plans, in-house caretaker, and dedicated quiet hours for study.', 'Gariahat', 'Gariahat', 5600, 5000, 'Girls', 'Triple', 7, 'Veg', 'hostel', 'Sohini Ghosh', '+91 98765 11002', '826d72c1-a5f3-4418-a3f8-9d1b7d2e4f88', ARRAY['WiFi', 'Food Included', 'Laundry', 'CCTV', 'RO Water'], '#F7E5D8', true, false, false, 7.6, '1.3 km to Kalighat Metro', '0.8 km to Gariahat campus cluster'),
  ('5c91f31b-5d2a-4e15-8f07-3398867a42ca', '38cbd7b8-1f10-4ef2-92e6-8fb019b3ceba', 'Lakeview Student Homes', 'Popular among engineering students for strong internet, optional meal packages, and late-entry assistance.', 'Salt Lake', 'Salt Lake', 7000, 7000, 'Boys', 'Double', 4, 'Non-Veg', 'flat', 'Ritwik Sen', '+91 98765 11003', '38cbd7b8-1f10-4ef2-92e6-8fb019b3ceba', ARRAY['WiFi', 'Food Included', 'AC', 'Laundry', 'CCTV'], '#DDF3FF', true, false, true, 8.3, '0.9 km to Karunamoyee Metro', '1.8 km to Bidhannagar College'),
  ('aeebb58d-52d6-4128-b0b9-c4c7b99a0aef', '2d15f0b4-24b4-4aca-94e1-f1560cafeb12', 'New Town Green Lane PG', 'Bright and secure girls PG with curated meal menu, wardrobe storage, and attentive wardens.', 'New Town', 'New Town', 6800, 6500, 'Girls', 'Double', 5, 'Veg', 'pg', 'Ananya Das', '+91 98765 11001', '2d15f0b4-24b4-4aca-94e1-f1560cafeb12', ARRAY['WiFi', 'Food Included', 'AC', 'Laundry', 'CCTV'], '#E8FBE7', true, false, true, 8.2, '1.2 km to New Town Metro', '1.6 km to Amity University Kolkata');
