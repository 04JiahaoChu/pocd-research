-- POCD研究数据库 - 匹配实际代码的正确版本
-- 执行日期：2026-08-11

-- ===========================
-- 第1步：清理旧表
-- ===========================

DROP VIEW IF EXISTS today_tasks CASCADE;
DROP TABLE IF EXISTS assessments CASCADE;
DROP TABLE IF EXISTS patient_data CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ===========================
-- 第2步：创建患者表（匹配代码结构）
-- ===========================

CREATE TABLE patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,

    -- 患者标识信息
    study_id TEXT UNIQUE NOT NULL,
    name TEXT,
    medical_record_no TEXT,
    ward TEXT,
    bed_no TEXT,
    phone TEXT,

    -- 日期信息
    enroll_date DATE NOT NULL,
    surgery_date DATE,

    -- 基础信息
    age INTEGER,
    gender TEXT,
    education_years INTEGER,
    occupation TEXT,
    bmi DECIMAL(5,2),

    -- 特殊标记
    has_l3_ct BOOLEAN,
    sleep_intervention_triggered BOOLEAN,

    -- 元数据
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 约束
    CONSTRAINT valid_age CHECK (age > 0 AND age < 120),
    CONSTRAINT valid_education CHECK (education_years >= 0 AND education_years <= 30)
);

-- ===========================
-- 第3步：创建评估数据表
-- ===========================

CREATE TABLE patient_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    phase TEXT NOT NULL,
    data JSONB NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(patient_id, phase)
);

-- ===========================
-- 第4步：创建索引
-- ===========================

CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_study_id ON patients(study_id);
CREATE INDEX idx_patients_enroll_date ON patients(enroll_date);
CREATE INDEX idx_patients_surgery_date ON patients(surgery_date);
CREATE INDEX idx_patient_data_patient_id ON patient_data(patient_id);
CREATE INDEX idx_patient_data_phase ON patient_data(phase);
CREATE INDEX idx_patient_data_completed ON patient_data(completed);

-- ===========================
-- 第5步：创建触发器
-- ===========================

CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_data_updated_at
    BEFORE UPDATE ON patient_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================
-- 第6步：启用RLS
-- ===========================

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "允许所有人查看患者数据" ON patients FOR SELECT USING (true);
CREATE POLICY "允许所有人插入患者数据" ON patients FOR INSERT WITH CHECK (true);
CREATE POLICY "允许所有人更新患者数据" ON patients FOR UPDATE USING (true);
CREATE POLICY "允许所有人删除患者数据" ON patients FOR DELETE USING (true);

CREATE POLICY "允许所有人查看评估数据" ON patient_data FOR SELECT USING (true);
CREATE POLICY "允许所有人插入评估数据" ON patient_data FOR INSERT WITH CHECK (true);
CREATE POLICY "允许所有人更新评估数据" ON patient_data FOR UPDATE USING (true);
CREATE POLICY "允许所有人删除评估数据" ON patient_data FOR DELETE USING (true);

-- ===========================
-- 第7步：插入测试数据
-- ===========================

-- 使用固定UUID作为测试用户ID（匹配代码中的自动登录逻辑）
INSERT INTO patients (
    user_id,
    study_id,
    name,
    medical_record_no,
    ward,
    bed_no,
    phone,
    enroll_date,
    surgery_date,
    age,
    gender,
    education_years,
    bmi
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'POCD001',
    '张三',
    '2024001',
    '骨科',
    '101-1',
    '13800138000',
    CURRENT_DATE - INTERVAL '2 days',
    CURRENT_DATE + INTERVAL '1 day',
    65,
    '男',
    12,
    23.5
);

-- ===========================
-- 完成！
-- ===========================

SELECT
    '✅ 数据库创建成功！' AS status,
    (SELECT COUNT(*) FROM patients) AS patients_count,
    (SELECT COUNT(*) FROM patient_data) AS patient_data_count,
    '表结构已匹配代码！' AS note;
