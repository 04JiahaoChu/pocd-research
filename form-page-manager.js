// 表单分页管理器
// 处理字段分页、进度跟踪、字段依赖逻辑

class FormPageManager {
    constructor(fieldDefinitions, fieldPages) {
        this.fieldDefinitions = fieldDefinitions;
        this.fieldPages = fieldPages;
        this.currentPhase = null;
        this.currentPageIndex = 0;
        this.formData = {};
    }

    // 设置当前阶段
    setPhase(phase) {
        this.currentPhase = phase;
        this.currentPageIndex = 0;
    }

    // 获取当前阶段的总页数
    getTotalPages() {
        if (!this.currentPhase || !this.fieldPages[this.currentPhase]) {
            return 1;
        }
        return this.fieldPages[this.currentPhase].length;
    }

    // 获取当前页面配置
    getCurrentPage() {
        if (!this.currentPhase || !this.fieldPages[this.currentPhase]) {
            return null;
        }
        return this.fieldPages[this.currentPhase][this.currentPageIndex];
    }

    // 获取当前页面的所有字段
    getCurrentPageFields() {
        const page = this.getCurrentPage();
        if (!page) return [];

        let fields = [];
        page.groups.forEach(groupName => {
            const groupFields = this.fieldDefinitions[groupName] || [];
            fields = fields.concat(groupFields);
        });

        return fields;
    }

    // 下一页
    nextPage() {
        const totalPages = this.getTotalPages();
        if (this.currentPageIndex < totalPages - 1) {
            this.currentPageIndex++;
            return true;
        }
        return false; // 已是最后一页
    }

    // 上一页
    previousPage() {
        if (this.currentPageIndex > 0) {
            this.currentPageIndex--;
            return true;
        }
        return false; // 已是第一页
    }

    // 跳转到指定页
    goToPage(pageIndex) {
        const totalPages = this.getTotalPages();
        if (pageIndex >= 0 && pageIndex < totalPages) {
            this.currentPageIndex = pageIndex;
            return true;
        }
        return false;
    }

    // 检查字段是否应该显示（处理依赖逻辑）
    shouldShowField(field) {
        if (!field.dependsOn) {
            return true; // 没有依赖，总是显示
        }

        const dependencyValue = this.formData[field.dependsOn];
        return dependencyValue === field.showWhen;
    }

    // 更新表单数据
    updateFormData(fieldName, value) {
        this.formData[fieldName] = value;
    }

    // 设置完整表单数据
    setFormData(data) {
        this.formData = data || {};
    }

    // 获取当前页面的进度百分比
    getProgress() {
        const totalPages = this.getTotalPages();
        if (totalPages === 0) return 0;
        return Math.round(((this.currentPageIndex + 1) / totalPages) * 100);
    }

    // 验证当前页面
    validateCurrentPage() {
        const fields = this.getCurrentPageFields();
        const errors = [];

        fields.forEach(field => {
            // 只验证应该显示的字段
            if (!this.shouldShowField(field)) {
                return;
            }

            const value = this.formData[field.name];

            // 必填验证
            if (field.required && (value === null || value === undefined || value === '')) {
                errors.push({
                    field: field.name,
                    label: field.label,
                    message: '此项为必填'
                });
            }

            // 数值范围验证
            if (field.type === 'number' && value !== null && value !== undefined && value !== '') {
                const numValue = parseFloat(value);
                if (field.min !== undefined && numValue < field.min) {
                    errors.push({
                        field: field.name,
                        label: field.label,
                        message: `最小值为 ${field.min}`
                    });
                }
                if (field.max !== undefined && numValue > field.max) {
                    errors.push({
                        field: field.name,
                        label: field.label,
                        message: `最大值为 ${field.max}`
                    });
                }
            }

            // 计算字段验证
            if (field.computed && field.formula) {
                const computedValue = this.computeFieldValue(field.formula);
                const actualValue = parseFloat(value);
                if (actualValue !== computedValue && !isNaN(computedValue)) {
                    errors.push({
                        field: field.name,
                        label: field.label,
                        message: `计算值应为 ${computedValue}，当前为 ${actualValue}`,
                        type: 'warning'
                    });
                }
            }
        });

        return errors;
    }

    // 计算公式字段的值
    computeFieldValue(formula) {
        try {
            // 提取公式中的字段名
            const fieldNames = formula.match(/[a-z_][a-z0-9_]*/gi) || [];

            // 替换字段名为实际值
            let expression = formula;
            fieldNames.forEach(fieldName => {
                const value = parseFloat(this.formData[fieldName]) || 0;
                expression = expression.replace(new RegExp(fieldName, 'g'), value);
            });

            // 安全计算（使用Function而不是eval）
            const result = new Function(`return ${expression}`)();

            // 四舍五入到2位小数
            return Math.round(result * 100) / 100;
        } catch (e) {
            console.error('Formula computation error:', formula, e);
            return null;
        }
    }

    // 自动计算所有computed字段
    autoCalculateFields() {
        Object.values(this.fieldDefinitions).forEach(group => {
            group.forEach(field => {
                if (field.computed && field.formula) {
                    const computedValue = this.computeFieldValue(field.formula);
                    if (computedValue !== null && !isNaN(computedValue)) {
                        this.formData[field.name] = computedValue;
                    }
                }
            });
        });
    }

    // 获取所有页面的完成状态
    getAllPagesStatus() {
        if (!this.currentPhase || !this.fieldPages[this.currentPhase]) {
            return [];
        }

        return this.fieldPages[this.currentPhase].map((page, index) => {
            const pageFields = [];
            page.groups.forEach(groupName => {
                const groupFields = this.fieldDefinitions[groupName] || [];
                pageFields.push(...groupFields);
            });

            // 计算填写率
            const visibleFields = pageFields.filter(f => this.shouldShowField(f));
            const filledFields = visibleFields.filter(f => {
                const value = this.formData[f.name];
                return value !== null && value !== undefined && value !== '';
            });

            const completionRate = visibleFields.length > 0
                ? Math.round((filledFields.length / visibleFields.length) * 100)
                : 100;

            return {
                pageIndex: index,
                title: page.title,
                completed: completionRate === 100,
                completionRate: completionRate,
                isCurrent: index === this.currentPageIndex
            };
        });
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormPageManager;
}
