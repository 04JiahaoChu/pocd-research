// POCD研究数据采集系统 - 主应用逻辑
// 版本：V1.0 | 对齐Master CRF V1.0

const app = {
    currentView: 'list',
    currentPatient: null,
    currentPhase: 'T0',
    patients: [],

    init() {
        this.loadData();
        this.render();
    },

    loadData() {
        const saved = localStorage.getItem('pocd_patients');
        if (saved) {
            this.patients = JSON.parse(saved);
        }
    },

    saveData() {
        localStorage.setItem('pocd_patients', JSON.stringify(this.patients));
    },

    render() {
        const container = document.getElementById('app');

        if (this.currentView === 'list') {
            container.innerHTML = this.renderPatientList();
        } else if (this.currentView === 'form') {
            container.innerHTML = this.renderForm();
        }
    },

    renderPatientList() {
        if (this.patients.length === 0) {
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

        const list = this.patients.map(p => {
            const phases = ['T0', 'POD1', 'POD3', 'POD7', 'POD14', 'POD30'];
            const completed = phases.filter(phase => p.data[phase] && p.data[phase]._completed).length;
            const progress = `${completed}/${phases.length}`;

            return `
                <div class="patient-item" onclick="app.editPatient('${p.id}')">
                    <div class="patient-info">
                        <h3>${p.studyId} ${p.name ? '- ' + p.name : ''}</h3>
                        <p>入组：${p.enrollDate || '未设置'} | 进度：${progress}</p>
                    </div>
                    <button class="btn btn-secondary btn-small">录入</button>
                </div>
            `;
        }).join('');

        return `
            <div class="container">
                <div class="card">
                    <h2>患者列表 (${this.patients.length})</h2>
                    <ul class="patient-list">
                        ${list}
                    </ul>
                </div>

                <div class="card">
                    <h2>数据管理</h2>
                    <button class="btn btn-primary" onclick="app.exportToExcel()" style="width: 100%; margin-bottom: 8px;">
                        📊 导出Excel表格
                    </button>
                    <button class="btn btn-secondary" onclick="app.backupData()" style="width: 100%; margin-bottom: 8px;">
                        💾 备份数据到本地
                    </button>
                    <button class="btn btn-secondary" onclick="app.restoreData()" style="width: 100%;">
                        📥 从备份恢复
                    </button>
                </div>
            </div>
        `;
    },

    renderForm() {
        const patient = this.currentPatient;
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
            const completed = patient.data[p.id]?._completed ? '✓' : '';
            return `<button class="phase-btn ${active}" onclick="app.switchPhase('${p.id}')">${p.icon} ${p.name} ${completed}</button>`;
        }).join('');

        return `
            <div class="phase-nav">${phaseNav}</div>
            <div class="container">
                <div class="card">
                    <h2>患者信息</h2>
                    <p><strong>研究编号：</strong>${patient.studyId}</p>
                    <p><strong>姓名：</strong>${patient.name || '未填写'}</p>
                </div>

                <div class="card">
                    <h2>${phases.find(p => p.id === this.currentPhase).name}</h2>
                    ${this.renderPhaseFields()}
                </div>
            </div>

            <div class="bottom-bar">
                <button class="btn btn-secondary" onclick="app.backToList()">返回</button>
                <button class="btn btn-primary" onclick="app.savePhase()">保存</button>
            </div>
        `;
    },

    renderPhaseFields() {
        const fields = this.getFieldsForPhase(this.currentPhase);
        const data = this.currentPatient.data[this.currentPhase] || {};

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
        // 根据不同阶段返回对应字段（简化版，实际会更详细）
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

    showNewPatient() {
        const studyId = prompt('请输入研究编号（如 POCD2024-0001）：');
        if (!studyId) return;

        const name = prompt('患者姓名（可选，仅用于床旁核对）：');

        const patient = {
            id: Date.now().toString(),
            studyId: studyId,
            name: name || '',
            enrollDate: new Date().toISOString().split('T')[0],
            data: {}
        };

        this.patients.push(patient);
        this.saveData();
        this.editPatient(patient.id);
    },

    editPatient(id) {
        this.currentPatient = this.patients.find(p => p.id === id);
        this.currentView = 'form';
        this.currentPhase = 'T0';
        this.render();
    },

    switchPhase(phase) {
        this.currentPhase = phase;
        this.render();
    },

    savePhase() {
        const fields = this.getFieldsForPhase(this.currentPhase);
        const data = {};

        fields.forEach(field => {
            const element = document.getElementById(field.name);
            if (element) {
                data[field.name] = element.value;
            }
        });

        data._completed = confirm('标记本阶段为已完成？');

        if (!this.currentPatient.data[this.currentPhase]) {
            this.currentPatient.data[this.currentPhase] = {};
        }

        Object.assign(this.currentPatient.data[this.currentPhase], data);
        this.saveData();

        alert('保存成功！');
        this.render();
    },

    backToList() {
        this.currentView = 'list';
        this.currentPatient = null;
        this.render();
    },

    exportToExcel() {
        alert('Excel导出功能开发中...\n\n将在下一版本实现：\n1. 导出为符合V3格式的Excel\n2. 包含所有117列数据\n3. 自动填充校验规则\n\n当前可以使用"备份数据"功能保存JSON格式');
    },

    backupData() {
        const data = JSON.stringify(this.patients, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pocd_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        alert('备份文件已下载！');
    },

    restoreData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (confirm(`确定要恢复备份吗？\n将覆盖当前 ${this.patients.length} 条患者数据。`)) {
                        this.patients = data;
                        this.saveData();
                        this.render();
                        alert('数据恢复成功！');
                    }
                } catch (err) {
                    alert('文件格式错误！');
                }
            };
            reader.readAsText(file);
        };
        input.click();
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
