-- POCD研究数据采集系统 - 简化版数据库重建
-- 版本：2.0
-- 日期：2026-08-11

-- ==========================================
-- 1. 清理旧表（保留用户认证相关表）
-- ==========================================

DROP TABLE IF EXISTS assessments CASCADE;
DROP TABLE IF EXISTS patients CASCADE;

-- ==========================================
-- 2. 创建简化的患者基础信息表
-- ==========================================

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,  -- 创建该患者记录的用户ID
    study_id TEXT NOT NULL UNIQUE,  -- 研究编号，如 POCD-0001
    name TEXT NOT NULL,  -- 患者姓名
    enrollment_date DATE,  -- 入组日期
    surgery_date DATE,  -- 手术日期
    age INTEGER,  -- 年龄
    gender TEXT,  -- 性别
    medical_record_no TEXT,  -- 病历号
    ward TEXT,  -- 病区
    bed_no TEXT,  -- 床号
    phone TEXT,  -- 联系电话
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_study_id ON patients(study_id);
CREATE INDEX idx_patients_surgery_date ON patients(surgery_date);

-- ==========================================
-- 3. 创建评估数据表（存储各时间点的详细数据）
-- ==========================================

CREATE TABLE patient_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    phase TEXT NOT NULL,  -- baseline, pod1, pod3, pod7, pod14, pod30
    data_json JSONB,  -- 存储该阶段的所有评估数据
    completed BOOLEAN DEFAULT FALSE,  -- 是否完成
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_patient_data_patient_id ON patient_data(patient_id);
CREATE INDEX idx_patient_data_phase ON patient_data(phase);
CREATE INDEX idx_patient_data_completed ON patient_data(completed);

-- ==========================================
-- 4. RLS 权限策略
-- ==========================================

-- 启用 RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_data ENABLE ROW LEVEL SECURITY;

-- patients 表权限策略
-- 所有登录用户可以查看所有患者
CREATE POLICY "所有用户可查看患者" ON patients
    FOR SELECT
    TO authenticated, anon
    USING (true);

-- 所有登录用户可以创建患者
CREATE POLICY "所有用户可创建患者" ON patients
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

-- 管理员可以修改和删除任何患者
CREATE POLICY "管理员可修改患者" ON patients
    FOR UPDATE
    TO authenticated, anon
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.user_id::text = current_setting('app.user_id', true)
            AND users.role IN ('super_admin', 'admin')
        )
    );

CREATE POLICY "管理员可删除患者" ON patients
    FOR DELETE
    TO authenticated, anon
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.user_id::text = current_setting('app.user_id', true)
            AND users.role IN ('super_admin', 'admin')
        )
    );

-- patient_data 表权限策略（与 patients 表相同）
CREATE POLICY "所有用户可查看评估数据" ON patient_data
    FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "所有用户可创建评估数据" ON patient_data
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

CREATE POLICY "管理员可修改评估数据" ON patient_data
    FOR UPDATE
    TO authenticated, anon
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.user_id::text = current_setting('app.user_id', true)
            AND users.role IN ('super_admin', 'admin')
        )
    );

CREATE POLICY "管理员可删除评估数据" ON patient_data
    FOR DELETE
    TO authenticated, anon
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.user_id::text = current_setting('app.user_id', true)
            AND users.role IN ('super_admin', 'admin')
        )
    );

-- ==========================================
-- 5. 辅助函数
-- ==========================================

-- 生成下一个研究编号
CREATE OR REPLACE FUNCTION get_next_study_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    last_number INTEGER;
    next_id TEXT;
BEGIN
    -- 获取最后一个研究编号的数字部分
    SELECT COALESCE(MAX(CAST(SUBSTRING(study_id FROM 'POCD-(\d+)') AS INTEGER)), 0)
    INTO last_number
    FROM patients
    WHERE study_id ~ '^POCD-\d+$';

    -- 生成下一个编号
    next_id := 'POCD-' || LPAD((last_number + 1)::TEXT, 4, '0');

    RETURN next_id;
END;
$$;

-- ==========================================
-- 完成
-- ==========================================

COMMENT ON TABLE patients IS 'POCD研究患者基础信息表（简化版）';
COMMENT ON TABLE patient_data IS 'POCD研究评估数据表（各时间点数据以JSON存储）';
