-- 添加用户权限系统
-- 执行方式：复制到 Supabase Dashboard → SQL Editor → 粘贴运行

-- 1. 创建用户角色表
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'user')),
    display_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 创建操作日志表（记录谁做了什么）
CREATE TABLE IF NOT EXISTS operation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT NOT NULL,
    operation_type TEXT NOT NULL,  -- 'create' | 'update' | 'delete' | 'view'
    target_type TEXT NOT NULL,     -- 'patient' | 'patient_data' | 'user'
    target_id UUID,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 添加索引
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_operation_logs_user_id ON operation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_operation_logs_created_at ON operation_logs(created_at);

-- 4. 设置RLS策略 - 用户只能看到自己的角色信息
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户可以查看自己的角色"
    ON user_roles FOR SELECT
    USING (auth.uid() = user_id);

-- 超级管理员可以查看所有用户角色
CREATE POLICY "超级管理员可以查看所有角色"
    ON user_roles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'super_admin'
        )
    );

-- 超级管理员可以修改用户角色
CREATE POLICY "超级管理员可以管理用户角色"
    ON user_roles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'super_admin'
        )
    );

-- 5. 操作日志RLS策略
ALTER TABLE operation_logs ENABLE ROW LEVEL SECURITY;

-- 管理员及以上可以查看所有日志
CREATE POLICY "管理员可以查看操作日志"
    ON operation_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('super_admin', 'admin')
        )
    );

-- 所有人都可以写入日志（记录自己的操作）
CREATE POLICY "用户可以记录日志"
    ON operation_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 6. 修改 patients 表的 RLS 策略（现在基于角色而不是 user_id）
DROP POLICY IF EXISTS "用户只能查看自己的患者" ON patients;
DROP POLICY IF EXISTS "用户只能创建自己的患者" ON patients;
DROP POLICY IF EXISTS "用户只能更新自己的患者" ON patients;
DROP POLICY IF EXISTS "用户只能删除自己的患者" ON patients;

-- 所有登录用户都可以查看患者（因为数据是共享的）
CREATE POLICY "登录用户可以查看患者"
    ON patients FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- 管理员及以上可以创建患者
CREATE POLICY "管理员可以创建患者"
    ON patients FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('super_admin', 'admin')
        )
    );

-- 管理员及以上可以更新患者
CREATE POLICY "管理员可以更新患者"
    ON patients FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('super_admin', 'admin')
        )
    );

-- 管理员及以上可以删除患者
CREATE POLICY "管理员可以删除患者"
    ON patients FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('super_admin', 'admin')
        )
    );

-- 7. 修改 patient_data 表的 RLS 策略
DROP POLICY IF EXISTS "用户只能查看自己患者的数据" ON patient_data;
DROP POLICY IF EXISTS "用户只能插入自己患者的数据" ON patient_data;
DROP POLICY IF EXISTS "用户只能更新自己患者的数据" ON patient_data;
DROP POLICY IF EXISTS "用户只能删除自己患者的数据" ON patient_data;

-- 所有登录用户都可以查看数据
CREATE POLICY "登录用户可以查看患者数据"
    ON patient_data FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- 管理员及以上可以创建数据
CREATE POLICY "管理员可以创建患者数据"
    ON patient_data FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('super_admin', 'admin')
        )
    );

-- 管理员及以上可以更新数据
CREATE POLICY "管理员可以更新患者数据"
    ON patient_data FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('super_admin', 'admin')
        )
    );

-- 管理员及以上可以删除数据
CREATE POLICY "管理员可以删除患者数据"
    ON patient_data FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('super_admin', 'admin')
        )
    );

-- 8. 触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. 注释
COMMENT ON TABLE user_roles IS '用户角色表：super_admin=超级管理员，admin=管理员，user=普通用户';
COMMENT ON TABLE operation_logs IS '操作日志表：记录所有用户操作';
COMMENT ON COLUMN user_roles.role IS 'super_admin=全部权限，admin=数据管理，user=只读';
