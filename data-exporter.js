// 数据导出模块 - 支持CSV和Excel格式

class DataExporter {
    constructor() {
        this.fieldDefinitions = null;
    }

    // 设置字段定义
    setFieldDefinitions(definitions) {
        this.fieldDefinitions = definitions;
    }

    // 导出单个患者数据为CSV
    exportPatientToCSV(patientData) {
        const rows = [];

        // 表头
        rows.push(['字段代码', '字段名称', '值']);

        // 遍历所有字段定义
        if (this.fieldDefinitions) {
            Object.values(this.fieldDefinitions).forEach(group => {
                group.forEach(field => {
                    const value = patientData[field.name];
                    if (value !== null && value !== undefined && value !== '') {
                        rows.push([
                            field.name,
                            field.label,
                            value
                        ]);
                    }
                });
            });
        }

        return this.convertToCSV(rows);
    }

    // 导出所有患者数据为CSV（宽表格式）
    exportAllPatientsToCSV(patientsData) {
        if (!patientsData || patientsData.length === 0) {
            return '';
        }

        // 收集所有可能的字段
        const allFields = [];
        if (this.fieldDefinitions) {
            Object.values(this.fieldDefinitions).forEach(group => {
                group.forEach(field => {
                    allFields.push({
                        name: field.name,
                        label: field.label
                    });
                });
            });
        }

        // 表头行
        const headers = ['患者ID', ...allFields.map(f => f.label)];
        const rows = [headers];

        // 数据行
        patientsData.forEach(patient => {
            const row = [patient.id];
            allFields.forEach(field => {
                const value = patient[field.name];
                row.push(value !== null && value !== undefined ? value : '');
            });
            rows.push(row);
        });

        return this.convertToCSV(rows);
    }

    // 转换为CSV格式
    convertToCSV(rows) {
        return rows.map(row => {
            return row.map(cell => {
                // 处理包含逗号、引号或换行的单元格
                const cellStr = String(cell);
                if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                    return `"${cellStr.replace(/"/g, '""')}"`;
                }
                return cellStr;
            }).join(',');
        }).join('\n');
    }

    // 下载CSV文件
    downloadCSV(csvContent, filename) {
        // 添加BOM以支持Excel正确显示中文
        const BOM = '﻿';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    }

    // 导出单个患者完整数据
    exportSinglePatient(patientData, patientName) {
        const csv = this.exportPatientToCSV(patientData);
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `POCD研究_${patientName}_${timestamp}.csv`;
        this.downloadCSV(csv, filename);
    }

    // 导出所有患者数据
    exportAllPatients(patientsData) {
        const csv = this.exportAllPatientsToCSV(patientsData);
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `POCD研究_全部患者_${timestamp}.csv`;
        this.downloadCSV(csv, filename);
    }

    // 导出备注数据
    exportNotes(notesData, patientName) {
        const rows = [];

        // 表头
        rows.push(['阶段', '备注内容', '创建时间', '创建人']);

        // 数据行
        notesData.forEach(note => {
            rows.push([
                note.phase,
                note.content,
                new Date(note.created_at).toLocaleString('zh-CN'),
                note.users?.email || '未知'
            ]);
        });

        const csv = this.convertToCSV(rows);
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `POCD研究_备注_${patientName}_${timestamp}.csv`;
        this.downloadCSV(csv, filename);
    }

    // 导出备注历史记录
    exportNoteHistory(historyData, patientName) {
        const rows = [];

        // 表头
        rows.push(['阶段', '操作', '内容', '操作时间', '操作人']);

        // 数据行
        historyData.forEach(record => {
            const actionText = {
                'created': '创建',
                'updated': '更新',
                'deleted': '删除'
            }[record.action] || record.action;

            rows.push([
                record.phase,
                actionText,
                record.content,
                new Date(record.modified_at).toLocaleString('zh-CN'),
                record.users?.email || '未知'
            ]);
        });

        const csv = this.convertToCSV(rows);
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `POCD研究_备注历史_${patientName}_${timestamp}.csv`;
        this.downloadCSV(csv, filename);
    }

    // 生成数据统计报告
    generateStatisticsReport(patientsData) {
        const report = {
            totalPatients: patientsData.length,
            byPhase: {
                T0: 0,
                POD1: 0,
                POD3: 0,
                POD7: 0
            },
            completionRate: {
                T0: 0,
                POD1: 0,
                POD3: 0,
                POD7: 0
            },
            averageScores: {
                t0_moca: 0,
                t0_cmms: 0,
                pod7_moca: 0,
                pod7_cmms: 0
            }
        };

        // 统计各阶段完成情况
        patientsData.forEach(patient => {
            if (patient.t0_moca_total !== null && patient.t0_moca_total !== undefined) {
                report.byPhase.T0++;
            }
            if (patient.pod1_cam_delirium !== null && patient.pod1_cam_delirium !== undefined) {
                report.byPhase.POD1++;
            }
            if (patient.pod3_3dcam_delirium !== null && patient.pod3_3dcam_delirium !== undefined) {
                report.byPhase.POD3++;
            }
            if (patient.pod7_moca_total !== null && patient.pod7_moca_total !== undefined) {
                report.byPhase.POD7++;
            }
        });

        // 计算完成率
        Object.keys(report.byPhase).forEach(phase => {
            report.completionRate[phase] =
                Math.round((report.byPhase[phase] / report.totalPatients) * 100);
        });

        // 计算平均分数
        let t0MocaSum = 0, t0MocaCount = 0;
        let t0CmmsSum = 0, t0CmmsCount = 0;
        let pod7MocaSum = 0, pod7MocaCount = 0;
        let pod7CmmsSum = 0, pod7CmmsCount = 0;

        patientsData.forEach(patient => {
            if (patient.t0_moca_total) {
                t0MocaSum += patient.t0_moca_total;
                t0MocaCount++;
            }
            if (patient.t0_cmms_total) {
                t0CmmsSum += patient.t0_cmms_total;
                t0CmmsCount++;
            }
            if (patient.pod7_moca_total) {
                pod7MocaSum += patient.pod7_moca_total;
                pod7MocaCount++;
            }
            if (patient.pod7_cmms_total) {
                pod7CmmsSum += patient.pod7_cmms_total;
                pod7CmmsCount++;
            }
        });

        report.averageScores.t0_moca = t0MocaCount > 0 ?
            Math.round((t0MocaSum / t0MocaCount) * 10) / 10 : 0;
        report.averageScores.t0_cmms = t0CmmsCount > 0 ?
            Math.round((t0CmmsSum / t0CmmsCount) * 10) / 10 : 0;
        report.averageScores.pod7_moca = pod7MocaCount > 0 ?
            Math.round((pod7MocaSum / pod7MocaCount) * 10) / 10 : 0;
        report.averageScores.pod7_cmms = pod7CmmsCount > 0 ?
            Math.round((pod7CmmsSum / pod7CmmsCount) * 10) / 10 : 0;

        return report;
    }

    // 导出统计报告
    exportStatisticsReport(patientsData) {
        const report = this.generateStatisticsReport(patientsData);

        const rows = [];
        rows.push(['POCD研究数据统计报告']);
        rows.push(['生成时间', new Date().toLocaleString('zh-CN')]);
        rows.push([]);

        rows.push(['总患者数', report.totalPatients]);
        rows.push([]);

        rows.push(['各阶段完成情况']);
        rows.push(['阶段', '完成人数', '完成率(%)']);
        Object.keys(report.byPhase).forEach(phase => {
            rows.push([
                phase,
                report.byPhase[phase],
                report.completionRate[phase]
            ]);
        });
        rows.push([]);

        rows.push(['平均认知评分']);
        rows.push(['测验', '平均分']);
        rows.push(['T0 MoCA', report.averageScores.t0_moca]);
        rows.push(['T0 CMMS', report.averageScores.t0_cmms]);
        rows.push(['POD7 MoCA', report.averageScores.pod7_moca]);
        rows.push(['POD7 CMMS', report.averageScores.pod7_cmms]);

        const csv = this.convertToCSV(rows);
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `POCD研究_统计报告_${timestamp}.csv`;
        this.downloadCSV(csv, filename);
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataExporter;
}
