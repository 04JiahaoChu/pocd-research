// POCD研究数据采集系统 V2.0 - 云端同步版
// 架构：按患者管理 + 每日任务清单 + Supabase云端同步

const app = {
    currentView: 'tasks',  // 'tasks' | 'patient-detail' | 'all-patients'
    currentPatient: null,
    currentPhase: 'T0',
    loading: false,

    async init() {
        this.showLoading();

        // 初始化数据库
        const success = await db.init();
        if (!success) {
            this.hideLoading();
            return;
        }

        this.hideLoading();
        await this.render();
    },

    showLoading() {
        document.getElementById('app').innerHTML = `
            <div class="container">
                <div class="empty-state">
                    <p>加载中...</p>
                </div>
            </div>
        `;
    },

    hideLoading() {},

    async render() {
        const container = document.getElementById('app');

        if (this.currentView === 'tasks') {
            container.innerHTML = await this.renderTasksView();
        } else if (this.currentView === 'patient-detail') {
            container.innerHTML = await this.renderPatientDetail();
        } else if (this.currentView === 'all-patients') {
            container.innerHTML = await this.renderAllPatients();
        }
    },

    async renderTasksView() {
        const tasks = await db.getTodayTasks();
        const today = new Date().toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'short'
        });

        // 紧急任务
        const urgentHtml = tasks.urgent.length > 0
            ? tasks.urgent.map(task => `
                <div class="task-item task-urgent" onclick="app.goToPatient('${task.patient.id}', '${task.phase}')">
                    <div class="task-icon">🔴</div>
                    <div class="task-content">
                        <h3>${task.patient.study_id} ${task.patient.name ? '- ' + task.patient.name : ''}</h3>
                        <p>${task.phaseName} ${task.daysOverdue > 0 ? `<span class="badge-urgent status-badge">延迟${task.daysOverdue}天</span>` : `<span class="badge-urgent status-badge">今日到期</span>`}</p>
                    </div>
                </div>
            `).join('')
            : '<div class="empty-state"><p>暂无紧急任务</p></div>';

        // 即将到期
        const upcomingHtml = tasks.upcoming.length > 0
            ? tasks.upcoming.map(task => `
                <div class="task-item task-upcoming" onclick="app.goToPatient('${task.patient.id}', '${task.phase}')">
                    <div class="task-icon">🟡</div>
                    <div class="task-content">
                        <h3>${task.patient.study_id} ${task.patient.name ? '- ' + task.patient.name : ''}</h3>
                        <p>${task.phaseName} <span class="badge-upcoming status-badge">${task.daysRemaining}天后到期</span></p>
                    </div>
                </div>
            `).join('')
            : '<div class="empty-state"><p>暂无即将到期任务</p></div>';

        // 今日已完成
        const completedHtml = tasks.completed.length > 0
            ? tasks.completed.map(task => {
                const time = new Date(task.completedAt).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                return `
                    <div class="task-item task-completed">
                        <div class="task-icon">✅</div>
                        <div class="task-content">
                            <h3>${task.patient.study_id}</h3>
                            <p>${task.phaseName} <span class="badge-completed status-badge">${time} 完成</span></p>
                        </div>
                    </div>
                `;
            }).join('')
            : '<div class="empty-state"><p>今日暂无完成记录</p></div>';

        return `
            <div class="container">
                <div class="card">
                    <span class="eyebrow">Today</span>
                    <h2>${today}</h2>
                </div>

                <div class="card">
                    <h2>🔴 需要立即采集 (${tasks.urgent.length})</h2>
                    ${urgentHtml}
                </div>

                <div class="card">
                    <h2>🟡 即将到期 (${tasks.upcoming.length})</h2>
                    ${upcomingHtml}
                </div>

                <div class="card">
                    <h2>✅ 今日已完成 (${tasks.completed.length})</h2>
                    ${completedHtml}
                </div>

                <div class="card">
                    <h2>快捷操作</h2>
                    <button class="btn btn-secondary" onclick="app.showAllPatients()" style="width: 100%; margin-bottom: 8px;">
                        📋 查看所有患者
                    </button>
                    <button class="btn btn-secondary" onclick="app.exportToExcel()" style="width: 100%;">
                        📊 导出Excel表格
                    </button>
                </div>
            </div>
        `;
    },

    async renderAllPatients() {
        const patients = await db.getAllPatients();

        if (patients.length === 0) {
            return `
                <div class="container">
                    <div class="card">
                        <div class="empty-state">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                            </svg>
                            <h3>暂无患者数据</h3>
                            <p>点击右下角 + 按钮添加新患者</p>
                        </div>
                    </div>
                </div>
            `;
        }

        const list = await Promise.all(patients.map(async (p) => {
            const allData = await db.getAllPatientData(p.id);
            const phases = ['T0', 'POD1', 'POD3', 'POD7', 'POD14', 'POD30'];
            const completed = allData.filter(d => d.completed).length;
            const progress = `${completed}/${phases.length}`;

            return `
                <div class="task-item" onclick="app.goToPatient('${p.id}')">
                    <div class="task-content">
                        <h3>${p.study_id} ${p.name ? '- ' + p.name : ''}</h3>
                        <p>入组：${p.enroll_date || '未设置'} | 手术：${p.surgery_date || '未设置'} | 进度：${progress}</p>
                    </div>
                    <button class="btn btn-secondary btn-small" onclick="event.stopPropagation(); app.goToPatient('${p.id}')">录入</button>
                </div>
            `;
        }));

        return `
            <div class="container">
                <div class="card">
                    <h2>所有患者 (${patients.length})</h2>
                    ${list.join('')}
                </div>

                <div class="card">
                    <button class="btn btn-secondary" onclick="app.backToTasks()" style="width: 100%;">
                        ← 返回今日任务
                    </button>
                </div>
            </div>
        `;
    },

    async renderPatientDetail() {
        const patient = this.currentPatient;
        const allData = await db.getAllPatientData(patient.id);

        const phases = [
            { id: 'T0', name: 'T0 术前基线', icon: '📋' },
            { id: 'POD1', name: 'POD1 术后第1天', icon: '🏥' },
            { id: 'POD3', name: 'POD3 术后第3天', icon: '📈' },
            { id: 'POD7', name: 'POD7 术后第7天', icon: '✅' },
            { id: 'POD14', name: 'POD14 术后第14天', icon: '🔄' },
            { id: 'POD30', name: 'POD30 术后第30天', icon: '🎯' }
        ];

        const phaseNav = phases.map(p => {
            const active = p.id === this.currentPhase ? 'active' : '';
            const phaseData = allData.find(d => d.phase === p.id);
            const completed = phaseData?.completed ? '✓' : '';
            return `<button class="phase-btn ${active}" onclick="app.switchPhase('${p.id}')">${p.icon} ${p.name} ${completed}</button>`;
        }).join('');

        return `
            <div class="phase-nav">${phaseNav}</div>
            <div class="container">
                <div class="card">
                    <span class="eyebrow">Patient Info</span>
                    <h2>${patient.study_id}</h2>
                    <p><strong>姓名：</strong>${patient.name || '未填写'}</p>
                    <p><strong>入组日期：</strong>${patient.enroll_date || '未设置'}</p>
                    <p><strong>手术日期：</strong>${patient.surgery_date || '未设置'}</p>
                    <button class="btn btn-secondary btn-small" onclick="app.editPatientInfo()" style="margin-top: 12px;">
                        编辑基本信息
                    </button>
                </div>

                <div class="card">
                    <h2>${phases.find(p => p.id === this.currentPhase).name}</h2>
                    ${await this.renderPhaseFields()}
                </div>
            </div>

            <div class="bottom-bar">
                <button class="btn btn-secondary" onclick="app.backToTasks()">返回</button>
                <button class="btn btn-primary" onclick="app.savePhase()">保存</button>
            </div>
        `;
    },

    async renderPhaseFields() {
        const fields = this.getFieldsForPhase(this.currentPhase);
        const phaseData = await db.getPatientData(this.currentPatient.id, this.currentPhase);
        const data = phaseData?.data || {};

        return fields.map(field => {
            const value = data[field.name] || '';

            if (field.type === 'select') {
                const options = field.options.map(opt =>
                    `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`
                ).join('');

                return `
                    <div class="form-group">
                        <label>${field.label} ${field.required ? '<span class="required">*</span>' : ''}</label>
                        <select id="${field.name}">
                            <option value="">请选择</option>
                            ${options}
                        </select>
                        ${field.hint ? `<p class="form-hint">${field.hint}</p>` : ''}
                    </div>
                `;
            } else if (field.type === 'number') {
                return `
                    <div class="form-group">
                        <label>${field.label} ${field.required ? '<span class="required">*</span>' : ''}</label>
                        <input type="number" id="${field.name}" value="${value}"
                               ${field.min !== undefined ? `min="${field.min}"` : ''}
                               ${field.max !== undefined ? `max="${field.max}"` : ''}
                               ${field.step ? `step="${field.step}"` : ''}>
                        ${field.hint ? `<p class="form-hint">${field.hint}</p>` : ''}
                    </div>
                `;
            } else if (field.type === 'date') {
                return `
                    <div class="form-group">
                        <label>${field.label} ${field.required ? '<span class="required">*</span>' : ''}</label>
                        <input type="date" id="${field.name}" value="${value}">
                        ${field.hint ? `<p class="form-hint">${field.hint}</p>` : ''}
                    </div>
                `;
            } else {
                return `
                    <div class="form-group">
                        <label>${field.label} ${field.required ? '<span class="required">*</span>' : ''}</label>
                        <input type="text" id="${field.name}" value="${value}">
                        ${field.hint ? `<p class="form-hint">${field.hint}</p>` : ''}
                    </div>
                `;
            }
        }).join('');
    },

    getFieldsForPhase(phase) {
        // 字段定义（与V1.0相同）
        const fieldDefinitions = {
            'T0': [
                { name: 'mmse_total', label: 'MMSE总分', type: 'number', min: 0, max: 30, required: true, hint: '0-30分' },
                { name: 'moca_total', label: 'MoCA总分', type: 'number', min: 0, max: 30, required: true, hint: '0-30分' },
                { name: 'age', label: '年龄', type: 'number', min: 50, max: 120, required: true, hint: '岁' },
                { name: 'gender', label: '性别', type: 'select', options: ['男', '女'], required: true },
                { name: 'education', label: '受教育年限', type: 'number', min: 0, max: 30, required: true, hint: '年' },
                { name: 'hypertension', label: '高血压', type: 'select', options: ['有', '无'], required: true },
                { name: 'diabetes', label: '糖尿病', type: 'select', options: ['有', '无'], required: true },
                { name: 'psqi_total', label: 'PSQI总分', type: 'number', min: 0, max: 21, required: true, hint: '0-21分' },
                { name: 'grip_strength', label: '握力', type: 'number', min: 0, max: 80, step: 0.1, required: true, hint: 'kg' },
                { name: 'gait_speed', label: '6m步速', type: 'number', min: 0, max: 3, step: 0.1, required: true, hint: 'm/s' },
                { name: 'ct_smi', label: 'CT-L3 SMI', type: 'number', min: 0, max: 100, step: 0.1, hint: 'cm²/m²（选填）' },
                { name: 'sarcopenia', label: '肌少症判定AWGS', type: 'select', options: ['是', '否', '可能'], hint: '根据握力/步速/SMI判定' }
            ],
            'POD1': [
                { name: 'cam', label: 'CAM谵妄筛查', type: 'select', options: ['阳性', '阴性'], required: true },
                { name: 'rcsq', label: 'RCSQ睡眠自评', type: 'number', min: 0, max: 100, required: true, hint: '0-100mm' },
                { name: 'sleep_hours', label: '护士记录睡眠时长', type: 'number', min: 0, max: 24, step: 0.5, required: true, hint: '小时' },
                { name: 'sleep_trigger', label: '睡眠修正是否触发', type: 'select', options: ['是', '否'], required: true },
                { name: 'il6', label: 'IL-6', type: 'number', min: 0, max: 500, step: 0.1, hint: 'pg/mL' },
                { name: 'crp', label: 'CRP', type: 'number', min: 0, max: 500, step: 0.1, hint: 'mg/L' },
                { name: 'nrs_pain', label: 'NRS疼痛评分', type: 'number', min: 0, max: 10, required: true, hint: '0-10' },
                { name: 'surgery_duration', label: '实际手术时长', type: 'number', min: 0, max: 24, step: 0.5, required: true, hint: '小时' }
            ],
            'POD3': [
                { name: 'mmse', label: 'MMSE', type: 'number', min: 0, max: 30, required: true },
                { name: 'moca', label: 'MoCA', type: 'number', min: 0, max: 30, required: true },
                { name: 'il6', label: 'IL-6', type: 'number', min: 0, max: 500, step: 0.1, hint: 'pg/mL' },
                { name: 'crp', label: 'CRP', type: 'number', min: 0, max: 500, step: 0.1, hint: 'mg/L' },
                { name: 'rcsq', label: 'RCSQ睡眠自评', type: 'number', min: 0, max: 100, hint: '0-100mm' },
                { name: 'sleep_compliance', label: '睡眠修正依从条目数', type: 'number', min: 0, max: 4, hint: '0-4条' },
                { name: 'nrs_pain', label: 'NRS疼痛', type: 'number', min: 0, max: 10, hint: '0-10' },
                { name: 'barthel', label: 'Barthel指数', type: 'number', min: 0, max: 100, hint: '0-100' }
            ],
            'POD7': [
                { name: 'mmse', label: 'MMSE', type: 'number', min: 0, max: 30, required: true },
                { name: 'moca', label: 'MoCA', type: 'number', min: 0, max: 30, required: true },
                { name: 'pocd', label: 'POCD判定', type: 'select', options: ['阳性', '阴性'], required: true },
                { name: 'cam', label: 'CAM谵妄', type: 'select', options: ['阳性', '阴性'] },
                { name: 'cumulative_sleep', label: '累积睡眠时长POD1-7', type: 'number', min: 0, max: 200, step: 0.5, hint: '小时' },
                { name: 'crp', label: 'CRP', type: 'number', min: 0, max: 500, step: 0.1, hint: 'mg/L' },
                { name: 'discharge_date', label: '实际出院日期', type: 'date' },
                { name: 'discharge_to', label: '出院去向', type: 'select', options: ['家', '康复', 'ICU'] }
            ],
            'POD14': [
                { name: 'mmse', label: 'MMSE简版', type: 'number', min: 0, max: 30, hint: '仅POD7阳性者' },
                { name: 'psqi', label: 'PSQI', type: 'number', min: 0, max: 21, hint: '0-21分' }
            ],
            'POD30': [
                { name: 'mmse', label: 'MMSE', type: 'number', min: 0, max: 30, required: true },
                { name: 'moca', label: 'MoCA', type: 'number', min: 0, max: 30, required: true },
                { name: 'pocd', label: 'POCD判定', type: 'select', options: ['阳性', '阴性'], required: true },
                { name: 'psqi', label: 'PSQI', type: 'number', min: 0, max: 21, hint: '0-21分' },
                { name: 'sf12', label: 'SF-12生活质量', type: 'number', hint: '分' },
                { name: 'barthel', label: 'Barthel指数', type: 'number', min: 0, max: 100, hint: '0-100' },
                { name: 'adverse_events', label: '不良事件', type: 'text', hint: '再入院/ICU/死亡' }
            ]
        };

        return fieldDefinitions[phase] || [];
    },

    // ========== 交互操作 ==========

    showNewPatient() {
        const studyId = prompt('请输入研究编号（如 POCD2024-0001）：');
        if (!studyId) return;

        const name = prompt('患者姓名（可选，仅用于床旁核对）：');
        const enrollDate = prompt('入组日期（如 2026-08-09）：', new Date().toISOString().split('T')[0]);
        const surgeryDate = prompt('手术日期（可选，如 2026-08-12）：');

        this.createPatient({
            studyId,
            name: name || '',
            enrollDate: enrollDate || new Date().toISOString().split('T')[0],
            surgeryDate: surgeryDate || null
        });
    },

    async createPatient(data) {
        const patient = await db.createPatient(data);
        if (patient) {
            alert('患者创建成功！');
            this.goToPatient(patient.id);
        }
    },

    async goToPatient(id, phase = 'T0') {
        this.currentPatient = await db.getPatient(id);
        this.currentView = 'patient-detail';
        this.currentPhase = phase;
        await this.render();
    },

    switchPhase(phase) {
        this.currentPhase = phase;
        this.render();
    },

    async savePhase() {
        const fields = this.getFieldsForPhase(this.currentPhase);
        const formData = {};

        fields.forEach(field => {
            const element = document.getElementById(field.name);
            if (element) {
                formData[field.name] = element.value;
            }
        });

        const completed = confirm('标记本阶段为已完成？');

        const saved = await db.savePatientData(
            this.currentPatient.id,
            this.currentPhase,
            formData,
            completed
        );

        if (saved) {
            alert('保存成功！');
            await this.render();
        } else {
            alert('保存失败，请检查网络连接');
        }
    },

    editPatientInfo() {
        const name = prompt('患者姓名：', this.currentPatient.name);
        const enrollDate = prompt('入组日期：', this.currentPatient.enroll_date);
        const surgeryDate = prompt('手术日期：', this.currentPatient.surgery_date || '');

        this.updatePatientInfo({
            name,
            enroll_date: enrollDate,
            surgery_date: surgeryDate || null
        });
    },

    async updatePatientInfo(updates) {
        const updated = await db.updatePatient(this.currentPatient.id, updates);
        if (updated) {
            this.currentPatient = updated;
            alert('更新成功！');
            await this.render();
        }
    },

    showAllPatients() {
        this.currentView = 'all-patients';
        this.render();
    },

    backToTasks() {
        this.currentView = 'tasks';
        this.render();
    },

    async exportToExcel() {
        alert('Excel导出功能开发中...\n\n将在下一版本实现：\n1. 导出为符合V3格式的Excel\n2. 包含所有117列数据\n3. 自动填充校验规则\n\n当前可以先用浏览器开发者工具查看Supabase数据库');
    }
};

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// 注册Service Worker（离线支持）
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(() => console.log('Service Worker 注册成功'))
        .catch(err => console.log('Service Worker 注册失败:', err));
}
