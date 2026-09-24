INSERT INTO departments (name, description) VALUES
('Roads Department','Roads and pothole maintenance'),
('Sanitation Department','Garbage and sanitation'),
('Water Department','Water supply and leakage'),
('Electrical Department','Streetlights and electrical civic services'),
('Drainage Department','Drainage and stormwater')
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (name,email,password_hash,role,phone,address,department_id)
SELECT 'CIRS Citizen','citizen@cirs.com','$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','CITIZEN','9876543210','Coimbatore, Tamil Nadu',NULL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email='citizen@cirs.com');

INSERT INTO users (name,email,password_hash,role,phone,address,department_id)
SELECT 'CIRS Officer','officer@cirs.com','$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','OFFICER','9876543211','Coimbatore, Tamil Nadu',
       (SELECT id FROM departments WHERE name='Roads Department')
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email='officer@cirs.com');

INSERT INTO users (name,email,password_hash,role,phone,address,department_id)
SELECT 'CIRS Admin','admin@cirs.com','$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','ADMIN','9876543212','Coimbatore, Tamil Nadu',NULL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email='admin@cirs.com');

INSERT INTO complaints (citizen_id,category,title,description,location,latitude,longitude,status,assigned_officer_id)
SELECT c.id,'Roads','Large pothole near main road','Deep pothole reported near a busy junction.','Coimbatore',11.0168,76.9558,'Assigned',o.id
FROM users c CROSS JOIN users o
WHERE c.email='citizen@cirs.com' AND o.email='officer@cirs.com'
AND NOT EXISTS (SELECT 1 FROM complaints WHERE title='Large pothole near main road');

INSERT INTO complaints (citizen_id,category,title,description,location,status)
SELECT id,'Sanitation','Garbage accumulation','Garbage needs collection and cleaning.','Coimbatore','Pending'
FROM users WHERE email='citizen@cirs.com'
AND NOT EXISTS (SELECT 1 FROM complaints WHERE title='Garbage accumulation');

INSERT INTO complaints (citizen_id,category,title,description,location,status,resolution_note,resolved_at)
SELECT id,'Electrical','Streetlight not working','Streetlight has stopped working.','Coimbatore','Resolved','Streetlight checked and restored.',NOW()
FROM users WHERE email='citizen@cirs.com'
AND NOT EXISTS (SELECT 1 FROM complaints WHERE title='Streetlight not working');
