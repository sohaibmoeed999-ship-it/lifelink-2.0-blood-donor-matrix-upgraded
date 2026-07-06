-- ============================================================
-- Life Link 2.0 — Donor Matrix
-- Full SQL Setup Script for SQL Server
-- Database: LifeLinkDB
-- ============================================================
-- HOW TO USE:
--   1. Open SQL Server Management Studio (SSMS)
--   2. Connect to your SQL Server instance
--   3. Open this file and press F5 (Execute)
-- ============================================================

-- Create the database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'LifeLinkDB')
BEGIN
    CREATE DATABASE LifeLinkDB;
    PRINT 'Database LifeLinkDB created.';
END
GO

USE LifeLinkDB;
GO


-- DROP TABLES (for clean re-run) — order matters due to FKs

IF OBJECT_ID('dbo.Reviews',      'U') IS NOT NULL DROP TABLE dbo.Reviews;
IF OBJECT_ID('dbo.BloodRequests','U') IS NOT NULL DROP TABLE dbo.BloodRequests;
IF OBJECT_ID('dbo.Donors',       'U') IS NOT NULL DROP TABLE dbo.Donors;
IF OBJECT_ID('dbo.Hospitals',    'U') IS NOT NULL DROP TABLE dbo.Hospitals;
IF OBJECT_ID('dbo.Users',        'U') IS NOT NULL DROP TABLE dbo.Users;
GO

-- TABLE 1: Users

CREATE TABLE dbo.Users (
    Id           INT IDENTITY(1,1) PRIMARY KEY,
    Name         NVARCHAR(100)  NOT NULL,
    Email        NVARCHAR(150)  NOT NULL,
    PasswordHash NVARCHAR(MAX)  NOT NULL,
    Role         NVARCHAR(20)   NOT NULL DEFAULT 'User',

    CONSTRAINT UQ_Users_Email UNIQUE (Email)
);
GO

-- TABLE 2: Hospitals

CREATE TABLE dbo.Hospitals (
    Id                INT IDENTITY(1,1) PRIMARY KEY,
    Name              NVARCHAR(200) NOT NULL,
    City              NVARCHAR(100) NOT NULL,
    BloodAvailability NVARCHAR(100) NOT NULL DEFAULT ''
);
GO

-- TABLE 3: Donors
-- (Foreign Key → Users.Id)

CREATE TABLE dbo.Donors (
    Id                INT IDENTITY(1,1) PRIMARY KEY,
    UserId            INT           NOT NULL,
    BloodGroup        NVARCHAR(5)   NOT NULL,
    City              NVARCHAR(100) NOT NULL,
    LastDonationDate  DATETIME2     NULL,
    EligibilityStatus NVARCHAR(20)  NOT NULL DEFAULT 'Eligible',
    ContactNumber     NVARCHAR(20)  NOT NULL DEFAULT '',
    Age               INT           NOT NULL DEFAULT 0,
    CreatedAt         DATETIME2     NOT NULL DEFAULT GETUTCDATE(),

    CONSTRAINT FK_Donors_Users FOREIGN KEY (UserId)
        REFERENCES dbo.Users(Id) ON DELETE CASCADE
);
GO

-- TABLE 4: BloodRequests
-- (Foreign Key → Hospitals.Id)

CREATE TABLE dbo.BloodRequests (
    Id          INT IDENTITY(1,1) PRIMARY KEY,
    PatientName NVARCHAR(100) NOT NULL,
    BloodGroup  NVARCHAR(5)   NOT NULL,
    HospitalId  INT           NOT NULL,
    RequestDate DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    Status      NVARCHAR(20)  NOT NULL DEFAULT 'Pending',

    CONSTRAINT FK_BloodRequests_Hospitals FOREIGN KEY (HospitalId)
        REFERENCES dbo.Hospitals(Id) ON DELETE CASCADE
);
GO


-- TABLE 5: Reviews
-- (Foreign Key → Users.Id)

CREATE TABLE dbo.Reviews (
    Id        INT IDENTITY(1,1) PRIMARY KEY,
    UserId    INT           NOT NULL,
    Rating    INT           NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    Comment   NVARCHAR(MAX) NOT NULL,
    CreatedAt DATETIME2     NOT NULL DEFAULT GETUTCDATE(),

    CONSTRAINT FK_Reviews_Users FOREIGN KEY (UserId)
        REFERENCES dbo.Users(Id) ON DELETE CASCADE
);
GO


-- INDEXES for performance

CREATE INDEX IX_Donors_BloodGroup ON dbo.Donors(BloodGroup);
CREATE INDEX IX_Donors_City       ON dbo.Donors(City);
CREATE INDEX IX_Donors_UserId     ON dbo.Donors(UserId);
GO


-- INSERT: 5 Hospitals

SET IDENTITY_INSERT dbo.Hospitals ON;
INSERT INTO dbo.Hospitals (Id, Name, City, BloodAvailability) VALUES
    (1, 'Services Hospital',            'Lahore',     'A+,O+,B+,AB+'),
    (2, 'Shaukat Khanum Memorial',      'Lahore',     'A+,O-,AB-,B+'),
    (3, 'Aga Khan University Hospital', 'Karachi',    'O+,O-,A-,B-'),
    (4, 'PIMS Hospital',                'Islamabad',  'A+,B+,AB+'),
    (5, 'Combined Military Hospital',   'Rawalpindi', 'O+,A+,B+,AB+');
SET IDENTITY_INSERT dbo.Hospitals OFF;
GO


-- INSERT: 21 Users (1 Admin + 20 regular users)
-- Password hashes (SHA-256 Base64):
--   admin123 => jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI=
--   user123  => BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=

SET IDENTITY_INSERT dbo.Users ON;
INSERT INTO dbo.Users (Id, Name, Email, PasswordHash, Role) VALUES
    (1,  'Admin User',     'admin@lifelink.com',  'jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI=', 'Admin'),
    (2,  'Ali Hassan',     'ali@example.com',     'BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=', 'User'),
    (3,  'Sara Khan',      'sara@example.com',    'BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=', 'User'),
    (4,  'Usman Malik',    'usman@example.com',   'BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=', 'User'),
    (5,  'Fatima Noor',    'fatima@example.com',  'BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=', 'User'),
    (6,  'Bilal Ahmed',    'bilal@example.com',   'BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=', 'User'),
    (7,  'Hina Iqbal',     'hina@example.com',    'BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=', 'User'),
    (8,  'Zain Raza',      'zain@example.com',    'BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=', 'User'),
    (9,  'Ayesha Qureshi', 'ayesha@example.com',  'BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=', 'User'),
    (10, 'Kamran Baig',    'kamran@example.com',  'BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=', 'User'),
    (11, 'Nadia Hussain',  'nadia@example.com',   'BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=', 'User'),
    (12, 'Tariq Mehmood',  'tariq@example.com',   'BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=', 'User'),
    (13, 'Sana Mirza',     'sana@example.com',    'BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=', 'User'),
    (14, 'Farhan Sheikh',  'farhan@example.com',  'BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=', 'User'),
    (15, 'Rabia Anwar',    'rabia@example.com',   'BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=', 'User'),
    (16, 'Imran Siddiqui', 'imran@example.com',   'BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=', 'User'),
    (17, 'Maira Yousuf',   'maira@example.com',   'BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=', 'User'),
    (18, 'Hamza Tariq',    'hamza@example.com',   'BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=', 'User'),
    (19, 'Asma Javed',     'asma@example.com',    'BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=', 'User'),
    (20, 'Owais Rehman',   'owais@example.com',   'BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=', 'User'),
    (21, 'Zara Saleem',    'zara@example.com',    'BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=', 'User');
SET IDENTITY_INSERT dbo.Users OFF;
GO


-- INSERT: 20 Donors
-- EligibilityStatus = 'Eligible' because all LastDonationDate > 90 days ago

SET IDENTITY_INSERT dbo.Donors ON;
INSERT INTO dbo.Donors (Id, UserId, BloodGroup, City, LastDonationDate, EligibilityStatus, ContactNumber, Age, CreatedAt) VALUES
    (1,  2,  'A+',  'Lahore',     '2024-10-01', 'Eligible', '0300-1234567', 25, '2025-01-15'),
    (2,  3,  'O-',  'Karachi',    '2024-08-15', 'Eligible', '0311-2345678', 30, '2025-01-20'),
    (3,  4,  'B+',  'Lahore',     '2025-01-20', 'Eligible', '0321-3456789', 22, '2025-02-10'),
    (4,  5,  'AB+', 'Islamabad',  '2024-09-05', 'Eligible', '0333-4567890', 28, '2025-02-25'),
    (5,  6,  'O+',  'Lahore',     '2024-12-10', 'Eligible', '0345-5678901', 35, '2025-03-05'),
    (6,  7,  'A-',  'Rawalpindi', '2024-07-20', 'Eligible', '0301-6789012', 27, '2025-03-18'),
    (7,  8,  'O-',  'Lahore',     '2024-11-01', 'Eligible', '0312-7890123', 32, '2025-04-01'),
    (8,  9,  'B-',  'Karachi',    '2025-02-15', 'Eligible', '0322-8901234', 24, '2025-04-20'),
    (9,  10, 'AB-', 'Islamabad',  '2024-06-10', 'Eligible', '0334-9012345', 40, '2025-01-05'),
    (10, 11, 'O+',  'Karachi',    '2024-05-25', 'Eligible', '0346-0123456', 33, '2025-01-12'),
    (11, 12, 'A+',  'Rawalpindi', '2024-10-30', 'Eligible', '0302-1234568', 29, '2025-02-03'),
    (12, 13, 'B+',  'Islamabad',  '2024-09-14', 'Eligible', '0313-2345679', 26, '2025-02-18'),
    (13, 14, 'O+',  'Lahore',     '2024-12-20', 'Eligible', '0323-3456780', 38, '2025-03-01'),
    (14, 15, 'AB+', 'Karachi',    '2024-08-08', 'Eligible', '0335-4567891', 31, '2025-03-22'),
    (15, 16, 'A-',  'Lahore',     '2024-11-15', 'Eligible', '0347-5678902', 23, '2025-04-08'),
    (16, 17, 'B-',  'Rawalpindi', '2024-07-05', 'Eligible', '0303-6789013', 36, '2025-04-15'),
    (17, 18, 'O-',  'Islamabad',  '2025-01-03', 'Eligible', '0314-7890124', 42, '2025-04-25'),
    (18, 19, 'A+',  'Karachi',    '2024-10-22', 'Eligible', '0324-8901235', 20, '2025-05-02'),
    (19, 20, 'B+',  'Lahore',     '2024-09-29', 'Eligible', '0336-9012346', 45, '2025-05-09'),
    (20, 21, 'AB-', 'Rawalpindi', '2024-08-19', 'Eligible', '0348-0123457', 37, '2025-05-14');
SET IDENTITY_INSERT dbo.Donors OFF;
GO


-- INSERT: 10 Blood Requests

SET IDENTITY_INSERT dbo.BloodRequests ON;
INSERT INTO dbo.BloodRequests (Id, PatientName, BloodGroup, HospitalId, RequestDate, Status) VALUES
    (1,  'Ahmad Pervaiz',  'A+',  1, '2025-04-01', 'Pending'),
    (2,  'Sobia Tahir',    'O-',  2, '2025-03-15', 'Fulfilled'),
    (3,  'Dawood Sajid',   'B+',  3, '2025-04-10', 'Pending'),
    (4,  'Hira Baig',      'AB-', 4, '2025-04-18', 'Pending'),
    (5,  'Faisal Riaz',    'O+',  5, '2025-03-28', 'Fulfilled'),
    (6,  'Maryam Arshad',  'A-',  1, '2025-05-01', 'Pending'),
    (7,  'Naveed Alam',    'B-',  2, '2025-05-03', 'Pending'),
    (8,  'Rubina Ghafoor', 'O-',  3, '2025-04-25', 'Fulfilled'),
    (9,  'Saif Ullah',     'AB+', 4, '2025-05-06', 'Pending'),
    (10, 'Tahira Iqbal',   'A+',  5, '2025-04-30', 'Fulfilled');
SET IDENTITY_INSERT dbo.BloodRequests OFF;
GO


-- INSERT: 10 Reviews

SET IDENTITY_INSERT dbo.Reviews ON;
INSERT INTO dbo.Reviews (Id, UserId, Rating, Comment, CreatedAt) VALUES
    (1,  2,  5, 'Amazing platform! Found a donor in minutes. Truly life-saving.',           '2025-03-10'),
    (2,  3,  5, 'Very professional system. The smart matching feature is impressive!',       '2025-02-28'),
    (3,  5,  4, 'Great experience. Easy to register and find compatible donors.',            '2025-04-01'),
    (4,  7,  5, 'Life Link saved my sister''s life. Cannot thank enough!',                  '2025-03-22'),
    (5,  9,  4, 'Smooth UI and quick results. Highly recommended.',                          '2025-04-05'),
    (6,  11, 3, 'Good platform overall. Would love more filters in the search.',             '2025-04-12'),
    (7,  13, 5, 'Blood request fulfilled within hours! Exceptional service.',                '2025-04-20'),
    (8,  15, 4, 'The eligibility checker is a great feature. Very useful.',                  '2025-04-26'),
    (9,  17, 5, 'Found 3 matching donors for my father''s surgery. God bless this team!',   '2025-05-02'),
    (10, 19, 4, 'Reliable and fast. The hospital directory is also very helpful.',           '2025-05-07');
SET IDENTITY_INSERT dbo.Reviews OFF;
GO


-- VERIFICATION QUERIES — run to confirm data was inserted

SELECT 'Users'        AS TableName, COUNT(*) AS Rows FROM dbo.Users
UNION ALL
SELECT 'Hospitals',                  COUNT(*) FROM dbo.Hospitals
UNION ALL
SELECT 'Donors',                     COUNT(*) FROM dbo.Donors
UNION ALL
SELECT 'BloodRequests',              COUNT(*) FROM dbo.BloodRequests
UNION ALL
SELECT 'Reviews',                    COUNT(*) FROM dbo.Reviews;
GO

PRINT 'Life Link 2.0 database setup complete!';
GO
