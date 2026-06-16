-- AMICI ERP Database Seed Data (Supabase PostgreSQL)
-- Inserts 15 realistic bilingual-ready records for each core module.

-- 1. HR Employees
INSERT INTO public.employees (employee_id, first_name, last_name, email, department, position, employment_type, start_date, location, crew_type, rotation_schedule, status) VALUES
('EMP-001', 'Tariq', 'Al-Farsi', 't.alfarsi@amici.com', 'Operations', 'Drilling Superintendent', 'Full-time', '2015-04-10', 'Block 15 – Rig Alpha', 'Offshore', '28/28', 'Active'),
('EMP-002', 'Sarah', 'Jenkins', 's.jenkins@amici.com', 'Engineering', 'Reservoir Engineer', 'Full-time', '2018-09-01', 'Onshore Processing Facility', 'Onshore', '14/14', 'Active'),
('EMP-003', 'Ahmed', 'Mansour', 'a.mansour@amici.com', 'HSE', 'HSE Inspector', 'Full-time', '2020-01-15', 'Block 15 – Rig Alpha', 'Offshore', '28/28', 'Active'),
('EMP-004', 'Liam', 'O''Connor', 'l.oconnor@amici.com', 'Supply Chain', 'Procurement Manager', 'Full-time', '2016-11-20', 'HQ - London', 'Office', 'None', 'Active'),
('EMP-005', 'Fatima', 'Zahra', 'f.zahra@amici.com', 'HR', 'HR Business Partner', 'Full-time', '2019-03-05', 'HQ - Dubai', 'Office', 'None', 'Active'),
('EMP-006', 'Carlos', 'Mendoza', 'c.mendoza@amici.com', 'Operations', 'Toolpusher', 'Contract', '2022-05-12', 'Block 15 – Rig Alpha', 'Offshore', '28/28', 'Active'),
('EMP-007', 'Yousef', 'Haddad', 'y.haddad@amici.com', 'Finance', 'Financial Controller', 'Full-time', '2017-08-21', 'HQ - Dubai', 'Office', 'None', 'Active'),
('EMP-008', 'Emma', 'Watson', 'e.watson@amici.com', 'Engineering', 'Geologist', 'Full-time', '2021-02-14', 'Exploration Block 7', 'Field', '28/28', 'Active'),
('EMP-009', 'Kenji', 'Sato', 'k.sato@amici.com', 'IT', 'Systems Administrator', 'Full-time', '2020-10-01', 'Onshore Processing Facility', 'Onshore', 'None', 'Active'),
('EMP-010', 'Nadia', 'Boulos', 'n.boulos@amici.com', 'Legal', 'Legal Counsel', 'Full-time', '2014-06-11', 'HQ - London', 'Office', 'None', 'Active'),
('EMP-011', 'Omar', 'Tarek', 'o.tarek@amici.com', 'Operations', 'Derrickman', 'Full-time', '2023-01-05', 'Block 15 – Rig Alpha', 'Offshore', '28/28', 'On Leave'),
('EMP-012', 'Sophie', 'Martin', 's.martin@amici.com', 'CRM', 'Sales Director', 'Full-time', '2015-12-01', 'HQ - Paris', 'Office', 'None', 'Active'),
('EMP-013', 'Ali', 'Reza', 'a.reza@amici.com', 'Engineering', 'Petroleum Engineer', 'Full-time', '2019-07-15', 'Onshore Processing Facility', 'Onshore', '14/14', 'Active'),
('EMP-014', 'Maria', 'Garcia', 'm.garcia@amici.com', 'HSE', 'Safety Officer', 'Full-time', '2022-09-01', 'Exploration Block 7', 'Field', '28/28', 'Active'),
('EMP-015', 'John', 'Smith', 'j.smith@amici.com', 'Supply Chain', 'Logistics Coordinator', 'Contract', '2021-11-10', 'Marine Base Logistics', 'Onshore', '14/14', 'Active');

-- 2. CRM Accounts
INSERT INTO public.accounts (account_id, name, industry, account_type, country, status, annual_revenue, rating, block_reference) VALUES
('ACC-001', 'PetroNational', 'Oil & Gas', 'Operator', 'UAE', 'Active', 15000000.00, 'Hot', 'Block 15'),
('ACC-002', 'GlobalDrill Services', 'Oil & Gas Services', 'Service Co', 'UK', 'Active', 8500000.00, 'Warm', 'Rig Alpha'),
('ACC-003', 'Sahara Energy JV', 'Oil & Gas', 'JV Partner', 'EGY', 'Active', 22000000.00, 'Hot', 'Exploration Block 7'),
('ACC-004', 'TechSeismic', 'Geophysics', 'Service Co', 'USA', 'Active', 4200000.00, 'Cold', 'Block 9'),
('ACC-005', 'Desert Logistics', 'Transportation', 'Service Co', 'KSA', 'Active', 1200000.00, 'Warm', 'Onshore Processing'),
('ACC-006', 'Oman Oil Exploration', 'Oil & Gas', 'Operator', 'OMN', 'Active', 18000000.00, 'Hot', 'Block 42'),
('ACC-007', 'NorthSea Partners', 'Oil & Gas', 'JV Partner', 'NOR', 'Active', 35000000.00, 'Hot', 'North Sea Asset'),
('ACC-008', 'Gulf Chemical Supply', 'Chemicals', 'Supplier', 'UAE', 'Inactive', 500000.00, 'Cold', 'All Blocks'),
('ACC-009', 'RigMasters Inc.', 'Equipment', 'Service Co', 'CAN', 'Active', 6700000.00, 'Warm', 'Rig Alpha'),
('ACC-010', 'Mediterra Gas', 'Oil & Gas', 'Operator', 'ITA', 'Active', 11000000.00, 'Warm', 'Offshore Block 3'),
('ACC-011', 'DeepWater Tech', 'Oil & Gas Services', 'Service Co', 'UK', 'Active', 2500000.00, 'Cold', 'Deepwater Asset'),
('ACC-012', 'Eastern Refinery Co', 'Downstream', 'Operator', 'BHR', 'Active', 45000000.00, 'Hot', 'Refinery Alpha'),
('ACC-013', 'Apex Well Services', 'Oil & Gas Services', 'Service Co', 'USA', 'Active', 9000000.00, 'Warm', 'Block 15'),
('ACC-014', 'Crescent Petroleum', 'Oil & Gas', 'Operator', 'IRQ', 'Active', 14000000.00, 'Hot', 'Block 10'),
('ACC-015', 'Marine Support Fleet', 'Logistics', 'Service Co', 'QAT', 'Active', 3200000.00, 'Warm', 'Marine Base Logistics');

-- 3. Certificate Compliance
INSERT INTO public.certificates (certificate_id, equipment_name, asset_tag, category, site, cert_type, issuing_authority, issue_date, expiry_date, status) VALUES
('CERT-001', 'HP Centrifugal Pump - P-101A', 'P-101A', 'Rotating', 'Block 15 – Rig Alpha', 'API 610', 'Bureau Veritas', '2025-06-01', '2026-06-01', 'Valid'),
('CERT-002', 'Production Separator - V-201', 'V-201', 'Static', 'Onshore Processing Facility', 'API 510', 'Lloyds Register', '2024-05-15', '2026-05-15', 'Valid'),
('CERT-003', 'Overhead Crane 10T - CR-01', 'CR-01', 'Lifting', 'Marine Base Logistics', 'LOLER', 'TUV Rheinland', '2025-12-01', '2026-06-30', 'Valid'),
('CERT-004', 'Main Switchgear Panel - SG-101', 'SG-101', 'Electrical', 'Block 15 – Rig Alpha', 'IEC 60079', 'DNV', '2025-01-10', '2026-01-10', 'Expired'),
('CERT-005', 'Safety Relief Valve - PSV-301', 'PSV-301', 'Pressure', 'Exploration Block 7', 'API 527', 'Bureau Veritas', '2025-08-01', '2026-08-01', 'Valid'),
('CERT-006', 'CO2 Fire Suppression System', 'FS-202', 'Fire & Safety', 'HQ - Dubai', 'NFPA 2001', 'Civil Defense', '2025-06-25', '2026-06-25', 'Expiring Soon'),
('CERT-007', 'Coriolis Flow Meter - FT-401', 'FT-401', 'Instrumentation', 'Onshore Processing Facility', 'ISO 9001', 'SGS', '2025-03-12', '2026-03-12', 'Expired'),
('CERT-008', 'Rough Terrain Forklift - FK-03', 'FK-03', 'Vehicles', 'Marine Base Logistics', 'PUWER', 'Lloyds Register', '2025-07-20', '2026-07-20', 'Valid'),
('CERT-009', 'Gas Turbine Generator - TG-01', 'TG-01', 'Rotating', 'Block 15 – Rig Alpha', 'API 616', 'DNV', '2024-11-05', '2026-11-05', 'Valid'),
('CERT-010', 'Storage Tank - TK-501', 'TK-501', 'Static', 'Onshore Processing Facility', 'API 653', 'TUV Rheinland', '2023-04-10', '2028-04-10', 'Valid'),
('CERT-011', 'Wire Rope Slings Set', 'SL-044', 'Lifting', 'Exploration Block 7', 'LOLER', 'Bureau Veritas', '2025-10-15', '2026-04-15', 'Expired'),
('CERT-012', 'Transformer 11kV - TR-02', 'TR-02', 'Electrical', 'Onshore Processing Facility', 'IEC 60076', 'SGS', '2025-02-28', '2026-02-28', 'Expired'),
('CERT-013', 'H2S Gas Detector', 'GD-001', 'Fire & Safety', 'Block 15 – Rig Alpha', 'Calibration', 'MSA Safety', '2025-12-10', '2026-06-10', 'Valid'),
('CERT-014', 'Pressure Transmitter - PT-105', 'PT-105', 'Instrumentation', 'Block 15 – Rig Alpha', 'Calibration', 'Emerson', '2025-09-05', '2026-09-05', 'Valid'),
('CERT-015', 'Crew Transport Bus', 'BUS-01', 'Vehicles', 'HQ - Dubai', 'RTA Inspection', 'RTA', '2025-05-20', '2026-05-20', 'Valid');

-- 4. Supply Chain Purchase Orders
INSERT INTO public.purchase_orders (po_number, supplier_name, description, category, quantity, unit_price, total_value, po_date, expected_delivery, status, destination_site) VALUES
('PO-2026-001', 'GlobalDrill Services', 'Drill Bits 8.5 inch', 'Parts', 10, 4500.00, 45000.00, '2026-05-10', '2026-06-15', 'Approved', 'Block 15 – Rig Alpha'),
('PO-2026-002', 'Gulf Chemical Supply', 'Biocide drums (200L)', 'Chemicals', 50, 250.00, 12500.00, '2026-05-12', '2026-05-25', 'Received', 'Onshore Processing Facility'),
('PO-2026-003', 'RigMasters Inc.', 'Top Drive Motor Spare', 'Parts', 1, 120000.00, 120000.00, '2026-05-15', '2026-07-01', 'Draft', 'Block 15 – Rig Alpha'),
('PO-2026-004', 'SafetyFirst Gear', 'Flame Retardant Coveralls', 'PPE', 200, 85.00, 17000.00, '2026-05-18', '2026-06-05', 'Approved', 'Marine Base Logistics'),
('PO-2026-005', 'TechSeismic', 'Seismic Data Processing Software License', 'Services', 1, 55000.00, 55000.00, '2026-05-20', '2026-05-21', 'Received', 'HQ - Dubai'),
('PO-2026-006', 'Desert Logistics', 'Heavy Haulage Services - May', 'Services', 1, 15000.00, 15000.00, '2026-05-22', '2026-05-31', 'Approved', 'Exploration Block 7'),
('PO-2026-007', 'ValveCorp', 'Gate Valves 12" 150#', 'Parts', 4, 3200.00, 12800.00, '2026-05-25', '2026-06-20', 'Approved', 'Onshore Processing Facility'),
('PO-2026-008', 'ChemSolutions', 'Corrosion Inhibitor', 'Chemicals', 100, 150.00, 15000.00, '2026-05-26', '2026-06-10', 'Draft', 'Block 15 – Rig Alpha'),
('PO-2026-009', 'Apex Well Services', 'Wireline Logging Services', 'Services', 1, 85000.00, 85000.00, '2026-05-28', '2026-06-15', 'Approved', 'Exploration Block 7'),
('PO-2026-010', 'Marine Support Fleet', 'Supply Vessel Charter - June', 'Services', 1, 120000.00, 120000.00, '2026-06-01', '2026-06-01', 'Approved', 'Block 15 – Rig Alpha'),
('PO-2026-011', 'SafetyFirst Gear', 'H2S Personal Monitors', 'PPE', 50, 350.00, 17500.00, '2026-06-02', '2026-06-12', 'Approved', 'Marine Base Logistics'),
('PO-2026-012', 'GlobalDrill Services', 'Casing Pipe 13 3/8" (1000m)', 'Parts', 1, 245000.00, 245000.00, '2026-06-05', '2026-07-15', 'Draft', 'Exploration Block 7'),
('PO-2026-013', 'PumpTech Solutions', 'Centrifugal Pump Impeller', 'Parts', 2, 8500.00, 17000.00, '2026-06-08', '2026-06-30', 'Approved', 'Onshore Processing Facility'),
('PO-2026-014', 'Gulf Chemical Supply', 'Demulsifier', 'Chemicals', 40, 420.00, 16800.00, '2026-06-10', '2026-06-25', 'Draft', 'Onshore Processing Facility'),
('PO-2026-015', 'RigMasters Inc.', 'BOP Control Pod Spares', 'Parts', 1, 45000.00, 45000.00, '2026-06-11', '2026-08-01', 'Draft', 'Block 15 – Rig Alpha');
