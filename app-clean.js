// POCD研究数据采集应用 - 简洁版 V4.0
// 修复所有空值问题，匹配实际数据库字段
// 日期：2026-08-12

class POCDApp {
    constructor() {
        this.currentView = 'dashboard';
        this.currentPatient = null;
        this.currentPhase = 'basic_info';
        this.patients = [];
    }

    async init() {
        await this.render();
    }

    // ========== 渲染主界面 ==========
    async render() {
        const container = document.getElementById('app');

        if (this.currentView === 'dashboard') {
            await this.renderDashboard();
        } else if (this.currentView === 'patient_list') {
            await this.renderPatientList();
        } else if (this.currentView === 'patient_detail') {
            await this.renderPatientDetail();
        } else if (this.currentView === 'new_patient') {
            this.renderNewPatient();
        }
    }

    // ========== 今日任务看板 ==========
    async renderDashboard() {
        const container = document.getElementById('app');
        const tasks = await db.getTodayTasks();

        container.innerHTML = `
            <div class="container">
                <div class="card">
                    <h2>📅 今日任务</h2>
                    <div class="eyebrow">紧急 ${tasks.urgent.length}</div>
                    ${tasks.urgent.length > 0 ? tasks.urgent.map(t => `
                        <div class="task-item task-urgent" onclick="app.goToPatient(${t.patient.id})">
                            <div class="task-icon">🔴</div>
                            <div class="task-content">
                                <h3>${t.patient.study_id} ${t.patient.name || '未命名'}</h3>
                                <p>${t.phaseName} · 已逾期${t.daysOverdue}天</p>
                            </div>
                        </div>
                    `).join('') : '<p style="color:#5C635D;">暂无紧急任务</p>'}
                </div>

                <div class="card">
                    <div class="eyebrow">即将到期 ${tasks.upcoming.length}</div>
                    ${tasks.upcoming.length > 0 ? tasks.upcoming.map(t => `
                        <div class="task-item task-upcoming" onclick="app.goToPatient(${t.patient.id})">
                            <div class="task-icon">🟡</div>
                            <div class="task-content">
                                <h3>${t.patient.study_id} ${t.patient.name || '未命名'}</h3>
                                <p>${t.phaseName} · 还剩${t.daysRemaining}天</p>
                            </div>
                        </div>
                    `).join('') : '<p style="color:#5C635D;">暂无即将到期任务</p>'}
                </div>

                <div class="card">
                    <h2>📊 所有患者</h2>
                    <button class="btn btn-secondary btn-small" onclick="app.showPatientList()">查看全部</button>
                </div>
            </div>
        `;
    }

    // ========== 患者列表 ==========
    async renderPatientList() {
        const container = document.getElementById('app');
        this.patients = await db.getAllPatients();

        container.innerHTML = `
            <div class="container">
                <div class="card">
                    <h2>👥 患者列表</h2>
                    <button class="btn btn-secondary btn-small" onclick="app.showDashboard()">返回首页</button>
                </div>

                ${this.patients.length > 0 ? this.patients.map(p => `
                    <div class="card" style="cursor:pointer;" onclick="app.goToPatient('${p.id}')">
                        <h3>${p.study_id}</h3>
                        <p>姓名：${p.name || '未填写'} | 年龄：${p.age || '?'} | 性别：${p.gender || '?'}</p>
                        <p style="font-size:13px;color:#5C635D;">
                            入组：${p.enrollment_date || '未填写'} |
                            手术：${p.surgery_date || '未填写'}
                        </p>
                    </div>
                `).join('') : '<div class="empty-state"><p>暂无患者</p></div>'}
            </div>
        `;
    }

    // ========== 患者详情 ==========
    async renderPatientDetail() {
        const container = document.getElementById('app');

        if (!this.currentPatient) {
            container.innerHTML = '<div class="container"><div class="card"><p>患者不存在</p></div></div>';
            return;
        }

        const patient = await db.getPatient(this.currentPatient.id);
        if (!patient) {
            container.innerHTML = '<div class="container"><div class="card"><p>加载失败</p></div></div>';
            return;
        }

        this.currentPatient = patient;

        const phases = ['basic_info', 'T0', 'POD1', 'POD3', 'POD7', 'POD14', 'POD30', 'intraop'];
        const phaseNav = phases.map(phase => {
            const config = PHASE_CONFIG[phase];
            const active = phase === this.currentPhase ? 'active' : '';
            return `<button class="phase-btn ${active}" onclick="app.switchPhase('${phase}')">${config.icon} ${config.title}</button>`;
        }).join('');

        const fields = this.getFieldsForPhase(this.currentPhase);
        const formHtml = fields.map(field => {
            const value = patient[field.name] || '';
            const required = field.required ? '<span class="required">*</span>' : '';
            const readonly = field.readonly ? 'readonly' : '';
            const hint = field.hint ? `<div class="form-hint">${field.hint}</div>` : '';

            let inputHtml = '';
            if (field.type === 'select') {
                const options = field.options.map(opt =>
                    `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`
                ).join('');
                inputHtml = `<select id="${field.name}" ${readonly}><option value="">请选择</option>${options}</select>`;
            } else if (field.type === 'textarea') {
                inputHtml = `<textarea id="${field.name}" ${readonly}>${value}</textarea>`;
            } else {
                const attrs = [];
                if (field.min !== undefined) attrs.push(`min="${field.min}"`);
                if (field.max !== undefined) attrs.push(`max="${field.max}"`);
                if (field.step !== undefined) attrs.push(`step="${field.step}"`);
                inputHtml = `<input type="${field.type}" id="${field.name}" value="${value}" ${readonly} ${attrs.join(' ')}>`;
            }

            return `
                <div class="form-group">
                    <label for="${field.name}">${field.label}${required}</label>
                    ${inputHtml}
                    ${hint}
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="phase-nav">${phaseNav}</div>
            <div class="container">
                <div class="card">
                    <h2>${PHASE_CONFIG[this.currentPhase].icon} ${PHASE_CONFIG[this.currentPhase].title}</h2>
                    <p style="font-size:13px;color:#5C635D;margin-bottom:16px;">
                        ${patient.study_id} | ${patient.name || '未命名'} | ${patient.age || '?'}岁 | ${patient.gender || '?'}
                    </p>
                    ${formHtml}
                </div>
            </div>

            <div class="bottom-bar">
                <button class="btn btn-secondary" onclick="app.showPatientList()">返回</button>
                <button class="btn btn-danger" onclick="app.deletePatient()">删除</button>
                <button class="btn btn-primary" onclick="app.savePhase()">保存</button>
            </div>
        `;
    }

    // ========== 新建患者 ==========
    renderNewPatient() {
        const container = document.getElementById('app');

        container.innerHTML = `
            <div class="container">
                <div class="card">
                    <h2>➕ 新建患者</h2>

                    <div class="form-group">
                        <label for="new_study_id">研究编号<span class="required">*</span></label>
                        <input type="text" id="new_study_id" placeholder="如POCD-0001">
                        <div class="form-hint">必须唯一</div>
                    </div>

                    <div class="form-group">
                        <label for="new_name">患者姓名</label>
                        <input type="text" id="new_name" placeholder="床旁核对用">
                    </div>

                    <div class="form-group">
                        <label for="new_enrollment_date">入组日期<span class="required">*</span></label>
                        <input type="date" id="new_enrollment_date">
                    </div>

                    <div class="form-group">
                        <label for="new_surgery_date">手术日期<span class="required">*</span></label>
                        <input type="date" id="new_surgery_date">
                    </div>

                    <div class="form-group">
                        <label for="new_age">年龄<span class="required">*</span></label>
                        <input type="number" id="new_age" min="18" max="120" placeholder="岁">
                    </div>

                    <div class="form-group">
                        <label for="new_gender">性别<span class="required">*</span></label>
                        <select id="new_gender">
                            <option value="">请选择</option>
                            <option value="男">男</option>
                            <option value="女">女</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="new_education_years">受教育年限<span class="required">*</span></label>
                        <input type="number" id="new_education_years" min="0" max="30" placeholder="年">
                    </div>
                </div>
            </div>

            <div class="bottom-bar">
                <button class="btn btn-secondary" onclick="app.showDashboard()">取消</button>
                <button class="btn btn-primary" onclick="app.createPatient()">创建</button>
            </div>
        `;
    }

    // ========== 工具方法 ==========
    getFieldsForPhase(phase) {
        return FIELD_DEFINITIONS[phase] || [];
    }

    switchPhase(phase) {
        this.currentPhase = phase;
        this.render();
    }

    showDashboard() {
        this.currentView = 'dashboard';
        this.render();
    }

    showPatientList() {
        this.currentView = 'patient_list';
        this.render();
    }

    showNewPatient() {
        this.currentView = 'new_patient';
        this.render();
    }

    async goToPatient(id) {
        try {
            const patient = await db.getPatient(id);
            if (patient) {
                this.currentPatient = patient;
                this.currentView = 'patient_detail';
                this.currentPhase = 'basic_info';
                await this.render();
            }
        } catch (error) {
            console.error('跳转患者失败:', error);
            alert('加载患者失败');
        }
    }

    // ========== 创建患者 ==========
    async createPatient() {
        const study_id = document.getElementById('new_study_id').value.trim();
        const name = document.getElementById('new_name').value.trim();
        const enrollment_date = document.getElementById('new_enrollment_date').value;
        const surgery_date = document.getElementById('new_surgery_date').value;
        const age = document.getElementById('new_age').value;
        const gender = document.getElementById('new_gender').value;
        const education_years = document.getElementById('new_education_years').value;

        if (!study_id || !enrollment_date || !surgery_date || !age || !gender || !education_years) {
            alert('请填写所有必填项');
            return;
        }

        try {
            const patient = await db.createPatient({
                study_id,
                name: name || null,
                enrollment_date,
                surgery_date,
                age: parseInt(age),
                gender,
                education_years: parseInt(education_years)
            });

            alert('创建成功！');
            this.goToPatient(patient.id);
        } catch (error) {
            console.error('创建患者失败:', error);
            alert('创建失败：' + (error.message || '未知错误'));
        }
    }

    // ========== 保存阶段数据 ==========
    async savePhase() {
        const fields = this.getFieldsForPhase(this.currentPhase);
        const formData = {};

        // 收集表单数据，空值统一转为 null
        fields.forEach(field => {
            const element = document.getElementById(field.name);
            if (element) {
                let value = element.value;

                // 空值统一转为 null
                if (value === '' || value === null || value === undefined) {
                    value = null;
                } else if (field.type === 'number' && value !== null) {
                    // 数字类型转换
                    value = parseFloat(value);
                    if (isNaN(value)) value = null;
                }

                formData[field.name] = value;
            }
        });

        console.log('保存数据:', formData);

        try {
            if (this.currentPhase === 'basic_info') {
                // 更新基本信息
                const updated = await db.updatePatient(this.currentPatient.id, formData);
                if (updated) {
                    this.currentPatient = updated;
                    alert('保存成功！');
                    await this.render();
                }
            } else {
                // 保存其他阶段数据
                await db.savePatientData(this.currentPatient.id, this.currentPhase, formData, false);
                alert('保存成功！');
                await this.loadPatientDetail(this.currentPatient.id);
            }
        } catch (error) {
            console.error('保存失败:', error);
            alert('保存失败：' + (error.message || '请查看控制台'));
        }
    }

    async loadPatientDetail(id) {
        const patient = await db.getPatient(id);
        if (patient) {
            this.currentPatient = patient;
            await this.render();
        }
    }

    // ========== 删除患者 ==========
    async deletePatient() {
        if (!confirm(`确定要删除患者 ${this.currentPatient.study_id} 吗？`)) {
            return;
        }

        try {
            await db.deletePatient(this.currentPatient.id);
            alert('删除成功！');
            this.currentPatient = null;
            this.showPatientList();
        } catch (error) {
            console.error('删除失败:', error);
            alert('删除失败');
        }
    }
}

// 创建全局实例
window.app = new POCDApp();
