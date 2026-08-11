// 完整字段定义 V3.0 - 严格对齐116字段数据库结构
// 基于 supabase_rebuild_full.sql
// 日期：2026-08-12

const FIELD_DEFINITIONS = {
    // ========== 基本信息 (1-7) ==========
    basic_info: [
        { name: 'study_id', label: '研究编号', type: 'text', required: true, readonly: true, hint: '自动生成如POCD-0001' },
        { name: 'name', label: '患者姓名', type: 'text', required: true, hint: '床旁核对用' },
        { name: 'enrollment_date', label: '入组日期', type: 'date', required: true },
        { name: 'surgery_date', label: '手术日期', type: 'date', required: true },
        { name: 'sleep_correction_triggered', label: '是否触发睡眠修正', type: 'select', options: ['是', '否'] },
        { name: 'has_standard_l3_ct', label: '是否有标准L3层面CT', type: 'select', options: ['是', '否'] },
        { name: 'completed_followup_nodes', label: '完成随访节点', type: 'text', hint: '如T0,POD1,POD3' },

        // 人口学特征 (28-31)
        { name: 'age', label: '年龄', type: 'number', min: 18, max: 120, required: true, hint: '岁' },
        { name: 'gender', label: '性别', type: 'select', options: ['男', '女'], required: true },
        { name: 'education_years', label: '受教育年限', type: 'number', min: 0, max: 30, required: true, hint: '年' },
        { name: 'occupation', label: '职业', type: 'text', hint: '如退休工人、农民' },

        // 手术相关 (59-63)
        { name: 'surgery_type', label: '手术类型', type: 'text', hint: '如胃癌根治术' },
        { name: 'expected_surgery_duration', label: '预计手术时间', type: 'number', min: 0, max: 1440, hint: '分钟' },
        { name: 'asa_grade', label: 'ASA分级', type: 'select', options: ['I', 'II', 'III', 'IV', 'V'] },
        { name: 'anesthesia_plan', label: '麻醉方案', type: 'text', hint: '如全麻+硬膜外' },
        { name: 'bmi', label: 'BMI', type: 'number', min: 10, max: 50, step: 0.1, hint: 'kg/m²' }
    ],

    // ========== T0基线认知评估 (8-27) ==========
    T0: [
        // MMSE分项 (8-19)
        { name: 't0_mmse_time_orientation', label: 'MMSE_时间定向', type: 'number', min: 0, max: 5, hint: '满分5' },
        { name: 't0_mmse_place_orientation', label: 'MMSE_地点定向', type: 'number', min: 0, max: 5, hint: '满分5' },
        { name: 't0_mmse_immediate_memory', label: 'MMSE_即刻记忆', type: 'number', min: 0, max: 3, hint: '满分3' },
        { name: 't0_mmse_attention_calculation', label: 'MMSE_注意计算', type: 'number', min: 0, max: 5, hint: '满分5' },
        { name: 't0_mmse_delayed_recall', label: 'MMSE_延迟回忆', type: 'number', min: 0, max: 3, hint: '满分3' },
        { name: 't0_mmse_naming', label: 'MMSE_命名', type: 'number', min: 0, max: 2, hint: '满分2' },
        { name: 't0_mmse_repetition', label: 'MMSE_复述', type: 'number', min: 0, max: 1, hint: '满分1' },
        { name: 't0_mmse_comprehension', label: 'MMSE_理解', type: 'number', min: 0, max: 3, hint: '满分3' },
        { name: 't0_mmse_reading', label: 'MMSE_阅读', type: 'number', min: 0, max: 1, hint: '满分1' },
        { name: 't0_mmse_writing', label: 'MMSE_书写', type: 'number', min: 0, max: 1, hint: '满分1' },
        { name: 't0_mmse_structure', label: 'MMSE_结构', type: 'number', min: 0, max: 1, hint: '满分1' },
        { name: 't0_mmse_total', label: 'MMSE总分', type: 'number', min: 0, max: 30, readonly: true, hint: '自动计算' },

        // MoCA分项 (20-27)
        { name: 't0_moca_visuospatial', label: 'MoCA_视空间执行', type: 'number', min: 0, max: 5, hint: '满分5' },
        { name: 't0_moca_naming', label: 'MoCA_命名', type: 'number', min: 0, max: 3, hint: '满分3' },
        { name: 't0_moca_attention', label: 'MoCA_注意力', type: 'number', min: 0, max: 6, hint: '满分6' },
        { name: 't0_moca_language', label: 'MoCA_语言', type: 'number', min: 0, max: 3, hint: '满分3' },
        { name: 't0_moca_abstraction', label: 'MoCA_抽象', type: 'number', min: 0, max: 2, hint: '满分2' },
        { name: 't0_moca_delayed_recall', label: 'MoCA_延迟回忆', type: 'number', min: 0, max: 5, hint: '满分5' },
        { name: 't0_moca_orientation', label: 'MoCA_定向', type: 'number', min: 0, max: 6, hint: '满分6' },
        { name: 't0_moca_total', label: 'MoCA总分', type: 'number', min: 0, max: 30, readonly: true, hint: '自动计算（教育≤12年+1）' },

        // 共病与用药史 (32-39)
        { name: 'hypertension', label: '高血压', type: 'select', options: ['有', '无'] },
        { name: 'diabetes', label: '糖尿病', type: 'select', options: ['有', '无'] },
        { name: 'coronary_heart_disease', label: '冠心病', type: 'select', options: ['有', '无'] },
        { name: 'cerebrovascular_disease', label: '脑血管病', type: 'select', options: ['有', '无'] },
        { name: 'charlson_cci', label: 'Charlson共病指数CCI', type: 'number', min: 0, max: 30, step: 1 },
        { name: 'benzodiazepine_history', label: '苯二氮䓬类用药史', type: 'select', options: ['有', '无'] },
        { name: 'anticholinergic_burden_acb', label: '抗胆碱能药物负荷ACB', type: 'number', min: 0, max: 10, step: 1 },
        { name: 'statin_history', label: '他汀类用药史', type: 'select', options: ['有', '无'] },

        // T0睡眠质量 (40-47)
        { name: 't0_psqi_subjective_quality', label: 'PSQI_主观睡眠质量', type: 'number', min: 0, max: 3 },
        { name: 't0_psqi_sleep_latency', label: 'PSQI_入睡潜伏期', type: 'number', min: 0, max: 3 },
        { name: 't0_psqi_sleep_duration', label: 'PSQI_睡眠时间', type: 'number', min: 0, max: 3 },
        { name: 't0_psqi_sleep_efficiency', label: 'PSQI_睡眠效率', type: 'number', min: 0, max: 3 },
        { name: 't0_psqi_sleep_disturbance', label: 'PSQI_睡眠紊乱', type: 'number', min: 0, max: 3 },
        { name: 't0_psqi_sleep_medication', label: 'PSQI_催眠药物', type: 'number', min: 0, max: 3 },
        { name: 't0_psqi_daytime_dysfunction', label: 'PSQI_日间功能障碍', type: 'number', min: 0, max: 3 },
        { name: 't0_psqi_total', label: 'PSQI总分', type: 'number', min: 0, max: 21, readonly: true, hint: '自动计算' },

        // T0营养与炎症指标 (48-54)
        { name: 't0_albumin_alb', label: '白蛋白ALB', type: 'number', min: 0, max: 60, step: 0.1, hint: 'g/L' },
        { name: 't0_prealbumin_pa', label: '前白蛋白PA', type: 'number', min: 0, max: 500, step: 0.1, hint: 'mg/L' },
        { name: 't0_pni', label: 'PNI预后营养指数', type: 'number', min: 0, max: 100, step: 0.1 },
        { name: 't0_crp', label: 'CRP', type: 'number', min: 0, max: 500, step: 0.1, hint: 'mg/L' },
        { name: 't0_nlr', label: 'NLR', type: 'number', min: 0, max: 50, step: 0.01 },
        { name: 't0_plr', label: 'PLR', type: 'number', min: 0, max: 1000, step: 0.1 },
        { name: 't0_sii', label: 'SII', type: 'number', min: 0, max: 5000, step: 0.1 },

        // T0肌肉功能 (55-58)
        { name: 't0_grip_strength', label: '握力', type: 'number', min: 0, max: 100, step: 0.1, hint: 'kg' },
        { name: 't0_gait_speed_6m', label: '6m步速', type: 'number', min: 0, max: 5, step: 0.01, hint: 'm/s' },
        { name: 't0_ct_l3_smi', label: 'CT_L3_SMI', type: 'number', min: 0, max: 100, step: 0.1, hint: 'cm²/m²' },
        { name: 't0_sarcopenia_awgs', label: '肌少症判定AWGS', type: 'select', options: ['是', '否', '可能'] }
    ],

    // ========== POD1术后第1天 (64-74) ==========
    POD1: [
        { name: 'pod1_cam_delirium', label: 'CAM谵妄', type: 'select', options: ['有', '无'] },
        { name: 'pod1_mmse_screening', label: 'MMSE快筛', type: 'number', min: 0, max: 30 },
        { name: 'pod1_rcsq_sleep', label: 'RCSQ睡眠自评', type: 'number', min: 0, max: 100, hint: 'mm VAS' },
        { name: 'pod1_subjective_sleep_deprivation', label: '主观睡眠剥夺主诉', type: 'text', hint: '患者描述' },
        { name: 'pod1_nurse_sleep_duration', label: '护士记录睡眠时长', type: 'number', min: 0, max: 24, step: 0.5, hint: '小时' },
        { name: 'pod1_sleep_correction_triggered', label: '睡眠修正是否触发', type: 'select', options: ['是', '否'] },
        { name: 'pod1_il6', label: 'IL6', type: 'number', min: 0, max: 1000, step: 0.1, hint: 'pg/mL' },
        { name: 'pod1_crp', label: 'CRP', type: 'number', min: 0, max: 500, step: 0.1, hint: 'mg/L' },
        { name: 'pod1_nlr', label: 'NLR', type: 'number', min: 0, max: 50, step: 0.01 },
        { name: 'pod1_nrs_pain', label: 'NRS疼痛', type: 'number', min: 0, max: 10 },
        { name: 'pod1_pca_use', label: '镇痛泵使用', type: 'select', options: ['是', '否'] },

        // 手术实际数据 (75-83)
        { name: 'actual_surgery_duration', label: '实际手术时长', type: 'number', min: 0, max: 1440, hint: '分钟' },
        { name: 'total_anesthesia_time', label: '总麻醉时间', type: 'number', min: 0, max: 1440, hint: '分钟' },
        { name: 'intraop_blood_loss', label: '术中失血量', type: 'number', min: 0, max: 10000, hint: 'ml' },
        { name: 'intraop_fluid_volume', label: '术中输液量', type: 'number', min: 0, max: 10000, hint: 'ml' },
        { name: 'propofol_sevoflurane_dose', label: '丙泊酚七氟烷用量', type: 'text', hint: '记录用药剂量' },
        { name: 'intraop_bis_mean', label: '术中BIS均值', type: 'number', min: 0, max: 100 },
        { name: 'intraop_bis_min', label: '术中BIS最低值', type: 'number', min: 0, max: 100 },
        { name: 'intraop_hypotension_duration', label: '术中低血压时长', type: 'number', min: 0, max: 1440, hint: '分钟' },
        { name: 'intraop_map_min', label: '术中最低MAP', type: 'number', min: 0, max: 200, hint: 'mmHg' }
    ],

    // ========== POD3术后第3天 (84-94) ==========
    POD3: [
        { name: 'pod3_mmse', label: 'MMSE', type: 'number', min: 0, max: 30 },
        { name: 'pod3_moca', label: 'MoCA', type: 'number', min: 0, max: 30 },
        { name: 'pod3_il6', label: 'IL6', type: 'number', min: 0, max: 1000, step: 0.1, hint: 'pg/mL' },
        { name: 'pod3_crp', label: 'CRP', type: 'number', min: 0, max: 500, step: 0.1, hint: 'mg/L' },
        { name: 'pod3_nlr', label: 'NLR', type: 'number', min: 0, max: 50, step: 0.01 },
        { name: 'pod3_plr', label: 'PLR', type: 'number', min: 0, max: 1000, step: 0.1 },
        { name: 'pod3_rcsq_sleep', label: 'RCSQ睡眠自评', type: 'number', min: 0, max: 100, hint: 'mm VAS' },
        { name: 'pod3_nurse_sleep_record', label: '护士睡眠记录', type: 'text' },
        { name: 'pod3_sleep_correction_compliance', label: '睡眠修正依从条目数', type: 'number', min: 0, max: 10 },
        { name: 'pod3_nrs_pain', label: 'NRS疼痛', type: 'number', min: 0, max: 10 },
        { name: 'pod3_barthel_index', label: 'Barthel指数', type: 'number', min: 0, max: 100 }
    ],

    // ========== POD7术后第7天 (95-104) ==========
    POD7: [
        { name: 'pod7_mmse', label: 'MMSE', type: 'number', min: 0, max: 30 },
        { name: 'pod7_moca', label: 'MoCA', type: 'number', min: 0, max: 30 },
        { name: 'pod7_pocd_diagnosis', label: 'POCD判定', type: 'select', options: ['是', '否', '待定'] },
        { name: 'pod7_cam_delirium', label: 'CAM谵妄', type: 'select', options: ['有', '无'] },
        { name: 'pod7_rcsq_cumulative_sleep', label: 'RCSQ及累积睡眠时长', type: 'text' },
        { name: 'pod7_crp', label: 'CRP', type: 'number', min: 0, max: 500, step: 0.1, hint: 'mg/L' },
        { name: 'pod7_nlr', label: 'NLR', type: 'number', min: 0, max: 50, step: 0.01 },
        { name: 'pod7_sleep_correction_cumulative', label: '睡眠修正依从累积', type: 'number', min: 0, max: 50 },
        { name: 'pod7_actual_discharge_date', label: '实际出院日期', type: 'date' },
        { name: 'pod7_discharge_destination', label: '出院去向', type: 'select', options: ['家', '康复科', '其他'] }
    ],

    // ========== POD14术后第14天 (105-106) ==========
    POD14: [
        { name: 'pod14_mmse_short', label: 'MMSE简版', type: 'number', min: 0, max: 30 },
        { name: 'pod14_psqi', label: 'PSQI', type: 'number', min: 0, max: 21 }
    ],

    // ========== POD30术后第30天 (107-113) ==========
    POD30: [
        { name: 'pod30_mmse', label: 'MMSE', type: 'number', min: 0, max: 30 },
        { name: 'pod30_moca', label: 'MoCA', type: 'number', min: 0, max: 30 },
        { name: 'pod30_pocd_diagnosis', label: 'POCD判定', type: 'select', options: ['是', '否', '待定'] },
        { name: 'pod30_psqi', label: 'PSQI', type: 'number', min: 0, max: 21 },
        { name: 'pod30_sf12_qol', label: 'SF12生活质量', type: 'text' },
        { name: 'pod30_barthel_index', label: 'Barthel指数', type: 'number', min: 0, max: 100 },
        { name: 'pod30_adverse_events', label: '不良事件', type: 'text', hint: '记录所有不良事件' },

        // 数据管理 (114-116)
        { name: 'data_completeness', label: '数据完整性', type: 'select', options: ['完整', '部分缺失', '大量缺失'] },
        { name: 'dropout_reason', label: '脱落原因', type: 'text' },
        { name: 'notes', label: '备注', type: 'text' }
    ]
};
