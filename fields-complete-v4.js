// 完整字段定义 V4.0 - 严格匹配数据库实际字段
// 移除不存在的字段：bed_no, ward, medical_record_no, phone
// 日期：2026-08-12

const FIELD_DEFINITIONS = {
    // ========== 基本信息 ==========
    basic_info: [
        { name: 'study_id', label: '研究编号', type: 'text', required: true, readonly: true, hint: '自动生成如POCD-0001' },
        { name: 'name', label: '患者姓名', type: 'text', required: false, hint: '床旁核对用' },
        { name: 'enrollment_date', label: '入组日期', type: 'date', required: true },
        { name: 'surgery_date', label: '手术日期', type: 'date', required: true },
        { name: 'sleep_correction_triggered', label: '是否触发睡眠修正', type: 'select', options: ['是', '否'] },
        { name: 'has_standard_l3_ct', label: '是否有标准L3层面CT', type: 'select', options: ['是', '否'] },
        { name: 'completed_followup_nodes', label: '完成随访节点', type: 'text', hint: '如T0,POD1,POD3' },

        // 人口学特征
        { name: 'age', label: '年龄', type: 'number', min: 18, max: 120, required: true, hint: '岁' },
        { name: 'gender', label: '性别', type: 'select', options: ['男', '女'], required: true },
        { name: 'education_years', label: '受教育年限', type: 'number', min: 0, max: 30, required: true, hint: '年' },
        { name: 'occupation', label: '职业', type: 'text', hint: '如退休工人、农民' },

        // 手术相关
        { name: 'surgery_type', label: '手术类型', type: 'text', hint: '如胃癌根治术' },
        { name: 'expected_surgery_duration', label: '预计手术时间', type: 'number', min: 0, max: 1440, hint: '分钟' },
        { name: 'asa_grade', label: 'ASA分级', type: 'select', options: ['I', 'II', 'III', 'IV', 'V'] },
        { name: 'anesthesia_plan', label: '麻醉方案', type: 'text', hint: '如全麻+硬膜外' },
        { name: 'bmi', label: 'BMI', type: 'number', min: 10, max: 50, step: 0.1, hint: 'kg/m²' },

        // 基线疾病史
        { name: 'hypertension', label: '高血压', type: 'select', options: ['是', '否'] },
        { name: 'diabetes', label: '糖尿病', type: 'select', options: ['是', '否'] },
        { name: 'coronary_heart_disease', label: '冠心病', type: 'select', options: ['是', '否'] },
        { name: 'cerebrovascular_disease', label: '脑血管病', type: 'select', options: ['是', '否'] },
        { name: 'benzodiazepine_history', label: '苯二氮䓬类药物史', type: 'select', options: ['是', '否'] },
        { name: 'statin_history', label: '他汀类药物史', type: 'select', options: ['是', '否'] }
    ],

    // ========== T0 术前基线 ==========
    T0: [
        // MMSE分项
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

        // MoCA分项
        { name: 't0_moca_visuospatial', label: 'MoCA_视空间执行', type: 'number', min: 0, max: 5, hint: '满分5' },
        { name: 't0_moca_naming', label: 'MoCA_命名', type: 'number', min: 0, max: 3, hint: '满分3' },
        { name: 't0_moca_attention', label: 'MoCA_注意力', type: 'number', min: 0, max: 6, hint: '满分6' },
        { name: 't0_moca_language', label: 'MoCA_语言', type: 'number', min: 0, max: 3, hint: '满分3' },
        { name: 't0_moca_abstraction', label: 'MoCA_抽象', type: 'number', min: 0, max: 2, hint: '满分2' },
        { name: 't0_moca_delayed_recall', label: 'MoCA_延迟回忆', type: 'number', min: 0, max: 5, hint: '满分5' },
        { name: 't0_moca_orientation', label: 'MoCA_定向', type: 'number', min: 0, max: 6, hint: '满分6' },
        { name: 't0_moca_total', label: 'MoCA总分', type: 'number', min: 0, max: 30, readonly: true, hint: '自动计算' },

        // PSQI分项
        { name: 't0_psqi_subjective_quality', label: 'PSQI_主观睡眠质量', type: 'number', min: 0, max: 3 },
        { name: 't0_psqi_sleep_latency', label: 'PSQI_入睡时间', type: 'number', min: 0, max: 3 },
        { name: 't0_psqi_sleep_duration', label: 'PSQI_睡眠时间', type: 'number', min: 0, max: 3 },
        { name: 't0_psqi_sleep_efficiency', label: 'PSQI_睡眠效率', type: 'number', min: 0, max: 3 },
        { name: 't0_psqi_sleep_disturbance', label: 'PSQI_睡眠障碍', type: 'number', min: 0, max: 3 },
        { name: 't0_psqi_sleep_medication', label: 'PSQI_催眠药物', type: 'number', min: 0, max: 3 },
        { name: 't0_psqi_daytime_dysfunction', label: 'PSQI_日间功能障碍', type: 'number', min: 0, max: 3 },
        { name: 't0_psqi_total', label: 'PSQI总分', type: 'number', min: 0, max: 21, readonly: true, hint: '自动计算' },

        // 营养与炎症指标
        { name: 't0_albumin_alb', label: '白蛋白ALB', type: 'number', min: 0, max: 100, step: 0.1, hint: 'g/L' },
        { name: 't0_prealbumin_pa', label: '前白蛋白PA', type: 'number', min: 0, max: 1000, step: 0.1, hint: 'mg/L' },
        { name: 't0_crp', label: 'C反应蛋白', type: 'number', min: 0, max: 500, step: 0.1, hint: 'mg/L' },
        { name: 't0_nlr', label: '中性粒淋巴比', type: 'number', min: 0, max: 100, step: 0.01, hint: 'NLR' },
        { name: 't0_plr', label: '血小板淋巴比', type: 'number', min: 0, max: 1000, step: 0.01, hint: 'PLR' },
        { name: 't0_sii', label: '系统免疫炎症指数', type: 'number', min: 0, max: 10000, step: 0.01, hint: 'SII' },
        { name: 't0_pni', label: '预后营养指数', type: 'number', min: 0, max: 100, step: 0.1, hint: 'PNI' },

        // 肌肉与衰弱指标
        { name: 't0_grip_strength', label: '握力', type: 'number', min: 0, max: 100, step: 0.1, hint: 'kg' },
        { name: 't0_gait_speed_6m', label: '6米步速', type: 'number', min: 0, max: 10, step: 0.01, hint: 'm/s' },
        { name: 't0_ct_l3_smi', label: 'CT-L3骨骼肌指数', type: 'number', min: 0, max: 100, step: 0.01, hint: 'cm²/m²' },
        { name: 't0_sarcopenia_awgs', label: '肌少症诊断AWGS', type: 'select', options: ['是', '否', '可能'] },
        { name: 'charlson_cci', label: 'Charlson合并症指数', type: 'number', min: 0, max: 30, hint: 'CCI' },
        { name: 'anticholinergic_burden_acb', label: '抗胆碱能负担', type: 'number', min: 0, max: 20, hint: 'ACB' }
    ],

    // ========== POD1 术后第1天 ==========
    POD1: [
        { name: 'pod1_cam_delirium', label: 'CAM谵妄', type: 'select', options: ['阴性', '阳性'] },
        { name: 'pod1_mmse_screening', label: 'MMSE快筛', type: 'number', min: 0, max: 30, hint: '仅时地人三项' },
        { name: 'pod1_nrs_pain', label: 'NRS疼痛评分', type: 'number', min: 0, max: 10 },
        { name: 'pod1_pca_use', label: 'PCA使用', type: 'select', options: ['是', '否'] },
        { name: 'pod1_subjective_sleep_deprivation', label: '主观睡眠剥夺', type: 'select', options: ['轻度', '中度', '重度', '无'] },
        { name: 'pod1_nurse_sleep_duration', label: '护士记录睡眠时长', type: 'number', min: 0, max: 24, step: 0.5, hint: '小时' },
        { name: 'pod1_rcsq_sleep', label: 'RCSQ睡眠质量', type: 'number', min: 0, max: 100, hint: '满分100' },
        { name: 'pod1_sleep_correction_triggered', label: '触发睡眠干预', type: 'select', options: ['是', '否'] },
        { name: 'pod1_crp', label: 'C反应蛋白', type: 'number', min: 0, max: 500, step: 0.1, hint: 'mg/L' },
        { name: 'pod1_il6', label: 'IL-6', type: 'number', min: 0, max: 1000, step: 0.1, hint: 'pg/mL' },
        { name: 'pod1_nlr', label: '中性粒淋巴比', type: 'number', min: 0, max: 100, step: 0.01 }
    ],

    // ========== POD3 术后第3天 ==========
    POD3: [
        { name: 'pod3_mmse', label: 'MMSE', type: 'number', min: 0, max: 30 },
        { name: 'pod3_moca', label: 'MoCA', type: 'number', min: 0, max: 30 },
        { name: 'pod3_barthel_index', label: 'Barthel指数', type: 'number', min: 0, max: 100 },
        { name: 'pod3_nrs_pain', label: 'NRS疼痛评分', type: 'number', min: 0, max: 10 },
        { name: 'pod3_nurse_sleep_record', label: '护士睡眠记录', type: 'text', hint: '描述性记录' },
        { name: 'pod3_rcsq_sleep', label: 'RCSQ睡眠质量', type: 'number', min: 0, max: 100 },
        { name: 'pod3_sleep_correction_compliance', label: '睡眠干预依从性', type: 'select', options: ['完全依从', '部分依从', '不依从', '未触发'] },
        { name: 'pod3_crp', label: 'C反应蛋白', type: 'number', min: 0, max: 500, step: 0.1, hint: 'mg/L' },
        { name: 'pod3_il6', label: 'IL-6', type: 'number', min: 0, max: 1000, step: 0.1, hint: 'pg/mL' },
        { name: 'pod3_nlr', label: '中性粒淋巴比', type: 'number', min: 0, max: 100, step: 0.01 },
        { name: 'pod3_plr', label: '血小板淋巴比', type: 'number', min: 0, max: 1000, step: 0.01 }
    ],

    // ========== POD7 术后第7天 ==========
    POD7: [
        { name: 'pod7_mmse', label: 'MMSE', type: 'number', min: 0, max: 30 },
        { name: 'pod7_moca', label: 'MoCA', type: 'number', min: 0, max: 30 },
        { name: 'pod7_cam_delirium', label: 'CAM谵妄', type: 'select', options: ['阴性', '阳性'] },
        { name: 'pod7_pocd_diagnosis', label: 'POCD诊断', type: 'select', options: ['是', '否', '待评'] },
        { name: 'pod7_rcsq_cumulative_sleep', label: 'RCSQ累积睡眠质量', type: 'number', min: 0, max: 100 },
        { name: 'pod7_sleep_correction_cumulative', label: '睡眠干预累积效果', type: 'text', hint: '描述性评估' },
        { name: 'pod7_crp', label: 'C反应蛋白', type: 'number', min: 0, max: 500, step: 0.1, hint: 'mg/L' },
        { name: 'pod7_nlr', label: '中性粒淋巴比', type: 'number', min: 0, max: 100, step: 0.01 },
        { name: 'pod7_actual_discharge_date', label: '实际出院日期', type: 'date' },
        { name: 'pod7_discharge_destination', label: '出院去向', type: 'select', options: ['家庭', '康复机构', '转院', '其他'] }
    ],

    // ========== POD14 术后第14天 ==========
    POD14: [
        { name: 'pod14_mmse_short', label: 'MMSE简版', type: 'number', min: 0, max: 30 },
        { name: 'pod14_psqi', label: 'PSQI总分', type: 'number', min: 0, max: 21 }
    ],

    // ========== POD30 术后第30天 ==========
    POD30: [
        { name: 'pod30_mmse', label: 'MMSE', type: 'number', min: 0, max: 30 },
        { name: 'pod30_moca', label: 'MoCA', type: 'number', min: 0, max: 30 },
        { name: 'pod30_pocd_diagnosis', label: 'POCD诊断', type: 'select', options: ['是', '否'] },
        { name: 'pod30_barthel_index', label: 'Barthel指数', type: 'number', min: 0, max: 100 },
        { name: 'pod30_psqi', label: 'PSQI总分', type: 'number', min: 0, max: 21 },
        { name: 'pod30_sf12_qol', label: 'SF-12生活质量', type: 'number', min: 0, max: 100 },
        { name: 'pod30_adverse_events', label: '不良事件', type: 'text', hint: '描述任何不良事件' }
    ],

    // ========== 术中数据（回顾性填写）==========
    intraop: [
        { name: 'actual_surgery_duration', label: '实际手术时长', type: 'number', min: 0, max: 1440, hint: '分钟' },
        { name: 'total_anesthesia_time', label: '总麻醉时间', type: 'number', min: 0, max: 1440, hint: '分钟' },
        { name: 'propofol_sevoflurane_dose', label: '丙泊酚/七氟烷剂量', type: 'text', hint: '如丙泊酚2000mg' },
        { name: 'intraop_bis_mean', label: 'BIS平均值', type: 'number', min: 0, max: 100 },
        { name: 'intraop_bis_min', label: 'BIS最低值', type: 'number', min: 0, max: 100 },
        { name: 'intraop_map_min', label: 'MAP最低值', type: 'number', min: 0, max: 200, hint: 'mmHg' },
        { name: 'intraop_hypotension_duration', label: '低血压持续时间', type: 'number', min: 0, max: 1440, hint: '分钟' },
        { name: 'intraop_blood_loss', label: '术中失血量', type: 'number', min: 0, max: 10000, hint: 'mL' },
        { name: 'intraop_fluid_volume', label: '术中输液量', type: 'number', min: 0, max: 20000, hint: 'mL' }
    ]
};

// 阶段显示配置
const PHASE_CONFIG = {
    basic_info: { title: '基本信息', icon: '📋' },
    T0: { title: 'T0 术前基线', icon: '🔬' },
    POD1: { title: 'POD1 术后第1天', icon: '🏥' },
    POD3: { title: 'POD3 术后第3天', icon: '📊' },
    POD7: { title: 'POD7 术后第7天', icon: '📈' },
    POD14: { title: 'POD14 术后第14天', icon: '📞' },
    POD30: { title: 'POD30 术后第30天', icon: '✅' },
    intraop: { title: '术中数据', icon: '⚕️' }
};
