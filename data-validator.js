// 数据验证和一致性检查模块

class DataValidator {
    constructor() {
        this.validationRules = this.initValidationRules();
    }

    // 初始化验证规则
    initValidationRules() {
        return {
            // 日期逻辑验证
            dateLogic: {
                name: '日期逻辑',
                validate: (data) => {
                    const errors = [];

                    if (data.enrollment_date && data.surgery_date) {
                        const enrollDate = new Date(data.enrollment_date);
                        const surgeryDate = new Date(data.surgery_date);

                        if (surgeryDate < enrollDate) {
                            errors.push({
                                field: 'surgery_date',
                                message: '手术日期不能早于入组日期',
                                severity: 'error'
                            });
                        }
                    }

                    return errors;
                }
            },

            // MoCA总分验证
            mocaTotal: {
                name: 'MoCA总分',
                validate: (data) => {
                    const errors = [];

                    // T0 MoCA
                    const t0Sum = (data.t0_moca_visuospatial || 0) +
                                  (data.t0_moca_naming || 0) +
                                  (data.t0_moca_attention || 0) +
                                  (data.t0_moca_language || 0) +
                                  (data.t0_moca_abstraction || 0) +
                                  (data.t0_moca_delayed_recall || 0) +
                                  (data.t0_moca_orientation || 0);

                    if (data.t0_moca_total && Math.abs(data.t0_moca_total - t0Sum) > 0.01) {
                        errors.push({
                            field: 't0_moca_total',
                            message: `T0 MoCA总分不匹配：应为${t0Sum}，实际为${data.t0_moca_total}`,
                            severity: 'error',
                            expected: t0Sum,
                            actual: data.t0_moca_total
                        });
                    }

                    // POD7 MoCA
                    const pod7Sum = (data.pod7_moca_visuospatial || 0) +
                                    (data.pod7_moca_naming || 0) +
                                    (data.pod7_moca_attention || 0) +
                                    (data.pod7_moca_language || 0) +
                                    (data.pod7_moca_abstraction || 0) +
                                    (data.pod7_moca_delayed_recall || 0) +
                                    (data.pod7_moca_orientation || 0);

                    if (data.pod7_moca_total && Math.abs(data.pod7_moca_total - pod7Sum) > 0.01) {
                        errors.push({
                            field: 'pod7_moca_total',
                            message: `POD7 MoCA总分不匹配：应为${pod7Sum}，实际为${data.pod7_moca_total}`,
                            severity: 'error',
                            expected: pod7Sum,
                            actual: data.pod7_moca_total
                        });
                    }

                    return errors;
                }
            },

            // CMMS总分验证
            cmmsTotal: {
                name: 'CMMS总分',
                validate: (data) => {
                    const errors = [];

                    // T0 CMMS
                    const t0Sum = (data.t0_cmms_time_orientation || 0) +
                                  (data.t0_cmms_place_orientation || 0) +
                                  (data.t0_cmms_immediate_memory || 0) +
                                  (data.t0_cmms_attention_calculation || 0) +
                                  (data.t0_cmms_delayed_recall || 0) +
                                  (data.t0_cmms_naming || 0) +
                                  (data.t0_cmms_repetition || 0) +
                                  (data.t0_cmms_three_step || 0) +
                                  (data.t0_cmms_reading || 0) +
                                  (data.t0_cmms_writing || 0) +
                                  (data.t0_cmms_structure || 0);

                    if (data.t0_cmms_total && Math.abs(data.t0_cmms_total - t0Sum) > 0.01) {
                        errors.push({
                            field: 't0_cmms_total',
                            message: `T0 CMMS总分不匹配：应为${t0Sum}，实际为${data.t0_cmms_total}`,
                            severity: 'error',
                            expected: t0Sum,
                            actual: data.t0_cmms_total
                        });
                    }

                    // POD7 CMMS
                    const pod7Sum = (data.pod7_cmms_time_orientation || 0) +
                                    (data.pod7_cmms_place_orientation || 0) +
                                    (data.pod7_cmms_immediate_memory || 0) +
                                    (data.pod7_cmms_attention_calculation || 0) +
                                    (data.pod7_cmms_delayed_recall || 0) +
                                    (data.pod7_cmms_naming || 0) +
                                    (data.pod7_cmms_repetition || 0) +
                                    (data.pod7_cmms_three_step || 0) +
                                    (data.pod7_cmms_reading || 0) +
                                    (data.pod7_cmms_writing || 0) +
                                    (data.pod7_cmms_structure || 0);

                    if (data.pod7_cmms_total && Math.abs(data.pod7_cmms_total - pod7Sum) > 0.01) {
                        errors.push({
                            field: 'pod7_cmms_total',
                            message: `POD7 CMMS总分不匹配：应为${pod7Sum}，实际为${data.pod7_cmms_total}`,
                            severity: 'error',
                            expected: pod7Sum,
                            actual: data.pod7_cmms_total
                        });
                    }

                    return errors;
                }
            },

            // PSQI总分验证
            psqiTotal: {
                name: 'PSQI总分',
                validate: (data) => {
                    const errors = [];

                    const sum = (data.t0_psqi_c1_quality || 0) +
                                (data.t0_psqi_c2_latency || 0) +
                                (data.t0_psqi_c3_duration || 0) +
                                (data.t0_psqi_c4_efficiency || 0) +
                                (data.t0_psqi_c5_disturbance || 0) +
                                (data.t0_psqi_c6_medication || 0) +
                                (data.t0_psqi_c7_dysfunction || 0);

                    if (data.t0_psqi_total && Math.abs(data.t0_psqi_total - sum) > 0.01) {
                        errors.push({
                            field: 't0_psqi_total',
                            message: `PSQI总分不匹配：应为${sum}，实际为${data.t0_psqi_total}`,
                            severity: 'error',
                            expected: sum,
                            actual: data.t0_psqi_total
                        });
                    }

                    return errors;
                }
            },

            // Barthel总分验证
            barthelTotal: {
                name: 'Barthel总分',
                validate: (data) => {
                    const errors = [];

                    const sum = parseInt(data.t0_barthel_bowel || 0) +
                                parseInt(data.t0_barthel_bladder || 0) +
                                parseInt(data.t0_barthel_grooming || 0) +
                                parseInt(data.t0_barthel_toilet || 0) +
                                parseInt(data.t0_barthel_feeding || 0) +
                                parseInt(data.t0_barthel_transfer || 0) +
                                parseInt(data.t0_barthel_mobility || 0) +
                                parseInt(data.t0_barthel_dressing || 0) +
                                parseInt(data.t0_barthel_stairs || 0) +
                                parseInt(data.t0_barthel_bathing || 0);

                    if (data.t0_barthel_total && Math.abs(data.t0_barthel_total - sum) > 0.01) {
                        errors.push({
                            field: 't0_barthel_total',
                            message: `Barthel总分不匹配：应为${sum}，实际为${data.t0_barthel_total}`,
                            severity: 'error',
                            expected: sum,
                            actual: data.t0_barthel_total
                        });
                    }

                    return errors;
                }
            },

            // RCSQ总分验证
            rcsqTotal: {
                name: 'RCSQ总分',
                validate: (data) => {
                    const errors = [];

                    // POD1 RCSQ
                    if (data.pod1_rcsq_i1_depth !== undefined &&
                        data.pod1_rcsq_i2_latency !== undefined &&
                        data.pod1_rcsq_i3_awakenings !== undefined &&
                        data.pod1_rcsq_i4_return_sleep !== undefined &&
                        data.pod1_rcsq_i5_overall !== undefined) {

                        const sum = (data.pod1_rcsq_i1_depth +
                                    data.pod1_rcsq_i2_latency +
                                    data.pod1_rcsq_i3_awakenings +
                                    data.pod1_rcsq_i4_return_sleep +
                                    data.pod1_rcsq_i5_overall) / 5;

                        if (data.pod1_rcsq_total && Math.abs(data.pod1_rcsq_total - sum) > 0.5) {
                            errors.push({
                                field: 'pod1_rcsq_total',
                                message: `POD1 RCSQ总分不匹配：应为${sum.toFixed(1)}，实际为${data.pod1_rcsq_total}`,
                                severity: 'error',
                                expected: sum,
                                actual: data.pod1_rcsq_total
                            });
                        }
                    }

                    // POD3 RCSQ
                    if (data.pod3_rcsq_i1_depth !== undefined &&
                        data.pod3_rcsq_i2_latency !== undefined &&
                        data.pod3_rcsq_i3_awakenings !== undefined &&
                        data.pod3_rcsq_i4_return_sleep !== undefined &&
                        data.pod3_rcsq_i5_overall !== undefined) {

                        const sum = (data.pod3_rcsq_i1_depth +
                                    data.pod3_rcsq_i2_latency +
                                    data.pod3_rcsq_i3_awakenings +
                                    data.pod3_rcsq_i4_return_sleep +
                                    data.pod3_rcsq_i5_overall) / 5;

                        if (data.pod3_rcsq_total && Math.abs(data.pod3_rcsq_total - sum) > 0.5) {
                            errors.push({
                                field: 'pod3_rcsq_total',
                                message: `POD3 RCSQ总分不匹配：应为${sum.toFixed(1)}，实际为${data.pod3_rcsq_total}`,
                                severity: 'error',
                                expected: sum,
                                actual: data.pod3_rcsq_total
                            });
                        }
                    }

                    // POD7 RCSQ
                    if (data.pod7_rcsq_i1_depth !== undefined &&
                        data.pod7_rcsq_i2_latency !== undefined &&
                        data.pod7_rcsq_i3_awakenings !== undefined &&
                        data.pod7_rcsq_i4_return_sleep !== undefined &&
                        data.pod7_rcsq_i5_overall !== undefined) {

                        const sum = (data.pod7_rcsq_i1_depth +
                                    data.pod7_rcsq_i2_latency +
                                    data.pod7_rcsq_i3_awakenings +
                                    data.pod7_rcsq_i4_return_sleep +
                                    data.pod7_rcsq_i5_overall) / 5;

                        if (data.pod7_rcsq_total && Math.abs(data.pod7_rcsq_total - sum) > 0.5) {
                            errors.push({
                                field: 'pod7_rcsq_total',
                                message: `POD7 RCSQ总分不匹配：应为${sum.toFixed(1)}，实际为${data.pod7_rcsq_total}`,
                                severity: 'error',
                                expected: sum,
                                actual: data.pod7_rcsq_total
                            });
                        }
                    }

                    return errors;
                }
            },

            // 画钟总分验证
            clockTotal: {
                name: '画钟总分',
                validate: (data) => {
                    const errors = [];

                    // T0 画钟
                    const t0Sum = (data.t0_clock_circle || 0) +
                                  (data.t0_clock_numbers_position || 0) +
                                  (data.t0_clock_numbers_complete || 0) +
                                  (data.t0_clock_hands || 0);

                    if (data.t0_clock_total && Math.abs(data.t0_clock_total - t0Sum) > 0.01) {
                        errors.push({
                            field: 't0_clock_total',
                            message: `T0 画钟总分不匹配：应为${t0Sum}，实际为${data.t0_clock_total}`,
                            severity: 'error',
                            expected: t0Sum,
                            actual: data.t0_clock_total
                        });
                    }

                    // POD7 画钟
                    const pod7Sum = (data.pod7_clock_circle || 0) +
                                    (data.pod7_clock_numbers_position || 0) +
                                    (data.pod7_clock_numbers_complete || 0) +
                                    (data.pod7_clock_hands || 0);

                    if (data.pod7_clock_total && Math.abs(data.pod7_clock_total - pod7Sum) > 0.01) {
                        errors.push({
                            field: 'pod7_clock_total',
                            message: `POD7 画钟总分不匹配：应为${pod7Sum}，实际为${data.pod7_clock_total}`,
                            severity: 'error',
                            expected: pod7Sum,
                            actual: data.pod7_clock_total
                        });
                    }

                    return errors;
                }
            },

            // 认知分数变化异常检测
            cognitiveChanges: {
                name: '认知分数异常变化',
                validate: (data) => {
                    const warnings = [];

                    // MoCA分数变化
                    if (data.t0_moca_total && data.pod7_moca_total) {
                        const change = Math.abs(data.pod7_moca_total - data.t0_moca_total);
                        if (change > 10) {
                            warnings.push({
                                field: 'pod7_moca_total',
                                message: `MoCA分数变化过大（${change}分），建议复核`,
                                severity: 'warning',
                                t0: data.t0_moca_total,
                                pod7: data.pod7_moca_total,
                                change: change
                            });
                        }
                    }

                    // CMMS分数变化
                    if (data.t0_cmms_total && data.pod7_cmms_total) {
                        const change = Math.abs(data.pod7_cmms_total - data.t0_cmms_total);
                        if (change > 10) {
                            warnings.push({
                                field: 'pod7_cmms_total',
                                message: `CMMS分数变化过大（${change}分），建议复核`,
                                severity: 'warning',
                                t0: data.t0_cmms_total,
                                pod7: data.pod7_cmms_total,
                                change: change
                            });
                        }
                    }

                    return warnings;
                }
            },

            // CAM谵妄判定逻辑验证
            camDelirium: {
                name: 'CAM谵妄判定',
                validate: (data) => {
                    const errors = [];

                    // POD1 CAM
                    if (data.pod1_cam_acute_onset && data.pod1_cam_inattention) {
                        const hasDelirium = data.pod1_cam_acute_onset === '是' &&
                                          data.pod1_cam_inattention === '是' &&
                                          (data.pod1_cam_disorganized_thinking === '是' ||
                                           data.pod1_cam_altered_consciousness === '是');

                        if (hasDelirium && data.pod1_cam_delirium === '无') {
                            errors.push({
                                field: 'pod1_cam_delirium',
                                message: 'POD1 CAM判定不符：满足①+②+③或④条件，应判定为"有"',
                                severity: 'warning'
                            });
                        } else if (!hasDelirium && data.pod1_cam_delirium === '有') {
                            errors.push({
                                field: 'pod1_cam_delirium',
                                message: 'POD1 CAM判定不符：不满足谵妄条件，应判定为"无"',
                                severity: 'warning'
                            });
                        }
                    }

                    return errors;
                }
            }
        };
    }

    // 执行所有验证
    validateAll(data) {
        const allErrors = [];

        Object.values(this.validationRules).forEach(rule => {
            try {
                const errors = rule.validate(data);
                allErrors.push(...errors);
            } catch (e) {
                console.error(`Validation error in ${rule.name}:`, e);
            }
        });

        return allErrors;
    }

    // 只执行错误级别的验证
    validateErrors(data) {
        const errors = this.validateAll(data);
        return errors.filter(e => e.severity === 'error');
    }

    // 只执行警告级别的验证
    validateWarnings(data) {
        const errors = this.validateAll(data);
        return errors.filter(e => e.severity === 'warning');
    }

    // 按字段分组错误
    groupErrorsByField(errors) {
        const grouped = {};

        errors.forEach(error => {
            if (!grouped[error.field]) {
                grouped[error.field] = [];
            }
            grouped[error.field].push(error);
        });

        return grouped;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataValidator;
}
