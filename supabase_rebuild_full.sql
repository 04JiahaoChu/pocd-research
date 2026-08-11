-- POCD研究数据采集系统 - 完整版数据库重建
-- 严格对齐 Master CRF V1.0 和 Excel数据统计表
-- 版本：3.0
-- 日期：2026-08-11

-- ==========================================
-- 1. 清理旧表（保留用户认证相关表）
-- ==========================================

DROP TABLE IF EXISTS patient_data CASCADE;
DROP TABLE IF EXISTS assessments CASCADE;
DROP TABLE IF EXISTS patients CASCADE;

-- ==========================================
-- 2. 创建完整的患者数据表
-- ==========================================

CREATE TABLE patients (
    -- 系统字段
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,  -- 创建该患者记录的用户ID
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- 基础信息（1-7）
    study_id TEXT NOT NULL UNIQUE,  -- 研究编号
    name TEXT NOT NULL,  -- 患者姓名
    enrollment_date DATE,  -- 入组日期
    surgery_date DATE,  -- 手术日期
    sleep_correction_triggered BOOLEAN,  -- 是否触发睡眠修正
    has_standard_l3_ct BOOLEAN,  -- 是否有标准L3层面CT
    completed_followup_nodes TEXT,  -- 完成随访节点

    -- T0基线认知评估（8-27）
    t0_mmse_total NUMERIC,  -- T0_MMSE总分
    t0_moca_total NUMERIC,  -- T0_MoCA总分
    t0_mmse_time_orientation NUMERIC,  -- T0_MMSE_时间定向
    t0_mmse_place_orientation NUMERIC,  -- T0_MMSE_地点定向
    t0_mmse_immediate_memory NUMERIC,  -- T0_MMSE_即刻记忆
    t0_mmse_attention_calculation NUMERIC,  -- T0_MMSE_注意计算
    t0_mmse_delayed_recall NUMERIC,  -- T0_MMSE_延迟回忆
    t0_mmse_naming NUMERIC,  -- T0_MMSE_命名
    t0_mmse_repetition NUMERIC,  -- T0_MMSE_复述
    t0_mmse_comprehension NUMERIC,  -- T0_MMSE_理解
    t0_mmse_reading NUMERIC,  -- T0_MMSE_阅读
    t0_mmse_writing NUMERIC,  -- T0_MMSE_书写
    t0_mmse_structure NUMERIC,  -- T0_MMSE_结构
    t0_moca_visuospatial NUMERIC,  -- T0_MoCA_视空间执行
    t0_moca_naming NUMERIC,  -- T0_MoCA_命名
    t0_moca_attention NUMERIC,  -- T0_MoCA_注意力
    t0_moca_language NUMERIC,  -- T0_MoCA_语言
    t0_moca_abstraction NUMERIC,  -- T0_MoCA_抽象
    t0_moca_delayed_recall NUMERIC,  -- T0_MoCA_延迟回忆
    t0_moca_orientation NUMERIC,  -- T0_MoCA_定向

    -- 人口学特征（28-31）
    age INTEGER,  -- 年龄
    gender TEXT,  -- 性别
    education_years INTEGER,  -- 受教育年限
    occupation TEXT,  -- 职业

    -- 共病与用药史（32-39）
    hypertension BOOLEAN,  -- 高血压
    diabetes BOOLEAN,  -- 糖尿病
    coronary_heart_disease BOOLEAN,  -- 冠心病
    cerebrovascular_disease BOOLEAN,  -- 脑血管病
    charlson_cci NUMERIC,  -- Charlson共病指数CCI
    benzodiazepine_history BOOLEAN,  -- 苯二氮䓬类用药史
    anticholinergic_burden_acb NUMERIC,  -- 抗胆碱能药物负荷ACB
    statin_history BOOLEAN,  -- 他汀类用药史

    -- T0睡眠质量（40-47）
    t0_psqi_total NUMERIC,  -- T0_PSQI总分
    t0_psqi_subjective_quality NUMERIC,  -- T0_PSQI_主观睡眠质量
    t0_psqi_sleep_latency NUMERIC,  -- T0_PSQI_入睡潜伏期
    t0_psqi_sleep_duration NUMERIC,  -- T0_PSQI_睡眠时间
    t0_psqi_sleep_efficiency NUMERIC,  -- T0_PSQI_睡眠效率
    t0_psqi_sleep_disturbance NUMERIC,  -- T0_PSQI_睡眠紊乱
    t0_psqi_sleep_medication NUMERIC,  -- T0_PSQI_催眠药物
    t0_psqi_daytime_dysfunction NUMERIC,  -- T0_PSQI_日间功能障碍

    -- T0营养与炎症指标（48-54）
    t0_albumin_alb NUMERIC,  -- T0_白蛋白ALB
    t0_prealbumin_pa NUMERIC,  -- T0_前白蛋白PA
    t0_pni NUMERIC,  -- T0_PNI预后营养指数
    t0_crp NUMERIC,  -- T0_CRP
    t0_nlr NUMERIC,  -- T0_NLR
    t0_plr NUMERIC,  -- T0_PLR
    t0_sii NUMERIC,  -- T0_SII

    -- T0肌肉功能（55-58）
    t0_grip_strength NUMERIC,  -- T0_握力
    t0_gait_speed_6m NUMERIC,  -- T0_6m步速
    t0_ct_l3_smi NUMERIC,  -- T0_CT_L3_SMI
    t0_sarcopenia_awgs TEXT,  -- T0_肌少症判定AWGS

    -- 手术相关（59-63）
    surgery_type TEXT,  -- 手术类型
    expected_surgery_duration NUMERIC,  -- 预计手术时间（分钟）
    asa_grade TEXT,  -- ASA分级
    anesthesia_plan TEXT,  -- 麻醉方案
    bmi NUMERIC,  -- BMI

    -- POD1术后第1天（64-74）
    pod1_cam_delirium BOOLEAN,  -- POD1_CAM谵妄
    pod1_mmse_screening NUMERIC,  -- POD1_MMSE快筛
    pod1_rcsq_sleep NUMERIC,  -- POD1_RCSQ睡眠自评
    pod1_subjective_sleep_deprivation TEXT,  -- POD1_主观睡眠剥夺主诉
    pod1_nurse_sleep_duration NUMERIC,  -- POD1_护士记录睡眠时长
    pod1_sleep_correction_triggered BOOLEAN,  -- POD1_睡眠修正是否触发
    pod1_il6 NUMERIC,  -- POD1_IL6
    pod1_crp NUMERIC,  -- POD1_CRP
    pod1_nlr NUMERIC,  -- POD1_NLR
    pod1_nrs_pain NUMERIC,  -- POD1_NRS疼痛
    pod1_pca_use BOOLEAN,  -- POD1_镇痛泵使用

    -- 手术实际数据（75-83）
    actual_surgery_duration NUMERIC,  -- 实际手术时长（分钟）
    total_anesthesia_time NUMERIC,  -- 总麻醉时间（分钟）
    intraop_blood_loss NUMERIC,  -- 术中失血量（ml）
    intraop_fluid_volume NUMERIC,  -- 术中输液量（ml）
    propofol_sevoflurane_dose TEXT,  -- 丙泊酚七氟烷用量
    intraop_bis_mean NUMERIC,  -- 术中BIS均值
    intraop_bis_min NUMERIC,  -- 术中BIS最低值
    intraop_hypotension_duration NUMERIC,  -- 术中低血压时长（分钟）
    intraop_map_min NUMERIC,  -- 术中最低MAP

    -- POD3术后第3天（84-94）
    pod3_mmse NUMERIC,  -- POD3_MMSE
    pod3_moca NUMERIC,  -- POD3_MoCA
    pod3_il6 NUMERIC,  -- POD3_IL6
    pod3_crp NUMERIC,  -- POD3_CRP
    pod3_nlr NUMERIC,  -- POD3_NLR
    pod3_plr NUMERIC,  -- POD3_PLR
    pod3_rcsq_sleep NUMERIC,  -- POD3_RCSQ睡眠自评
    pod3_nurse_sleep_record TEXT,  -- POD3_护士睡眠记录
    pod3_sleep_correction_compliance INT,  -- POD3_睡眠修正依从条目数
    pod3_nrs_pain NUMERIC,  -- POD3_NRS疼痛
    pod3_barthel_index NUMERIC,  -- POD3_Barthel指数

    -- POD7术后第7天（95-104）
    pod7_mmse NUMERIC,  -- POD7_MMSE
    pod7_moca NUMERIC,  -- POD7_MoCA
    pod7_pocd_diagnosis TEXT,  -- POD7_POCD判定
    pod7_cam_delirium BOOLEAN,  -- POD7_CAM谵妄
    pod7_rcsq_cumulative_sleep TEXT,  -- POD7_RCSQ及累积睡眠时长
    pod7_crp NUMERIC,  -- POD7_CRP
    pod7_nlr NUMERIC,  -- POD7_NLR
    pod7_sleep_correction_cumulative INT,  -- POD7_睡眠修正依从累积
    pod7_actual_discharge_date DATE,  -- POD7_实际出院日期
    pod7_discharge_destination TEXT,  -- POD7_出院去向

    -- POD14术后第14天（105-106）
    pod14_mmse_short NUMERIC,  -- POD14_MMSE简版
    pod14_psqi NUMERIC,  -- POD14_PSQI

    -- POD30术后第30天（107-113）
    pod30_mmse NUMERIC,  -- POD30_MMSE
    pod30_moca NUMERIC,  -- POD30_MoCA
    pod30_pocd_diagnosis TEXT,  -- POD30_POCD判定
    pod30_psqi NUMERIC,  -- POD30_PSQI
    pod30_sf12_qol TEXT,  -- POD30_SF12生活质量
    pod30_barthel_index NUMERIC,  -- POD30_Barthel指数
    pod30_adverse_events TEXT,  -- POD30_不良事件

    -- 数据管理（114-116）
    data_completeness TEXT,  -- 数据完整性
    dropout_reason TEXT,  -- 脱落原因
    notes TEXT  -- 备注
);

-- 创建索引
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_study_id ON patients(study_id);
CREATE INDEX idx_patients_surgery_date ON patients(surgery_date);
CREATE INDEX idx_patients_enrollment_date ON patients(enrollment_date);

-- ==========================================
-- 3. RLS 权限策略
-- ==========================================

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

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

-- 管理员可以修改任何患者
CREATE POLICY "管理员可修改患者" ON patients
    FOR UPDATE
    TO authenticated, anon
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id::text = current_setting('app.user_id', true)
            AND users.role IN ('super_admin', 'admin')
        )
    );

-- 管理员可以删除任何患者
CREATE POLICY "管理员可删除患者" ON patients
    FOR DELETE
    TO authenticated, anon
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id::text = current_setting('app.user_id', true)
            AND users.role IN ('super_admin', 'admin')
        )
    );

-- ==========================================
-- 4. 辅助函数
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
    SELECT COALESCE(MAX(CAST(SUBSTRING(study_id FROM 'POCD-(\d+)') AS INTEGER)), 0)
    INTO last_number
    FROM patients
    WHERE study_id ~ '^POCD-\d+$';

    next_id := 'POCD-' || LPAD((last_number + 1)::TEXT, 4, '0');
    RETURN next_id;
END;
$$;

-- ==========================================
-- 完成
-- ==========================================

COMMENT ON TABLE patients IS 'POCD研究完整数据表 - 对齐Master CRF V1.0（116个字段）';
