// 完整字段定义 V6.0 - 基于Excel最终版（200个字段）
// 更新日期：2026-09-09
// 对齐：POCD研究数据统计表-最终版_20260909.xlsx
// 新增：MoCA分项、护士睡眠记录、字段依赖逻辑

const FIELD_DEFINITIONS = {
    // ========== 患者基本信息 ==========
    basic_info: [
        { name: 'patient_name', label: '患者姓名', type: 'text', required: true, hint: '床旁核对用' },
        { name: 'patient_id', label: '住院号', type: 'text', required: true },
        { name: 'gender', label: '性别', type: 'select', options: ['男', '女'], required: true },
        { name: 'ward', label: '病区', type: 'text' },
        { name: 'age', label: '年龄', type: 'number', min: 18, max: 120, required: true, hint: '岁' },
        { name: 'education', label: '文化程度', type: 'select', options: ['文盲', '小学', '初中', '高中', '大学'], required: true },
        { name: 'diagnosis', label: '诊断', type: 'text', required: true },
        { name: 'past_history', label: '既往史', type: 'textarea' },
        { name: 'medication_history', label: '用药史', type: 'textarea' },
        { name: 'surgery_history', label: '手术史', type: 'textarea' },
        { name: 'enrollment_date', label: '入组日期', type: 'date', required: true },
        { name: 'surgery_date', label: '手术日期', type: 'date', required: true },
        { name: 'sleep_correction_triggered', label: '是否触发睡眠修正', type: 'select', options: ['是', '否'] },
        { name: 'has_standard_l3_ct', label: '是否有标准L3层面CT', type: 'select', options: ['是', '否'] },
        { name: 'completed_followup_nodes', label: '完成随访节点', type: 'text', hint: 'T0/POD1/POD3/POD7' },
    ],

    // ========== T0 MoCA认知评估（新增分项） ==========
    T0_MoCA: [
        { name: 't0_moca_visuospatial', label: 'MoCA_视空间与执行功能', type: 'number', min: 0, max: 5, required: true },
        { name: 't0_moca_naming', label: 'MoCA_命名', type: 'number', min: 0, max: 3, required: true },
        { name: 't0_moca_attention', label: 'MoCA_注意力', type: 'number', min: 0, max: 6, required: true },
        { name: 't0_moca_language', label: 'MoCA_语言', type: 'number', min: 0, max: 3, required: true },
        { name: 't0_moca_abstraction', label: 'MoCA_抽象', type: 'number', min: 0, max: 2, required: true },
        { name: 't0_moca_delayed_recall', label: 'MoCA_延迟回忆', type: 'number', min: 0, max: 5, required: true },
        { name: 't0_moca_orientation', label: 'MoCA_定向', type: 'number', min: 0, max: 6, required: true },
        { name: 't0_moca_total', label: 'MoCA总分', type: 'number', min: 0, max: 30, readonly: true, computed: true, formula: 't0_moca_visuospatial + t0_moca_naming + t0_moca_attention + t0_moca_language + t0_moca_abstraction + t0_moca_delayed_recall + t0_moca_orientation' },
    ],

    // ========== T0 MoCA数字广度 ==========
    T0_MoCA_DigitSpan: [
        { name: 't0_moca_forward_span', label: 'MoCA_数字广度正背', type: 'number', min: 0, max: 12, hint: '实测位数，≥6位通过' },
        { name: 't0_moca_backward_span', label: 'MoCA_数字广度倒背', type: 'number', min: 0, max: 12, hint: '实测位数，≥4位通过' },
    ],

    // ========== T0 AVLT-H听觉词语学习测验 ==========
    T0_AVLT_H: [
        { name: 't0_avlt_n1', label: 'AVLT-H_N1学习试验', type: 'number', min: 0, max: 12, hint: '一般5-8个' },
        { name: 't0_avlt_n2', label: 'AVLT-H_N2学习试验', type: 'number', min: 0, max: 12 },
        { name: 't0_avlt_n3', label: 'AVLT-H_N3学习试验', type: 'number', min: 0, max: 12, hint: '一般8-11个' },
        { name: 't0_avlt_n4', label: 'AVLT-H_N4短延迟回忆(5min)', type: 'number', min: 0, max: 12 },
        { name: 't0_avlt_n5', label: 'AVLT-H_N5长延迟回忆(20min)', type: 'number', min: 0, max: 12 },
        { name: 't0_avlt_n7', label: 'AVLT-H_N7再认词表', type: 'number', min: 0, max: 24, hint: '再认测试' },
    ],

    // ========== T0 CMMS简易精神状态检查 ==========
    T0_CMMS: [
        { name: 't0_cmms_time_orientation', label: 'CMMS_时间定向', type: 'number', min: 0, max: 5 },
        { name: 't0_cmms_place_orientation', label: 'CMMS_地点定向', type: 'number', min: 0, max: 5 },
        { name: 't0_cmms_immediate_memory', label: 'CMMS_即刻记忆', type: 'number', min: 0, max: 3 },
        { name: 't0_cmms_attention_calculation', label: 'CMMS_注意与计算', type: 'number', min: 0, max: 5 },
        { name: 't0_cmms_delayed_recall', label: 'CMMS_延迟回忆', type: 'number', min: 0, max: 3 },
        { name: 't0_cmms_naming', label: 'CMMS_命名', type: 'number', min: 0, max: 2 },
        { name: 't0_cmms_repetition', label: 'CMMS_复述', type: 'number', min: 0, max: 1 },
        { name: 't0_cmms_three_step', label: 'CMMS_三步指令', type: 'number', min: 0, max: 3 },
        { name: 't0_cmms_reading', label: 'CMMS_阅读', type: 'number', min: 0, max: 1 },
        { name: 't0_cmms_writing', label: 'CMMS_书写', type: 'number', min: 0, max: 1 },
        { name: 't0_cmms_structure', label: 'CMMS_结构', type: 'number', min: 0, max: 1 },
        { name: 't0_cmms_total', label: 'CMMS总分', type: 'number', min: 0, max: 30, readonly: true, computed: true, formula: 't0_cmms_time_orientation + t0_cmms_place_orientation + t0_cmms_immediate_memory + t0_cmms_attention_calculation + t0_cmms_delayed_recall + t0_cmms_naming + t0_cmms_repetition + t0_cmms_three_step + t0_cmms_reading + t0_cmms_writing + t0_cmms_structure' },
        { name: 't0_cmms_cutoff', label: 'CMMS分界值', type: 'text', readonly: true, hint: '文盲≤17/小学≤20/中学及以上≤24' },
    ],

    // ========== T0 画钟测验 ==========
    T0_ClockTest: [
        { name: 't0_clock_circle', label: '画钟_完整封闭圆形', type: 'number', min: 0, max: 1 },
        { name: 't0_clock_numbers_position', label: '画钟_12数字位置合理', type: 'number', min: 0, max: 1 },
        { name: 't0_clock_numbers_complete', label: '画钟_12数字无遗漏重复', type: 'number', min: 0, max: 1 },
        { name: 't0_clock_hands', label: '画钟_时针分针位置准确', type: 'number', min: 0, max: 1 },
        { name: 't0_clock_total', label: '画钟总分', type: 'number', min: 0, max: 4, readonly: true, computed: true, formula: 't0_clock_circle + t0_clock_numbers_position + t0_clock_numbers_complete + t0_clock_hands' },
    ],

    // ========== T0 肌少症评估 ==========
    T0_Sarcopenia: [
        { name: 't0_grip_strength', label: '握力', type: 'number', min: 0, max: 100, step: 0.1, hint: 'Kg' },
        { name: 't0_gait_speed_6m', label: '6米步速(<1.0m/s)', type: 'select', options: ['是', '否'] },
        { name: 't0_sit_to_stand_5', label: '5次起坐(≥12秒)', type: 'select', options: ['是', '否'] },
    ],

    // ========== T0 TMT-A连线测试 ==========
    T0_TMT_A: [
        { name: 't0_tmt_a_time', label: 'TMT-A_完成时间', type: 'number', min: 0, max: 600, hint: '秒' },
        { name: 't0_tmt_a_errors', label: 'TMT-A_错误次数', type: 'number', min: 0, max: 50 },
        { name: 't0_tmt_a_correct_lines', label: 'TMT-A_正确线条数', type: 'number', min: 0, max: 25 },
    ],

    // ========== T0 疼痛 ==========
    T0_Pain: [
        { name: 't0_chronic_pain_site', label: '慢性疼痛部位', type: 'text' },
        { name: 't0_pain_nrs', label: 'NRS疼痛评分', type: 'number', min: 0, max: 10 },
        { name: 't0_oral_analgesics', label: '口服药物', type: 'text' },
    ],

    // ========== T0 PSQI睡眠质量指数 ==========
    T0_PSQI: [
        { name: 't0_psqi_c1_quality', label: 'PSQI_C1主观质量', type: 'number', min: 0, max: 3 },
        { name: 't0_psqi_c2_latency', label: 'PSQI_C2入睡潜伏期', type: 'number', min: 0, max: 3 },
        { name: 't0_psqi_c3_duration', label: 'PSQI_C3睡眠时间', type: 'number', min: 0, max: 3 },
        { name: 't0_psqi_c4_efficiency', label: 'PSQI_C4睡眠效率', type: 'number', min: 0, max: 3 },
        { name: 't0_psqi_c5_disturbance', label: 'PSQI_C5睡眠障碍', type: 'number', min: 0, max: 3 },
        { name: 't0_psqi_c6_medication', label: 'PSQI_C6催眠药物', type: 'number', min: 0, max: 3 },
        { name: 't0_psqi_c7_dysfunction', label: 'PSQI_C7日间功能', type: 'number', min: 0, max: 3 },
        { name: 't0_psqi_total', label: 'PSQI总分', type: 'number', min: 0, max: 21, readonly: true, computed: true, formula: 't0_psqi_c1_quality + t0_psqi_c2_latency + t0_psqi_c3_duration + t0_psqi_c4_efficiency + t0_psqi_c5_disturbance + t0_psqi_c6_medication + t0_psqi_c7_dysfunction', hint: '>5分=睡眠差' },
    ],

    // ========== T0 Barthel指数ADL ==========
    T0_Barthel: [
        { name: 't0_barthel_bowel', label: 'Barthel_大便', type: 'select', options: ['0', '5', '10'] },
        { name: 't0_barthel_bladder', label: 'Barthel_小便', type: 'select', options: ['0', '5', '10'] },
        { name: 't0_barthel_grooming', label: 'Barthel_修饰', type: 'select', options: ['0', '5'] },
        { name: 't0_barthel_toilet', label: 'Barthel_用厕', type: 'select', options: ['0', '5', '10'] },
        { name: 't0_barthel_feeding', label: 'Barthel_吃饭', type: 'select', options: ['0', '5', '10'] },
        { name: 't0_barthel_transfer', label: 'Barthel_转移床椅', type: 'select', options: ['0', '5', '10', '15'] },
        { name: 't0_barthel_mobility', label: 'Barthel_活动步行', type: 'select', options: ['0', '5', '10', '15'] },
        { name: 't0_barthel_dressing', label: 'Barthel_穿衣', type: 'select', options: ['0', '5', '10'] },
        { name: 't0_barthel_stairs', label: 'Barthel_上下楼梯', type: 'select', options: ['0', '5', '10'] },
        { name: 't0_barthel_bathing', label: 'Barthel_洗澡', type: 'select', options: ['0', '5'] },
        { name: 't0_barthel_total', label: 'Barthel总分', type: 'number', min: 0, max: 100, readonly: true, computed: true, formula: 't0_barthel_bowel + t0_barthel_bladder + t0_barthel_grooming + t0_barthel_toilet + t0_barthel_feeding + t0_barthel_transfer + t0_barthel_mobility + t0_barthel_dressing + t0_barthel_stairs + t0_barthel_bathing' },
    ],

    // ========== POD1 CAM意识模糊评估 ==========
    POD1_CAM: [
        { name: 'pod1_cam_acute_onset', label: 'CAM①急性起病且波动', type: 'select', options: ['是', '否'] },
        { name: 'pod1_cam_inattention', label: 'CAM②注意力障碍', type: 'select', options: ['是', '否'] },
        { name: 'pod1_cam_disorganized_thinking', label: 'CAM③思维混乱', type: 'select', options: ['是', '否'] },
        { name: 'pod1_cam_altered_consciousness', label: 'CAM④意识水平改变', type: 'select', options: ['是', '否'] },
        { name: 'pod1_cam_delirium', label: 'CAM谵妄判定', type: 'select', options: ['有', '无'], hint: '①+②+③或④=谵妄' },
    ],

    // ========== POD1 术后与镇痛 ==========
    POD1_Postop: [
        { name: 'pod1_pca', label: '是否有镇痛泵', type: 'select', options: ['是', '否'] },
        { name: 'pod1_gastric_tube', label: '胃管', type: 'select', options: ['是', '否'] },
        { name: 'pod1_nrs_rest', label: 'NRS静息痛', type: 'number', min: 0, max: 10 },
        { name: 'pod1_nrs_movement', label: 'NRS活动痛', type: 'number', min: 0, max: 10 },
        { name: 'pod1_extra_analgesics', label: '额外止痛药', type: 'select', options: ['是', '否'] },
        { name: 'pod1_analgesic_name', label: '止痛药名', type: 'text', dependsOn: 'pod1_extra_analgesics', showWhen: '是' },
        { name: 'pod1_first_ambulation', label: '第一天下床', type: 'select', options: ['是', '否'] },
        { name: 'pod1_ambulation_times', label: '下床次数', type: 'number', min: 0, max: 20, dependsOn: 'pod1_first_ambulation', showWhen: '是' },
    ],

    // ========== POD1 RCSQ睡眠自评 ==========
    POD1_RCSQ: [
        { name: 'pod1_rcsq_i1_depth', label: 'RCSQ_I1睡眠深度', type: 'number', min: 0, max: 100, hint: '0-100mm VAS' },
        { name: 'pod1_rcsq_i2_latency', label: 'RCSQ_I2入睡快慢', type: 'number', min: 0, max: 100, hint: '0-100mm VAS' },
        { name: 'pod1_rcsq_i3_awakenings', label: 'RCSQ_I3觉醒次数', type: 'number', min: 0, max: 100, hint: '0-100mm VAS' },
        { name: 'pod1_rcsq_i4_return_sleep', label: 'RCSQ_I4再入睡', type: 'number', min: 0, max: 100, hint: '0-100mm VAS' },
        { name: 'pod1_rcsq_i5_overall', label: 'RCSQ_I5总体质量', type: 'number', min: 0, max: 100, hint: '0-100mm VAS' },
        { name: 'pod1_rcsq_total', label: 'RCSQ总分', type: 'number', min: 0, max: 100, readonly: true, computed: true, formula: '(pod1_rcsq_i1_depth + pod1_rcsq_i2_latency + pod1_rcsq_i3_awakenings + pod1_rcsq_i4_return_sleep + pod1_rcsq_i5_overall) / 5', hint: '(I1+...+I5)÷5' },
        { name: 'pod1_rcsq_i6_noise', label: 'RCSQ_第6题夜间噪音', type: 'number', min: 0, max: 100, hint: '不计入总分' },
        { name: 'pod1_sleep_medication', label: '安眠药使用', type: 'select', options: ['是', '否'] },
        { name: 'pod1_sleep_medication_name', label: '安眠药名', type: 'text', dependsOn: 'pod1_sleep_medication', showWhen: '是' },
    ],

    // ========== POD1 睡眠修正触发 ==========
    POD1_SleepCorrection: [
        { name: 'pod1_sleep_correction_triggered', label: '睡眠修正是否触发', type: 'select', options: ['是', '否'], hint: '睡眠≤5h或质量差或主诉' },
        { name: 'pod1_sc_s1_environment', label: 'S1环境优化', type: 'select', options: ['执行', '未执行'], dependsOn: 'pod1_sleep_correction_triggered', showWhen: '是' },
        { name: 'pod1_sc_s2_noise', label: 'S2噪音管控', type: 'select', options: ['执行', '未执行'], dependsOn: 'pod1_sleep_correction_triggered', showWhen: '是' },
        { name: 'pod1_sc_s3_activity', label: 'S3白天活动', type: 'select', options: ['执行', '未执行'], dependsOn: 'pod1_sleep_correction_triggered', showWhen: '是' },
        { name: 'pod1_sc_s4_pain', label: 'S4疼痛优化', type: 'select', options: ['执行', '未执行'], dependsOn: 'pod1_sleep_correction_triggered', showWhen: '是' },
    ],

    // ========== POD3 3D-CAM评估 ==========
    POD3_3DCAM: [
        { name: 'pod3_3dcam_acute_onset', label: '3D-CAM①急性起病且波动', type: 'select', options: ['是', '否'] },
        { name: 'pod3_3dcam_inattention', label: '3D-CAM②注意力障碍', type: 'select', options: ['是', '否'] },
        { name: 'pod3_3dcam_disorganized_thinking', label: '3D-CAM③思维混乱', type: 'select', options: ['是', '否'] },
        { name: 'pod3_3dcam_altered_consciousness', label: '3D-CAM④意识水平改变', type: 'select', options: ['是', '否'] },
        { name: 'pod3_3dcam_delirium', label: '3D-CAM谵妄判定', type: 'select', options: ['有', '无'], hint: '①+②+③或④=谵妄' },
    ],

    // ========== POD3 疼痛评分 ==========
    POD3_Pain: [
        { name: 'pod3_nrs_rest', label: 'NRS静息痛', type: 'number', min: 0, max: 10 },
        { name: 'pod3_nrs_movement', label: 'NRS活动痛', type: 'number', min: 0, max: 10 },
        { name: 'pod3_extra_analgesics', label: '额外止痛药', type: 'select', options: ['是', '否'] },
        { name: 'pod3_analgesic_name', label: '止痛药名', type: 'text', dependsOn: 'pod3_extra_analgesics', showWhen: '是' },
        { name: 'pod3_gastric_tube', label: '胃管', type: 'select', options: ['是', '否'] },
    ],

    // ========== POD3 术后并发症 ==========
    POD3_Complications: [
        { name: 'pod3_complication_grade', label: '术后并发症Clavien-Dindo分级', type: 'select', options: ['无', 'Ⅰ级', 'Ⅱ级', 'Ⅲ级', 'Ⅳ级', 'Ⅴ级'] },
    ],

    // ========== POD3 RCSQ睡眠自评 ==========
    POD3_RCSQ: [
        { name: 'pod3_rcsq_i1_depth', label: 'RCSQ_I1睡眠深度', type: 'number', min: 0, max: 100, hint: '0-100mm VAS' },
        { name: 'pod3_rcsq_i2_latency', label: 'RCSQ_I2入睡快慢', type: 'number', min: 0, max: 100, hint: '0-100mm VAS' },
        { name: 'pod3_rcsq_i3_awakenings', label: 'RCSQ_I3觉醒次数', type: 'number', min: 0, max: 100, hint: '0-100mm VAS' },
        { name: 'pod3_rcsq_i4_return_sleep', label: 'RCSQ_I4再入睡', type: 'number', min: 0, max: 100, hint: '0-100mm VAS' },
        { name: 'pod3_rcsq_i5_overall', label: 'RCSQ_I5总体质量', type: 'number', min: 0, max: 100, hint: '0-100mm VAS' },
        { name: 'pod3_rcsq_total', label: 'RCSQ总分', type: 'number', min: 0, max: 100, readonly: true, computed: true, formula: '(pod3_rcsq_i1_depth + pod3_rcsq_i2_latency + pod3_rcsq_i3_awakenings + pod3_rcsq_i4_return_sleep + pod3_rcsq_i5_overall) / 5' },
        { name: 'pod3_rcsq_i6_noise', label: 'RCSQ_第6题夜间噪音', type: 'number', min: 0, max: 100, hint: '不计入总分' },
        { name: 'pod3_sleep_medication', label: '安眠药使用', type: 'select', options: ['是', '否'] },
        { name: 'pod3_sleep_medication_name', label: '安眠药名', type: 'text', dependsOn: 'pod3_sleep_medication', showWhen: '是' },
    ],

    // ========== POD3 睡眠修正依从性 ==========
    POD3_SleepCompliance: [
        { name: 'pod3_sleep_correction_triggered', label: 'D1是否触发', type: 'select', options: ['是', '否'] },
        { name: 'pod3_sleep_medication_d2_d3', label: '第2-3天安眠药', type: 'select', options: ['是', '否'] },
        { name: 'pod3_sleep_medication_name_d2_d3', label: '安眠药名', type: 'text', dependsOn: 'pod3_sleep_medication_d2_d3', showWhen: '是' },
        { name: 'pod3_sc_environment', label: 'D3环境优化', type: 'select', options: ['接受', '拒绝'] },
        { name: 'pod3_sc_noise', label: 'D3噪音管控', type: 'select', options: ['接受', '拒绝'] },
        { name: 'pod3_sc_activity', label: 'D3白天活动', type: 'select', options: ['接受', '拒绝'] },
        { name: 'pod3_sc_pain', label: 'D3疼痛优化', type: 'select', options: ['接受', '拒绝'] },
        { name: 'pod3_sc_compliance', label: 'POD3依从度汇总', type: 'text', readonly: true },
    ],

    // ========== POD1-POD3逐夜睡眠记录（护士观察）【新增】 ==========
    NightlySleepRecords: [
        { name: 'pod1_night_sleep_duration', label: 'POD1夜睡眠时长', type: 'number', min: 0, max: 12, step: 0.5, hint: '小时' },
        { name: 'pod1_night_nursing_times', label: 'POD1夜间护理次数', type: 'number', min: 0, max: 20 },
        { name: 'pod1_night_earplug_eyemask', label: 'POD1夜耳塞眼罩', type: 'select', options: ['是', '否'] },
        { name: 'pod1_night_ambulation_times', label: 'POD1夜下床活动次数', type: 'number', min: 0, max: 20 },

        { name: 'pod2_night_sleep_duration', label: 'POD2夜睡眠时长', type: 'number', min: 0, max: 12, step: 0.5, hint: '小时' },
        { name: 'pod2_night_nursing_times', label: 'POD2夜间护理次数', type: 'number', min: 0, max: 20 },
        { name: 'pod2_night_earplug_eyemask', label: 'POD2夜耳塞眼罩', type: 'select', options: ['是', '否'] },
        { name: 'pod2_night_ambulation_times', label: 'POD2夜下床活动次数', type: 'number', min: 0, max: 20 },

        { name: 'pod3_night_sleep_duration', label: 'POD3夜睡眠时长', type: 'number', min: 0, max: 12, step: 0.5, hint: '小时' },
        { name: 'pod3_night_nursing_times', label: 'POD3夜间护理次数', type: 'number', min: 0, max: 20 },
        { name: 'pod3_night_earplug_eyemask', label: 'POD3夜耳塞眼罩', type: 'select', options: ['是', '否'] },
        { name: 'pod3_night_ambulation_times', label: 'POD3夜下床活动次数', type: 'number', min: 0, max: 20 },
    ],

    // ========== POD7 CAM意识模糊评估 ==========
    POD7_CAM: [
        { name: 'pod7_cam_acute_onset', label: 'CAM①急性起病且波动', type: 'select', options: ['是', '否'] },
        { name: 'pod7_cam_inattention', label: 'CAM②注意力障碍', type: 'select', options: ['是', '否'] },
        { name: 'pod7_cam_disorganized_thinking', label: 'CAM③思维混乱', type: 'select', options: ['是', '否'] },
        { name: 'pod7_cam_altered_consciousness', label: 'CAM④意识水平改变', type: 'select', options: ['是', '否'] },
        { name: 'pod7_cam_delirium', label: 'CAM谵妄判定', type: 'select', options: ['有', '无'], hint: '①+②+③或④=谵妄' },
        { name: 'pod7_delirium_resolved', label: '谵妄是否消退', type: 'select', options: ['是', '否', '未发生谵妄'] },
    ],

    // ========== POD7 MoCA认知评估【新增分项】 ==========
    POD7_MoCA: [
        { name: 'pod7_moca_visuospatial', label: 'MoCA_视空间与执行功能', type: 'number', min: 0, max: 5 },
        { name: 'pod7_moca_naming', label: 'MoCA_命名', type: 'number', min: 0, max: 3 },
        { name: 'pod7_moca_attention', label: 'MoCA_注意力', type: 'number', min: 0, max: 6 },
        { name: 'pod7_moca_language', label: 'MoCA_语言', type: 'number', min: 0, max: 3 },
        { name: 'pod7_moca_abstraction', label: 'MoCA_抽象', type: 'number', min: 0, max: 2 },
        { name: 'pod7_moca_delayed_recall', label: 'MoCA_延迟回忆', type: 'number', min: 0, max: 5 },
        { name: 'pod7_moca_orientation', label: 'MoCA_定向', type: 'number', min: 0, max: 6 },
        { name: 'pod7_moca_total', label: 'MoCA总分', type: 'number', min: 0, max: 30, readonly: true, computed: true, formula: 'pod7_moca_visuospatial + pod7_moca_naming + pod7_moca_attention + pod7_moca_language + pod7_moca_abstraction + pod7_moca_delayed_recall + pod7_moca_orientation' },
    ],

    // ========== POD7 MoCA数字广度 ==========
    POD7_MoCA_DigitSpan: [
        { name: 'pod7_moca_forward_span', label: 'MoCA_数字广度正背', type: 'number', min: 0, max: 12, hint: '实测位数，≥6位通过' },
        { name: 'pod7_moca_backward_span', label: 'MoCA_数字广度倒背', type: 'number', min: 0, max: 12, hint: '实测位数，≥4位通过' },
    ],

    // ========== POD7 AVLT-H听觉词语学习 ==========
    POD7_AVLT_H: [
        { name: 'pod7_avlt_n1', label: 'AVLT-H_N1学习试验', type: 'number', min: 0, max: 12 },
        { name: 'pod7_avlt_n2', label: 'AVLT-H_N2学习试验', type: 'number', min: 0, max: 12 },
        { name: 'pod7_avlt_n3', label: 'AVLT-H_N3学习试验', type: 'number', min: 0, max: 12 },
        { name: 'pod7_avlt_n4', label: 'AVLT-H_N4短延迟回忆(5min)', type: 'number', min: 0, max: 12 },
        { name: 'pod7_avlt_n5', label: 'AVLT-H_N5长延迟回忆(20min)', type: 'number', min: 0, max: 12 },
        { name: 'pod7_avlt_n7', label: 'AVLT-H_N7再认词表', type: 'number', min: 0, max: 24 },
    ],

    // ========== POD7 CMMS简易精神状态 ==========
    POD7_CMMS: [
        { name: 'pod7_cmms_time_orientation', label: 'CMMS_时间定向', type: 'number', min: 0, max: 5 },
        { name: 'pod7_cmms_place_orientation', label: 'CMMS_地点定向', type: 'number', min: 0, max: 5 },
        { name: 'pod7_cmms_immediate_memory', label: 'CMMS_即刻记忆', type: 'number', min: 0, max: 3 },
        { name: 'pod7_cmms_attention_calculation', label: 'CMMS_注意与计算', type: 'number', min: 0, max: 5 },
        { name: 'pod7_cmms_delayed_recall', label: 'CMMS_延迟回忆', type: 'number', min: 0, max: 3 },
        { name: 'pod7_cmms_naming', label: 'CMMS_命名', type: 'number', min: 0, max: 2 },
        { name: 'pod7_cmms_repetition', label: 'CMMS_复述', type: 'number', min: 0, max: 1 },
        { name: 'pod7_cmms_three_step', label: 'CMMS_三步指令', type: 'number', min: 0, max: 3 },
        { name: 'pod7_cmms_reading', label: 'CMMS_阅读', type: 'number', min: 0, max: 1 },
        { name: 'pod7_cmms_writing', label: 'CMMS_书写', type: 'number', min: 0, max: 1 },
        { name: 'pod7_cmms_structure', label: 'CMMS_结构', type: 'number', min: 0, max: 1 },
        { name: 'pod7_cmms_total', label: 'CMMS总分', type: 'number', min: 0, max: 30, readonly: true, computed: true, formula: 'pod7_cmms_time_orientation + pod7_cmms_place_orientation + pod7_cmms_immediate_memory + pod7_cmms_attention_calculation + pod7_cmms_delayed_recall + pod7_cmms_naming + pod7_cmms_repetition + pod7_cmms_three_step + pod7_cmms_reading + pod7_cmms_writing + pod7_cmms_structure' },
    ],

    // ========== POD7 疼痛 ==========
    POD7_Pain: [
        { name: 'pod7_nrs_rest', label: 'NRS静息痛', type: 'number', min: 0, max: 10 },
        { name: 'pod7_nrs_movement', label: 'NRS活动痛', type: 'number', min: 0, max: 10 },
        { name: 'pod7_extra_analgesics', label: '额外止痛药', type: 'select', options: ['是', '否'] },
        { name: 'pod7_analgesic_name', label: '止痛药名', type: 'text', dependsOn: 'pod7_extra_analgesics', showWhen: '是' },
    ],

    // ========== POD7 画钟测验 ==========
    POD7_ClockTest: [
        { name: 'pod7_clock_circle', label: '画钟_完整封闭圆形', type: 'number', min: 0, max: 1 },
        { name: 'pod7_clock_numbers_position', label: '画钟_12数字位置合理', type: 'number', min: 0, max: 1 },
        { name: 'pod7_clock_numbers_complete', label: '画钟_12数字无遗漏重复', type: 'number', min: 0, max: 1 },
        { name: 'pod7_clock_hands', label: '画钟_时针分针位置准确', type: 'number', min: 0, max: 1 },
        { name: 'pod7_clock_total', label: '画钟总分', type: 'number', min: 0, max: 4, readonly: true, computed: true, formula: 'pod7_clock_circle + pod7_clock_numbers_position + pod7_clock_numbers_complete + pod7_clock_hands' },
    ],

    // ========== POD7 TMT-A连线测试 ==========
    POD7_TMT_A: [
        { name: 'pod7_tmt_a_time', label: 'TMT-A_完成时间', type: 'number', min: 0, max: 600, hint: '秒' },
        { name: 'pod7_tmt_a_errors', label: 'TMT-A_错误次数', type: 'number', min: 0, max: 50 },
        { name: 'pod7_tmt_a_correct_lines', label: 'TMT-A_正确线条数', type: 'number', min: 0, max: 25 },
    ],

    // ========== POD7 RCSQ睡眠自评 ==========
    POD7_RCSQ: [
        { name: 'pod7_rcsq_i1_depth', label: 'RCSQ_I1睡眠深度', type: 'number', min: 0, max: 100, hint: '0-100mm VAS' },
        { name: 'pod7_rcsq_i2_latency', label: 'RCSQ_I2入睡快慢', type: 'number', min: 0, max: 100, hint: '0-100mm VAS' },
        { name: 'pod7_rcsq_i3_awakenings', label: 'RCSQ_I3觉醒次数', type: 'number', min: 0, max: 100, hint: '0-100mm VAS' },
        { name: 'pod7_rcsq_i4_return_sleep', label: 'RCSQ_I4再入睡', type: 'number', min: 0, max: 100, hint: '0-100mm VAS' },
        { name: 'pod7_rcsq_i5_overall', label: 'RCSQ_I5总体质量', type: 'number', min: 0, max: 100, hint: '0-100mm VAS' },
        { name: 'pod7_rcsq_total', label: 'RCSQ总分', type: 'number', min: 0, max: 100, readonly: true, computed: true, formula: '(pod7_rcsq_i1_depth + pod7_rcsq_i2_latency + pod7_rcsq_i3_awakenings + pod7_rcsq_i4_return_sleep + pod7_rcsq_i5_overall) / 5' },
        { name: 'pod7_rcsq_i6_noise', label: 'RCSQ_第6题夜间噪音', type: 'number', min: 0, max: 100, hint: '不计入总分' },
        { name: 'pod7_sleep_medication', label: '安眠药使用', type: 'select', options: ['是', '否'] },
        { name: 'pod7_sleep_medication_name', label: '安眠药名', type: 'text', dependsOn: 'pod7_sleep_medication', showWhen: '是' },
    ],

    // ========== POD7 术后并发症 ==========
    POD7_Complications: [
        { name: 'pod7_complication_grade', label: '术后并发症Clavien-Dindo分级', type: 'select', options: ['无', 'Ⅰ级', 'Ⅱ级', 'Ⅲ级', 'Ⅳ级', 'Ⅴ级'] },
    ],
};

// 字段分页配置（用于进度指示器）
const FIELD_PAGES = {
    T0: [
        { title: '基本信息', groups: ['basic_info'] },
        { title: 'MoCA认知评估', groups: ['T0_MoCA', 'T0_MoCA_DigitSpan'] },
        { title: 'AVLT-H与CMMS', groups: ['T0_AVLT_H', 'T0_CMMS'] },
        { title: '画钟与其他测验', groups: ['T0_ClockTest', 'T0_TMT_A', 'T0_Sarcopenia', 'T0_Pain'] },
        { title: 'PSQI与Barthel', groups: ['T0_PSQI', 'T0_Barthel'] },
    ],
    POD1: [
        { title: 'CAM与术后指标', groups: ['POD1_CAM', 'POD1_Postop'] },
        { title: 'RCSQ睡眠自评', groups: ['POD1_RCSQ'] },
        { title: '睡眠修正', groups: ['POD1_SleepCorrection'] },
    ],
    POD3: [
        { title: '3D-CAM与疼痛', groups: ['POD3_3DCAM', 'POD3_Pain'] },
        { title: '并发症', groups: ['POD3_Complications'] },
        { title: 'RCSQ睡眠', groups: ['POD3_RCSQ'] },
        { title: '睡眠修正与护士记录', groups: ['POD3_SleepCompliance', 'NightlySleepRecords'] },
    ],
    POD7: [
        { title: 'CAM与MoCA', groups: ['POD7_CAM', 'POD7_MoCA', 'POD7_MoCA_DigitSpan'] },
        { title: 'AVLT-H与CMMS', groups: ['POD7_AVLT_H', 'POD7_CMMS'] },
        { title: '画钟与TMT', groups: ['POD7_ClockTest', 'POD7_TMT_A'] },
        { title: '疼痛与RCSQ', groups: ['POD7_Pain', 'POD7_RCSQ'] },
        { title: '并发症', groups: ['POD7_Complications'] },
    ],
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FIELD_DEFINITIONS, FIELD_PAGES };
}
