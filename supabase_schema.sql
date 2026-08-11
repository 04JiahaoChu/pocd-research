-- POCD研究数据采集系统 V2.0 - Supabase数据库Schema
-- 执行方式：复制到Supabase Dashboard → SQL Editor → 粘贴运行

-- 1. 患者表（核心）
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    study_id TEXT NOT NULL UNIQUE,  -- 研究编号（如POCD2024-0001）
    name TEXT,  -- 患者姓名（仅床旁用，导出时删除）
    medical_record_no TEXT,  -- 病案号/住院号
    ward TEXT,  -- 病区
    bed_no TEXT,  -- 床号
    phone TEXT,  -- 联系电话（加密存储）
    enroll_date DATE NOT NULL,  -- 入组日期
    surgery_date DATE,  -- 手术日期（决定POD节点计算）
    has_l3_ct TEXT,  -- 是否有标准L3层面CT（是/否）
    sleep_intervention_triggered TEXT,  -- 是否触发睡眠修正（是/否）
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 数据采集表（所有时间节点数据）
CREATE TABLE patient_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    phase TEXT NOT NULL,  -- 'T0' | 'POD1' | 'POD3' | 'POD7' | 'POD14' | 'POD30'
    data JSONB NOT NULL,  -- 该节点的所有字段数据
    completed BOOLEAN DEFAULT false,  -- 是否已完成
    completed_at TIMESTAMPTZ,  -- 完成时间
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(patient_id, phase)  -- 每个患者每个节点只能有一条记录
);

-- 3. 索引优化
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_study_id ON patients(study_id);
CREATE INDEX idx_patient_data_patient_id ON patient_data(patient_id);
CREATE INDEX idx_patient_data_phase ON patient_data(phase);
CREATE INDEX idx_patient_data_completed ON patient_data(completed);

-- 4. 行级安全策略（RLS）- 用户只能访问自己的数据
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_data ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己创建的患者
CREATE POLICY "用户只能查看自己的患者"
    ON patients FOR SELECT
    USING (auth.uid() = user_id);

-- 用户只能插入自己的患者
CREATE POLICY "用户只能创建自己的患者"
    ON patients FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的患者
CREATE POLICY "用户只能更新自己的患者"
    ON patients FOR UPDATE
    USING (auth.uid() = user_id);

-- 用户只能删除自己的患者
CREATE POLICY "用户只能删除自己的患者"
    ON patients FOR DELETE
    USING (auth.uid() = user_id);

-- 患者数据的RLS策略
CREATE POLICY "用户只能查看自己患者的数据"
    ON patient_data FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM patients
            WHERE patients.id = patient_data.patient_id
            AND patients.user_id = auth.uid()
        )
    );

CREATE POLICY "用户只能插入自己患者的数据"
    ON patient_data FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM patients
            WHERE patients.id = patient_data.patient_id
            AND patients.user_id = auth.uid()
        )
    );

CREATE POLICY "用户只能更新自己患者的数据"
    ON patient_data FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM patients
            WHERE patients.id = patient_data.patient_id
            AND patients.user_id = auth.uid()
        )
    );

CREATE POLICY "用户只能删除自己患者的数据"
    ON patient_data FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM patients
            WHERE patients.id = patient_data.patient_id
            AND patients.user_id = auth.uid()
        )
    );

-- 5. 自动更新updated_at的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_data_updated_at
    BEFORE UPDATE ON patient_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. 示例数据（可选，测试用）
-- INSERT INTO patients (user_id, study_id, name, enroll_date, surgery_date)
-- VALUES (auth.uid(), 'POCD2024-0001', '张三', '2026-08-01', '2026-08-05');
