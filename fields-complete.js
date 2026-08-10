// 完整字段定义 - 严格对齐Excel V3 + 扩展基础疾病
// 包含所有量表分项、临床必需信息、文献常见危险因素

const FIELD_DEFINITIONS = {
    // ========== 患者基础信息（临床必需） ==========
    basic_info: [
        { name: 'study_id', label: '研究编号', type: 'text', required: true, hint: '如POCD2024-0001' },
        { name: 'name', label: '患者姓名', type: 'text', hint: '仅床旁核对用，提交前删除' },
        { name: 'medical_record_no', label: '病案号', type: 'text', required: true, hint: '住院号/病历号' },
        { name: 'ward', label: '病区', type: 'text', required: true, hint: '如外科11病区' },
        { name: 'bed_no', label: '床号', type: 'text', required: true, hint: '如12床' },
        { name: 'phone', label: '联系电话', type: 'text', hint: '随访用（加密存储）' },
        { name: 'enroll_date', label: '入组日期', type: 'date', required: true },
        { name: 'surgery_date', label: '手术日期', type: 'date', required: true },
        { name: 'has_l3_ct', label: '是否有标准L3层面CT', type: 'select', options: ['是', '否'], hint: '决定Paper3完整分析' },
        { name: 'sleep_intervention_triggered', label: '是否触发睡眠修正', type: 'select', options: ['是', '否'], hint: '决定Paper2分析集' },

        // 人口学信息（从T0移到basic_info）
        { name: 'age', label: '年龄', type: 'number', min: 50, max: 120, required: true, hint: '岁' },
        { name: 'gender', label: '性别', type: 'select', options: ['男', '女'], required: true },
        { name: 'education_years', label: '受教育年限', type: 'number', min: 0, max: 30, required: true, hint: '年' },
        { name: 'occupation', label: '职业', type: 'text', hint: '如退休工人、农民、教师' },
        { name: 'bmi', label: 'BMI', type: 'number', min: 15, max: 45, step: 0.1, hint: 'kg/m²' }
    ],

    // ========== T0 基线 ==========
    T0: [
        // 认知量表 - MMSE完整分项（分项在前，总分在后，自动计算）
        { name: 'mmse_time_orientation', label: 'MMSE-时间定向（满分5）', type: 'select', options: ['0', '1', '2', '3', '4', '5'], hint: '年月日星期季节各1分' },
        { name: 'mmse_place_orientation', label: 'MMSE-地点定向（满分5）', type: 'select', options: ['0', '1', '2', '3', '4', '5'], hint: '省市医院楼层病区各1分' },
        { name: 'mmse_immediate_recall', label: 'MMSE-即刻记忆（满分3）', type: 'select', options: ['0', '1', '2', '3'], hint: '3个词重复' },
        { name: 'mmse_attention', label: 'MMSE-注意计算（满分5）', type: 'select', options: ['0', '1', '2', '3', '4', '5'], hint: '100-7或倒背WORLD' },
        { name: 'mmse_delayed_recall', label: 'MMSE-延迟回忆（满分3）', type: 'select', options: ['0', '1', '2', '3'], hint: '回忆3个词' },
        { name: 'mmse_naming', label: 'MMSE-命名（满分2）', type: 'select', options: ['0', '1', '2'], hint: '手表和铅笔' },
        { name: 'mmse_repetition', label: 'MMSE-复述（满分1）', type: 'select', options: ['0', '1'], hint: '四十四只石狮子' },
        { name: 'mmse_comprehension', label: 'MMSE-阅读理解（满分3）', type: 'select', options: ['0', '1', '2', '3'], hint: '三步命令' },
        { name: 'mmse_visuospatial', label: 'MMSE-视空间（满分1）', type: 'select', options: ['0', '1'], hint: '画五边形' },
        { name: 'mmse_total', label: 'MMSE总分（满分30）', type: 'number', readonly: true, autoCalculate: true, hint: '自动计算：5+5+3+5+3+2+1+3+1' },

        // 认知量表 - MoCA完整分项（分项在前，总分在后，自动计算）
        { name: 'moca_visuospatial', label: 'MoCA-视空间执行（满分5）', type: 'select', options: ['0', '1', '2', '3', '4', '5'], hint: '连线1+立方体1+钟表3' },
        { name: 'moca_naming', label: 'MoCA-命名（满分3）', type: 'select', options: ['0', '1', '2', '3'], hint: '狮子/犀牛/骆驼' },
        { name: 'moca_attention', label: 'MoCA-注意力（满分6）', type: 'select', options: ['0', '1', '2', '3', '4', '5', '6'], hint: '顺背2+逆背1+警觉1+减7(3)' },
        { name: 'moca_language', label: 'MoCA-语言（满分3）', type: 'select', options: ['0', '1', '2', '3'], hint: '复述2+流畅1' },
        { name: 'moca_abstraction', label: 'MoCA-抽象（满分2）', type: 'select', options: ['0', '1', '2'], hint: '火车-自行车，尺子-手表' },
        { name: 'moca_delayed_recall', label: 'MoCA-延迟回忆（满分5）', type: 'select', options: ['0', '1', '2', '3', '4', '5'], hint: '5个词无提示回忆' },
        { name: 'moca_orientation', label: 'MoCA-定向（满分6）', type: 'select', options: ['0', '1', '2', '3', '4', '5', '6'], hint: '日期地点各3分' },
        { name: 'moca_total', label: 'MoCA总分（满分30）', type: 'number', readonly: true, autoCalculate: true, hint: '自动计算：5+3+6+3+2+5+6，教育≤12年+1' },

        // 基础疾病（扩展）
        { name: 'hypertension', label: '高血压', type: 'select', options: ['有', '无'], required: true },
        { name: 'diabetes', label: '糖尿病', type: 'select', options: ['有', '无'], required: true },
        { name: 'coronary_disease', label: '冠心病', type: 'select', options: ['有', '无'], required: true },
        { name: 'cerebrovascular_disease', label: '脑血管病', type: 'select', options: ['有', '无'], required: true },
        { name: 'hyperlipidemia', label: '高脂血症', type: 'select', options: ['有', '无'], hint: '独立危险因素' },
        { name: 'carotid_plaque', label: '颈动脉斑块', type: 'select', options: ['有', '无'], hint: 'B超检查结果' },
        { name: 'atrial_fibrillation', label: '心房颤动', type: 'select', options: ['有', '无'], hint: '增加卒中风险' },
        { name: 'copd', label: '慢性阻塞性肺病', type: 'select', options: ['有', '无'], hint: 'COPD' },
        { name: 'chronic_kidney_disease', label: '慢性肾病', type: 'select', options: ['有', '无'], hint: 'CKD' },
        { name: 'liver_disease', label: '慢性肝病', type: 'select', options: ['有', '无'], hint: '肝硬化/慢性肝炎' },
        { name: 'anemia', label: '贫血', type: 'select', options: ['有', '无'], hint: 'Hb<120(男)/<110(女)' },
        { name: 'depression', label: '抑郁/焦虑病史', type: 'select', options: ['有', '无'], hint: '精神科诊断' },
        { name: 'smoking', label: '吸烟史', type: 'select', options: ['从不', '已戒烟', '目前吸烟'] },
        { name: 'alcohol', label: '饮酒史', type: 'select', options: ['从不', '偶尔', '频繁'], hint: '频繁=每周≥3次' },

        { name: 'cci_score', label: 'Charlson共病指数', type: 'number', min: 0, max: 15, hint: 'CCI评分' },
        { name: 'benzodiazepine_use', label: '苯二氮䓬类用药史', type: 'select', options: ['有', '无'] },
        { name: 'acb_score', label: '抗胆碱能药物负荷', type: 'number', min: 0, max: 10, hint: 'ACB评分' },
        { name: 'statin_use', label: '他汀类用药史', type: 'select', options: ['有', '无'] },

        // PSQI睡眠质量完整分项（分项在前，总分在后，自动计算）
        { name: 'psqi_quality', label: 'PSQI-主观睡眠质量（满分3）', type: 'select', options: ['0', '1', '2', '3'], hint: '0=很好，3=很差' },
        { name: 'psqi_latency', label: 'PSQI-入睡潜伏期（满分3）', type: 'select', options: ['0', '1', '2', '3'], hint: '入睡时间+入睡困难' },
        { name: 'psqi_duration', label: 'PSQI-睡眠时间（满分3）', type: 'select', options: ['0', '1', '2', '3'], hint: '实际睡眠时长' },
        { name: 'psqi_efficiency', label: 'PSQI-睡眠效率（满分3）', type: 'select', options: ['0', '1', '2', '3'], hint: '睡眠时间/卧床时间' },
        { name: 'psqi_disturbance', label: 'PSQI-睡眠紊乱（满分3）', type: 'select', options: ['0', '1', '2', '3'], hint: '夜醒/噩梦/咳嗽等' },
        { name: 'psqi_medication', label: 'PSQI-催眠药物（满分3）', type: 'select', options: ['0', '1', '2', '3'], hint: '安眠药使用频率' },
        { name: 'psqi_dysfunction', label: 'PSQI-日间功能障碍（满分3）', type: 'select', options: ['0', '1', '2', '3'], hint: '日间困倦+难以集中' },
        { name: 'psqi_total', label: 'PSQI总分（满分21）', type: 'number', readonly: true, autoCalculate: true, hint: '自动计算：7个分项相加，>7分=睡眠质量差' },

        // 营养炎症指标
        { name: 'albumin', label: '白蛋白ALB', type: 'number', min: 10, max: 60, step: 0.1, hint: 'g/L' },
        { name: 'prealbumin', label: '前白蛋白PA', type: 'number', min: 50, max: 500, step: 0.1, hint: 'mg/L' },
        { name: 'pni', label: 'PNI预后营养指数', type: 'number', min: 0, max: 100, step: 0.1, hint: '10×ALB+5×淋巴' },
        { name: 'crp', label: 'CRP', type: 'number', min: 0, max: 300, step: 0.1, hint: 'mg/L' },
        { name: 'nlr', label: 'NLR中性淋巴比', type: 'number', min: 0, max: 50, step: 0.01, hint: '中性/淋巴' },
        { name: 'plr', label: 'PLR血小板淋巴比', type: 'number', min: 0, max: 1000, step: 0.1, hint: '血小板/淋巴' },
        { name: 'sii', label: 'SII系统免疫炎症指数', type: 'number', min: 0, max: 5000, step: 0.1, hint: '血小板×中性/淋巴' },

        // 肌少症评估
        { name: 'grip_strength', label: '握力（优势手3次均值）', type: 'number', min: 0, max: 80, step: 0.1, required: true, hint: 'kg' },
        { name: 'gait_speed', label: '6m步速', type: 'number', min: 0, max: 3, step: 0.01, required: true, hint: 'm/s' },
        { name: 'ct_smi', label: 'CT-L3骨骼肌指数SMI', type: 'number', min: 0, max: 100, step: 0.1, hint: 'cm²/m²（需CT）' },
        { name: 'sarcopenia_awgs', label: '肌少症判定AWGS2019', type: 'select', options: ['是', '否', '可能'], hint: '握力+步速+SMI综合判定' },

        // 手术信息
        { name: 'surgery_type', label: '手术类型', type: 'text', hint: '如胃癌根治术' },
        { name: 'estimated_duration', label: '预计手术时长', type: 'number', min: 0, max: 24, step: 0.5, hint: '小时' },
        { name: 'asa_grade', label: 'ASA分级', type: 'select', options: ['I', 'II', 'III', 'IV'], required: true },
        { name: 'anesthesia_plan', label: '麻醉方案', type: 'text', hint: '如全麻+硬膜外' }
    ],

    // ========== POD1 ==========
    POD1: [
        { name: 'cam', label: 'CAM谵妄筛查', type: 'select', options: ['阳性', '阴性'], required: true },
        { name: 'mmse_quick', label: 'MMSE快筛', type: 'select', options: Array.from({length: 31}, (_, i) => i.toString()), hint: '可选，快速筛查用' },

        // 睡眠评估
        { name: 'rcsq', label: 'RCSQ单晚睡眠自评', type: 'number', min: 0, max: 100, required: true, hint: '0-100mm VAS，5项均值' },
        { name: 'subjective_sleep_deprivation', label: '主观睡眠剥夺主诉', type: 'select', options: ['是', '否'], hint: '患者主诉睡不好' },
        { name: 'nurse_recorded_sleep', label: '护士记录睡眠时长', type: 'number', min: 0, max: 24, step: 0.5, required: true, hint: '小时' },
        { name: 'sleep_intervention_trigger', label: '睡眠修正是否触发', type: 'select', options: ['是', '否'], required: true, hint: 'RCSQ<50 OR 时长<4h OR 主诉' },

        // 炎症指标
        { name: 'il6', label: 'IL-6', type: 'number', min: 0, max: 500, step: 0.1, hint: 'pg/mL' },
        { name: 'crp', label: 'CRP', type: 'number', min: 0, max: 500, step: 0.1, hint: 'mg/L' },
        { name: 'nlr', label: 'NLR', type: 'number', min: 0, max: 50, step: 0.01, hint: '中性/淋巴' },

        // 疼痛管理
        { name: 'nrs_pain', label: 'NRS疼痛评分', type: 'select', options: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], required: true, hint: '0=无痛，10=最痛' },
        { name: 'pca_type', label: '镇痛泵使用', type: 'select', options: ['未使用', 'PCIA静脉', 'PCEA硬膜外', '口服药物'], hint: '镇痛方式' },

        // 术中数据
        { name: 'actual_surgery_duration', label: '实际手术时长', type: 'number', min: 0, max: 24, step: 0.1, required: true, hint: '小时' },
        { name: 'anesthesia_duration', label: '总麻醉时间', type: 'number', min: 0, max: 24, step: 0.1, hint: '小时' },
        { name: 'blood_loss', label: '术中失血量', type: 'number', min: 0, max: 5000, hint: 'mL' },
        { name: 'fluid_infusion', label: '术中输液量', type: 'number', min: 0, max: 10000, hint: 'mL' },
        { name: 'propofol_dose', label: '丙泊酚用量', type: 'number', min: 0, step: 1, hint: 'mg' },
        { name: 'sevoflurane_dose', label: '七氟烷MAC·h', type: 'number', min: 0, step: 0.1, hint: 'MAC·小时' },
        { name: 'bis_mean', label: '术中BIS均值', type: 'number', min: 0, max: 100, hint: '脑电深度监测' },
        { name: 'bis_min', label: '术中BIS最低值', type: 'number', min: 0, max: 100, hint: '最低脑电值' },
        { name: 'hypotension_duration', label: '术中低血压时长', type: 'number', min: 0, max: 500, hint: 'MAP<65mmHg的分钟数' },
        { name: 'map_min', label: '术中最低MAP', type: 'number', min: 30, max: 150, hint: 'mmHg' }
    ],

    // ========== POD3 ==========
    POD3: [
        { name: 'mmse', label: 'MMSE', type: 'select', options: Array.from({length: 31}, (_, i) => i.toString()), required: true },
        { name: 'moca', label: 'MoCA', type: 'select', options: Array.from({length: 31}, (_, i) => i.toString()), required: true },

        { name: 'il6', label: 'IL-6', type: 'number', min: 0, max: 500, step: 0.1, hint: 'pg/mL' },
        { name: 'crp', label: 'CRP', type: 'number', min: 0, max: 500, step: 0.1, hint: 'mg/L' },
        { name: 'nlr', label: 'NLR', type: 'number', min: 0, max: 50, step: 0.01 },
        { name: 'plr', label: 'PLR', type: 'number', min: 0, max: 1000, step: 0.1 },

        { name: 'rcsq', label: 'RCSQ睡眠自评', type: 'number', min: 0, max: 100, hint: '0-100mm' },
        { name: 'nurse_sleep', label: '护士睡眠记录', type: 'number', min: 0, max: 24, step: 0.5, hint: '小时' },
        { name: 'sleep_compliance_items', label: '睡眠修正依从条目数', type: 'select', options: ['0', '1', '2', '3', '4'], hint: '完成了几项干预' },

        { name: 'nrs_pain', label: 'NRS疼痛', type: 'select', options: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], hint: '0=无痛，10=最痛' },
        { name: 'barthel', label: 'Barthel日常生活能力', type: 'number', min: 0, max: 100, hint: '100=完全独立' }
    ],

    // ========== POD7 ==========
    POD7: [
        { name: 'mmse', label: 'MMSE', type: 'select', options: Array.from({length: 31}, (_, i) => i.toString()), required: true },
        { name: 'moca', label: 'MoCA', type: 'select', options: Array.from({length: 31}, (_, i) => i.toString()), required: true },
        { name: 'pocd', label: 'POCD判定', type: 'select', options: ['阳性', '阴性'], required: true, hint: 'ISPOCD Z值法' },

        { name: 'cam', label: 'CAM谵妄', type: 'select', options: ['阳性', '阴性'] },
        { name: 'rcsq', label: 'RCSQ睡眠', type: 'number', min: 0, max: 100, hint: '0-100mm' },
        { name: 'cumulative_sleep', label: '累积睡眠时长POD1-7', type: 'number', min: 0, max: 200, step: 0.5, hint: '护士记录总和（小时）' },

        { name: 'crp', label: 'CRP', type: 'number', min: 0, max: 500, step: 0.1, hint: 'mg/L' },
        { name: 'nlr', label: 'NLR', type: 'number', min: 0, max: 50, step: 0.01 },

        { name: 'sleep_compliance_cumulative', label: '睡眠修正依从累积', type: 'select', options: ['0', '1', '2', '3', '4'], hint: '0-4条，总依从情况' },

        { name: 'discharge_date', label: '实际出院日期', type: 'date' },
        { name: 'discharge_destination', label: '出院去向', type: 'select', options: ['家', '康复医院', 'ICU转入'] }
    ],

    // ========== POD14（条件性） ==========
    POD14: [
        { name: 'mmse', label: 'MMSE简版', type: 'select', options: Array.from({length: 31}, (_, i) => i.toString()), hint: '仅POD7 POCD阳性者' },
        { name: 'psqi', label: 'PSQI', type: 'select', options: Array.from({length: 22}, (_, i) => i.toString()), hint: '0-21分' }
    ],

    // ========== POD30 ==========
    POD30: [
        { name: 'mmse', label: 'MMSE', type: 'select', options: Array.from({length: 31}, (_, i) => i.toString()), required: true },
        { name: 'moca', label: 'MoCA', type: 'select', options: Array.from({length: 31}, (_, i) => i.toString()), required: true },
        { name: 'pocd', label: 'POCD判定', type: 'select', options: ['阳性', '阴性'], required: true, hint: 'ISPOCD Z值法' },

        { name: 'psqi', label: 'PSQI', type: 'select', options: Array.from({length: 22}, (_, i) => i.toString()), hint: '0-21分（回顾近1月）' },
        { name: 'sf12', label: 'SF-12生活质量', type: 'number', hint: '分数' },
        { name: 'barthel', label: 'Barthel指数', type: 'number', min: 0, max: 100, hint: '0-100' },
        { name: 'adverse_events', label: '不良事件', type: 'text', hint: '再入院/ICU/死亡/其他' }
    ]
};

// 导出供app使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FIELD_DEFINITIONS;
}
