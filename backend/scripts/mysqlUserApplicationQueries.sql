-- =====================================================
-- User Application Management Queries (MySQL/MariaDB)
-- =====================================================

-- 1. Remove Analytics applications for users with "PS" in their names
-- =====================================================

-- First, let's see which users have "PS" in their names and what analytics apps they have
SELECT 
    u.id,
    u.user_name,
    ua.applicationCode,
    a.description as app_description
FROM users u
JOIN user_applications ua ON u.id = ua.userId
JOIN applications a ON ua.applicationCode = a.code
WHERE LOWER(u.user_name) LIKE '%ps%'
    AND u.isActive = true
    AND ua.isActive = true
    AND (a.is_analytics = true OR ua.applicationCode = 'BCP Chat Usage')
ORDER BY u.user_name, ua.applicationCode;

-- DELETE analytics applications AND BCP Chat Usage for PS users
DELETE FROM user_applications 
WHERE userId IN (
    SELECT u.id 
    FROM users u 
    WHERE LOWER(u.user_name) LIKE '%ps%' 
        AND u.isActive = true
)
AND (
    applicationCode IN (
        SELECT a.code 
        FROM applications a 
        WHERE a.is_analytics = true 
            AND a.isActive = true
    )
    OR applicationCode = 'BCP Chat Usage'
);

-- 2. Add BCP Chat Usage for NON-PS users who don't already have it
-- =====================================================

-- First, let's see which NON-PS users don't have BCP Chat Usage
SELECT 
    u.id,
    u.user_name,
    CASE 
        WHEN ua.id IS NOT NULL THEN 'Has BCP Chat Usage'
        ELSE 'Missing BCP Chat Usage'
    END as status
FROM users u
LEFT JOIN user_applications ua ON u.id = ua.userId 
    AND ua.applicationCode = 'BCP Chat Usage' 
    AND ua.isActive = true
WHERE u.isActive = true
    AND LOWER(u.user_name) NOT LIKE '%ps%'
ORDER BY u.user_name;

-- Insert BCP Chat Usage for NON-PS users who don't have it
INSERT INTO user_applications (userId, applicationCode, isActive, assignedAt, createdAt, updatedAt)
SELECT 
    u.id,
    'BCP Chat Usage',
    true,
    NOW(),
    NOW(),
    NOW()
FROM users u
LEFT JOIN user_applications ua ON u.id = ua.userId 
    AND ua.applicationCode = 'BCP Chat Usage' 
    AND ua.isActive = true
WHERE u.isActive = true
    AND LOWER(u.user_name) NOT LIKE '%ps%'
    AND ua.id IS NULL;

-- Reactivate BCP Chat Usage for NON-PS users who have it but it's inactive
UPDATE user_applications 
SET isActive = true,
    updatedAt = NOW()
WHERE applicationCode = 'BCP Chat Usage'
    AND userId IN (
        SELECT u.id 
        FROM users u 
        WHERE u.isActive = true
            AND LOWER(u.user_name) NOT LIKE '%ps%'
    )
    AND isActive = false;

-- 3. Verification Queries
-- =====================================================

-- Check final status for PS users
SELECT 
    u.user_name,
    COUNT(CASE WHEN (a.is_analytics = true OR ua.applicationCode = 'BCP Chat Usage') AND ua.isActive = true THEN 1 END) as analytics_apps_count,
    COUNT(CASE WHEN ua.applicationCode = 'BCP Chat Usage' AND ua.isActive = true THEN 1 END) as has_bcp_chat,
    GROUP_CONCAT(CASE WHEN ua.isActive = true THEN ua.applicationCode END) as all_apps
FROM users u
LEFT JOIN user_applications ua ON u.id = ua.userId AND ua.isActive = true
LEFT JOIN applications a ON ua.applicationCode = a.code
WHERE LOWER(u.user_name) LIKE '%ps%' 
    AND u.isActive = true
GROUP BY u.id, u.user_name
ORDER BY u.user_name;

-- Check BCP Chat Usage distribution
SELECT 
    CASE 
        WHEN LOWER(u.user_name) LIKE '%ps%' THEN 'PS Users'
        ELSE 'Non-PS Users'
    END as user_type,
    COUNT(CASE WHEN ua.applicationCode = 'BCP Chat Usage' AND ua.isActive = true THEN 1 END) as has_bcp_chat,
    COUNT(CASE WHEN ua.applicationCode = 'BCP Chat Usage' AND ua.isActive = true THEN NULL ELSE 1 END) as no_bcp_chat,
    COUNT(*) as total_users
FROM users u
LEFT JOIN user_applications ua ON u.id = ua.userId 
    AND ua.applicationCode = 'BCP Chat Usage' 
    AND ua.isActive = true
WHERE u.isActive = true
GROUP BY 
    CASE 
        WHEN LOWER(u.user_name) LIKE '%ps%' THEN 'PS Users'
        ELSE 'Non-PS Users'
    END;

-- 4. Rollback Queries (if needed)
-- =====================================================

-- To rollback analytics removal for PS users (re-add them):
-- You would need to manually re-add the applications that were deleted
-- This is more complex since DELETE operations can't be easily rolled back
-- Consider taking a backup before running the DELETE queries

-- To rollback BCP Chat Usage additions (delete them):
-- DELETE FROM user_applications 
-- WHERE applicationCode = 'BCP Chat Usage'
--     AND userId IN (
--         SELECT u.id 
--         FROM users u 
--         WHERE LOWER(u.user_name) NOT LIKE '%ps%' 
--             AND u.isActive = true
--     );
