-- Seed Data for Cuvinte de Sus
-- Run this AFTER schema.sql to add sample messages

INSERT INTO messages (content, category, age_range, role_target) VALUES
-- School Harmony
('Nu ești singur în fața provocărilor. Împreună vom găsi soluții.', 
 'school_harmony', 
 ARRAY['8-10', '11-13', '14-16', '17-20']::beneficiary_age_range[], 
 ARRAY['parent', 'teacher']::user_role[]),

('Fiecare conflict este o oportunitate de a învăța și de a crește.', 
 'school_harmony', 
 ARRAY['11-13', '14-16', '17-20']::beneficiary_age_range[], 
 ARRAY['parent', 'teacher']::user_role[]),

('Ești valoros/a așa cum ești. Nu permite nimănui să te facă să te simți altfel.', 
 'school_harmony', 
 ARRAY['8-10', '11-13', '14-16', '17-20']::beneficiary_age_range[], 
 ARRAY['parent', 'teacher']::user_role[]),

-- Exams & Tests
('Ai muncit din greu și ești pregătit/a. Ai încredere în tine!', 
 'exams_tests', 
 ARRAY['11-13', '14-16', '17-20']::beneficiary_age_range[], 
 ARRAY['parent', 'teacher']::user_role[]),

('Rezultatele sunt importante, dar efortul tău contează cel mai mult.', 
 'exams_tests', 
 ARRAY['8-10', '11-13', '14-16']::beneficiary_age_range[], 
 ARRAY['parent', 'teacher']::user_role[]),

('Până mâine, fii calm/a și concentrat/a. Vei reuși!', 
 'exams_tests', 
 ARRAY['14-16', '17-20']::beneficiary_age_range[], 
 ARRAY['parent', 'teacher']::user_role[]),

-- Overcoming Failure
('Greșelile sunt lecții, nu eșecuri. Continuă să încerci!', 
 'overcoming_failure', 
 ARRAY['8-10', '11-13', '14-16', '17-20']::beneficiary_age_range[], 
 ARRAY['parent', 'teacher']::user_role[]),

('Un rezultat nu te definește. Ești mult mai mult decât o notă.', 
 'overcoming_failure', 
 ARRAY['11-13', '14-16', '17-20']::beneficiary_age_range[], 
 ARRAY['parent', 'teacher']::user_role[]),

('Fiindcă ai căzut, înseamnă că poți și să te ridici. Sunt mândru/mândră de tine.', 
 'overcoming_failure', 
 ARRAY['8-10', '11-13']::beneficiary_age_range[], 
 ARRAY['parent']::user_role[]),

-- Family Reconnection
('Dragostea noastră nu depinde de nimic. Te iubim neconditionat.', 
 'family_reconnection', 
 ARRAY['8-10', '11-13', '14-16', '17-20']::beneficiary_age_range[], 
 ARRAY['parent']::user_role[]),

('Hai să vorbim deschis. Îmi pasă de tine și vreau să te ascult.', 
 'family_reconnection', 
 ARRAY['14-16', '17-20']::beneficiary_age_range[], 
 ARRAY['parent']::user_role[]),

('Familia este locul unde te acceptăm așa cum ești.', 
 'family_reconnection', 
 ARRAY['8-10', '11-13']::beneficiary_age_range[], 
 ARRAY['parent']::user_role[]);
