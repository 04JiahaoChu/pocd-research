-- POCD研究数据库表结构
-- 创建日期：2026-08-11

-- 1. 创建患者表
CREATE TABLE IF NOT EXISTS patients (
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

    -- 时间点标记
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

    -- 索引优化
    CONSTRAINT valid_age CHECK (age > 0 AND age < 120),
    CONSTRAINT valid_education CHECK (education_years >= 0 AND education_years <= 30)
);

-- 2. 创建评估数据表（存储所有时间点的评估数据）
CREATE TABLE IF NOT EXISTS assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    phase TEXT NOT NULL, -- 'baseline', 'POD1', 'POD3', 'POD7', 'POD14', 'POD30'

    -- 评估数据（JSONB格式，灵活存储）
    data JSONB NOT NULL,

    -- 完成状态
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,

    -- 元数据
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT,

    -- 唯一约束：每个患者每个时间点只有一条记录
    UNIQUE(patient_id, phase)
);

-- 3. 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_patients_surgery_date ON patients(surgery_date);
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_assessments_patient_id ON assessments(patient_id);
CREATE INDEX IF NOT EXISTS idx_assessments_phase ON assessments(phase);
CREATE INDEX IF NOT EXISTS idx_assessments_completed ON assessments(completed);

-- 4. 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. 启用行级安全策略（RLS）但允许匿名访问
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- 允许所有操作（因为是研究项目，团队共享数据）
CREATE POLICY "允许所有人查看患者数据" ON patients FOR SELECT USING (true);
CREATE POLICY "允许所有人插入患者数据" ON patients FOR INSERT WITH CHECK (true);
CREATE POLICY "允许所有人更新患者数据" ON patients FOR UPDATE USING (true);
CREATE POLICY "允许所有人删除患者数据" ON patients FOR DELETE USING (true);

CREATE POLICY "允许所有人查看评估数据" ON assessments FOR SELECT USING (true);
CREATE POLICY "允许所有人插入评估数据" ON assessments FOR INSERT WITH CHECK (true);
CREATE POLICY "允许所有人更新评估数据" ON assessments FOR UPDATE USING (true);
CREATE POLICY "允许所有人删除评估数据" ON assessments FOR DELETE USING (true);

-- 6. 创建视图：方便查询今日任务
CREATE OR REPLACE VIEW today_tasks AS
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
WHERE
    -- 显示未来7天内的任务
    p.surgery_date <= CURRENT_DATE + INTERVAL '7 days'
ORDER BY p.surgery_date ASC;

-- 完成！
SELECT '✅ POCD研究数据库表结构创建成功！' AS status;
