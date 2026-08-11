-- POCD研究数据库 - 完全重建（安全版本）
-- 执行日期：2026-08-11
-- 说明：先检查存在性再删除，避免报错

-- ===========================
-- 第1步：安全清理（只删除存在的对象）
-- ===========================

-- 删除视图（如果存在）
DROP VIEW IF EXISTS today_tasks;

-- 删除表（如果存在，CASCADE会自动删除所有依赖的策略、触发器等）
DROP TABLE IF EXISTS assessments CASCADE;
DROP TABLE IF EXISTS patients CASCADE;

-- 删除函数（如果存在）
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ===========================
-- 第2步：创建患者表
-- ===========================

CREATE TABLE patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    age INTEGER,
    gender TEXT,
    surgery_date DATE NOT NULL,
    surgery_type TEXT,
    asa_class TEXT,
    education_years INTEGER,
    phone TEXT,

    -- 时间点完成标记
    baseline_completed BOOLEAN DEFAULT FALSE,
    pod1_completed BOOLEAN DEFAULT FALSE,
    pod3_completed BOOLEAN DEFAULT FALSE,
    pod7_completed BOOLEAN DEFAULT FALSE,
    pod14_completed BOOLEAN DEFAULT FALSE,
    pod30_completed BOOLEAN DEFAULT FALSE,

    -- 元数据
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT,

    -- 约束
    CONSTRAINT valid_age CHECK (age > 0 AND age < 120),
    CONSTRAINT valid_education CHECK (education_years >= 0 AND education_years <= 30)
);

-- ===========================
-- 第3步：创建评估数据表
-- ===========================

CREATE TABLE assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    phase TEXT NOT NULL,
    data JSONB NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT,
    UNIQUE(patient_id, phase)
);

-- ===========================
-- 第4步：创建索引
-- ===========================

CREATE INDEX idx_patients_surgery_date ON patients(surgery_date);
CREATE INDEX idx_patients_patient_id ON patients(patient_id);
CREATE INDEX idx_assessments_patient_id ON assessments(patient_id);
CREATE INDEX idx_assessments_phase ON assessments(phase);
CREATE INDEX idx_assessments_completed ON assessments(completed);

-- ===========================
-- 第5步：创建自动更新时间戳的触发器
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

CREATE TRIGGER update_assessments_updated_at
    BEFORE UPDATE ON assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================
-- 第6步：启用行级安全策略（RLS）
-- ===========================

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- 创建允许所有操作的策略（团队共享数据）
CREATE POLICY "允许所有人查看患者数据" ON patients FOR SELECT USING (true);
CREATE POLICY "允许所有人插入患者数据" ON patients FOR INSERT WITH CHECK (true);
CREATE POLICY "允许所有人更新患者数据" ON patients FOR UPDATE USING (true);
CREATE POLICY "允许所有人删除患者数据" ON patients FOR DELETE USING (true);

CREATE POLICY "允许所有人查看评估数据" ON assessments FOR SELECT USING (true);
CREATE POLICY "允许所有人插入评估数据" ON assessments FOR INSERT WITH CHECK (true);
CREATE POLICY "允许所有人更新评估数据" ON assessments FOR UPDATE USING (true);
CREATE POLICY "允许所有人删除评估数据" ON assessments FOR DELETE USING (true);

-- ===========================
-- 第7步：创建今日任务视图
-- ===========================

CREATE VIEW today_tasks AS
SELECT
    p.id,
    p.patient_id,
    p.name,
    p.surgery_date,
    p.baseline_completed,
    p.pod1_completed,
    p.pod3_completed,
    p.pod7_completed,
    p.pod14_completed,
    p.pod30_completed,
    CURRENT_DATE - p.surgery_date AS days_since_surgery
FROM patients p
WHERE p.surgery_date <= CURRENT_DATE + INTERVAL '7 days'
ORDER BY p.surgery_date ASC;

-- ===========================
-- 第8步：插入测试数据（验证表结构）
-- ===========================

INSERT INTO patients (patient_id, name, age, gender, surgery_date, surgery_type, asa_class, education_years, phone)
VALUES ('TEST001', '测试患者', 65, '男', CURRENT_DATE, '腹部手术', 'II', 12, '13800138000');

-- ===========================
-- 完成！验证创建结果
-- ===========================

SELECT
    '✅ 数据库创建成功！' AS status,
    (SELECT COUNT(*) FROM patients) AS patients_count,
    (SELECT COUNT(*) FROM assessments) AS assessments_count,
    '已插入1条测试数据' AS test_data;
