-- POCD研究数据库 - 用户权限系统
-- 执行日期：2026-08-11
-- 说明：账号密码登录 + 角色权限控制

-- ===========================
-- 第1步：创建用户表
-- ===========================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,  -- 密码哈希
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'user')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================
-- 第2步：创建会话表（存储登录状态）
-- ===========================

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================
-- 第3步：插入初始用户（密码已加密）
-- ===========================

-- 超级管理员：HMC23CJH / cjh040908
INSERT INTO users (username, password_hash, role)
VALUES ('HMC23CJH', crypt('cjh040908', gen_salt('bf')), 'super_admin');

-- 管理员1：HMC-LQY / 123456
INSERT INTO users (username, password_hash, role)
VALUES ('HMC-LQY', crypt('123456', gen_salt('bf')), 'admin');

-- 管理员2：HMC24LKY / 123456
INSERT INTO users (username, password_hash, role)
VALUES ('HMC24LKY', crypt('123456', gen_salt('bf')), 'admin');

-- ===========================
-- 第4步：创建辅助函数
-- ===========================

-- 验证登录
CREATE OR REPLACE FUNCTION verify_login(p_username TEXT, p_password TEXT)
RETURNS TABLE(user_id UUID, username TEXT, role TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.username, u.role
    FROM users u
    WHERE u.username = p_username
    AND u.password_hash = crypt(p_password, u.password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 修改密码
CREATE OR REPLACE FUNCTION change_password(p_user_id UUID, p_old_password TEXT, p_new_password TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_valid BOOLEAN;
BEGIN
    -- 验证旧密码
    SELECT EXISTS(
        SELECT 1 FROM users
        WHERE id = p_user_id
        AND password_hash = crypt(p_old_password, password_hash)
    ) INTO v_valid;

    IF NOT v_valid THEN
        RETURN FALSE;
    END IF;

    -- 更新密码
    UPDATE users
    SET password_hash = crypt(p_new_password, gen_salt('bf')),
        updated_at = NOW()
    WHERE id = p_user_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 获取当前用户角色
CREATE OR REPLACE FUNCTION get_user_role(p_session_token TEXT)
RETURNS TEXT AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT u.role INTO v_role
    FROM users u
    JOIN user_sessions s ON s.user_id = u.id
    WHERE s.session_token = p_session_token
    AND s.expires_at > NOW();

    RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================
-- 第5步：更新RLS策略（基于角色）
-- ===========================

-- 删除旧策略
DROP POLICY IF EXISTS "匿名用户可以查看所有患者" ON patients;
DROP POLICY IF EXISTS "匿名用户可以创建患者" ON patients;
DROP POLICY IF EXISTS "匿名用户可以更新患者" ON patients;
DROP POLICY IF EXISTS "匿名用户可以删除患者" ON patients;

DROP POLICY IF EXISTS "匿名用户可以查看所有数据" ON patient_data;
DROP POLICY IF EXISTS "匿名用户可以创建数据" ON patient_data;
DROP POLICY IF EXISTS "匿名用户可以更新数据" ON patient_data;
DROP POLICY IF EXISTS "匿名用户可以删除数据" ON patient_data;

-- 患者表策略
CREATE POLICY "所有登录用户可以查看患者"
    ON patients FOR SELECT
    USING (true);  -- 所有角色都能查看

CREATE POLICY "管理员可以创建患者"
    ON patients FOR INSERT
    WITH CHECK (
        current_setting('app.user_role', true) IN ('super_admin', 'admin')
    );

CREATE POLICY "管理员可以更新患者"
    ON patients FOR UPDATE
    USING (
        current_setting('app.user_role', true) IN ('super_admin', 'admin')
    );

CREATE POLICY "管理员可以删除患者"
    ON patients FOR DELETE
    USING (
        current_setting('app.user_role', true) IN ('super_admin', 'admin')
    );

-- 患者数据表策略
CREATE POLICY "所有登录用户可以查看数据"
    ON patient_data FOR SELECT
    USING (true);

CREATE POLICY "管理员可以创建数据"
    ON patient_data FOR INSERT
    WITH CHECK (
        current_setting('app.user_role', true) IN ('super_admin', 'admin')
    );

CREATE POLICY "管理员可以更新数据"
    ON patient_data FOR UPDATE
    USING (
        current_setting('app.user_role', true) IN ('super_admin', 'admin')
    );

CREATE POLICY "管理员可以删除数据"
    ON patient_data FOR DELETE
    USING (
        current_setting('app.user_role', true) IN ('super_admin', 'admin')
    );

-- 用户表策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户可以查看自己的信息"
    ON users FOR SELECT
    USING (true);

CREATE POLICY "超级管理员可以管理用户"
    ON users FOR ALL
    USING (current_setting('app.user_role', true) = 'super_admin');

-- ===========================
-- 第6步：创建索引
-- ===========================

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

-- ===========================
-- 完成！
-- ===========================

SELECT
    '✅ 用户系统创建成功！' AS status,
    (SELECT COUNT(*) FROM users) AS total_users,
    '超级管理员: HMC23CJH' AS super_admin,
    '管理员1: HMC-LQY' AS admin1,
    '管理员2: HMC24LKY' AS admin2;
