// POCD研究数据采集系统 V2.1 - 完整字段版
// 包含所有量表分项、扩展基础疾病、临床必需信息

const app = {
    currentView: 'tasks',  // 'tasks' | 'patient-detail' | 'all-patients' | 'new-patient'
    currentPatient: null,
    currentPhase: 'basic_info',  // 'basic_info' | 'T0' | 'POD1' | 'POD3' | 'POD7' | 'POD14' | 'POD30'
    loading: false,

    async init() {
        this.showLoading();

        // 初始化数据库
        const success = await db.initialize();
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
        } else if (this.currentView === 'new-patient') {
            container.innerHTML = await this.renderNewPatientForm();
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
                        <p>${task.patient.ward || ''} ${task.patient.bed_no || ''} | ${task.phaseName} ${task.daysOverdue > 0 ? `<span class="badge-urgent status-badge">延迟${task.daysOverdue}天</span>` : `<span class="badge-urgent status-badge">今日到期</span>`}</p>
                    </div>
                </div>
            `).join('')
            : '<div class="empty-state"><p>暂无紧急任务 ✨</p></div>';

        // 即将到期
        const upcomingHtml = tasks.upcoming.length > 0
            ? tasks.upcoming.map(task => `
                <div class="task-item task-upcoming" onclick="app.goToPatient('${task.patient.id}', '${task.phase}')">
                    <div class="task-icon">🟡</div>
                    <div class="task-content">
                        <h3>${task.patient.study_id} ${task.patient.name ? '- ' + task.patient.name : ''}</h3>
                        <p>${task.patient.ward || ''} ${task.patient.bed_no || ''} | ${task.phaseName} <span class="badge-upcoming status-badge">${task.daysRemaining}天后到期</span></p>
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

            // 检查各阶段是否完成（检查关键字段是否有值）
            const phaseChecks = [
                { phase: 'T0', field: 't0_mmse_total' },
                { phase: 'POD1', field: 'pod1_cam_delirium' },
                { phase: 'POD3', field: 'pod3_mmse' },
                { phase: 'POD7', field: 'pod7_mmse' },
                { phase: 'POD14', field: 'pod14_mmse_short' },
                { phase: 'POD30', field: 'pod30_mmse' }
            ];

            const completed = phaseChecks.filter(check => allData[check.field] !== null && allData[check.field] !== undefined).length;
            const progress = `${completed}/${phaseChecks.length}`;

            return `
                <div class="task-item" onclick="app.goToPatient('${p.id}')">
                    <div class="task-content">
                        <h3>${p.study_id} ${p.name ? '- ' + p.name : ''}</h3>
                        <p>入组：${p.enrollment_date || '未设置'} | 手术：${p.surgery_date || '未设置'} | 进度：${progress}</p>
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

    async renderNewPatientForm() {
        // 自动生成研究编号
        const patients = await db.getAllPatients();
        const maxNumber = patients.reduce((max, p) => {
            const match = p.study_id.match(/POCD-(\d+)/);
            return match ? Math.max(max, parseInt(match[1])) : max;
        }, 0);
        const nextStudyId = `POCD-${String(maxNumber + 1).padStart(4, '0')}`;

        return `
            <div class="container">
                <div class="card">
                    <h2>添加新患者</h2>
                    <div class="form-group">
                        <label>研究编号 <span class="required">*</span></label>
                        <input type="text" id="new_study_id" value="${nextStudyId}" readonly style="background-color: #f5f5f5;">
                        <p class="form-hint">自动生成</p>
                    </div>
                    <div class="form-group">
                        <label>患者姓名</label>
                        <input type="text" id="new_name" placeholder="仅床旁核对用">
                        <p class="form-hint">提交数据前会删除</p>
                    </div>
                    <div class="form-group">
                        <label>病案号 <span class="required">*</span></label>
                        <input type="text" id="new_medical_record_no" placeholder="住院号">
                    </div>
                    <div class="form-group">
                        <label>病区 <span class="required">*</span></label>
                        <input type="text" id="new_ward" placeholder="如外科11病区">
                    </div>
                    <div class="form-group">
                        <label>床号 <span class="required">*</span></label>
                        <input type="text" id="new_bed_no" placeholder="如12床">
                    </div>
                    <div class="form-group">
                        <label>联系电话</label>
                        <input type="tel" id="new_phone" placeholder="随访用">
                    </div>
                    <div class="form-group">
                        <label>入组日期 <span class="required">*</span></label>
                        <input type="date" id="new_enroll_date" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label>手术日期 <span class="required">*</span></label>
                        <input type="date" id="new_surgery_date">
                        <p class="form-hint">决定POD节点截止日期</p>
                    </div>
                    <div class="form-group">
                        <label>是否有标准L3层面CT</label>
                        <select id="new_has_l3_ct">
                            <option value="">请选择</option>
                            <option value="是">是</option>
                            <option value="否">否</option>
                        </select>
                        <p class="form-hint">决定Paper3完整分析</p>
                    </div>
                </div>

                <div class="bottom-bar">
                    <button class="btn btn-secondary" onclick="app.backToTasks()">取消</button>
                    <button class="btn btn-primary" onclick="app.submitNewPatient()">创建患者</button>
                </div>
            </div>
        `;
    },

    async renderPatientDetail() {
        // 检查 currentPatient 是否存在
        if (!this.currentPatient) {
            console.error('renderPatientDetail: currentPatient 为 null');
            return `
                <div class="container">
                    <div class="empty-state">
                        <h3>患者数据加载失败</h3>
                        <p>请返回主页重试</p>
                        <button class="btn btn-primary" onclick="app.backToTasks()">返回主页</button>
                    </div>
                </div>
            `;
        }

        const patient = this.currentPatient;
        const allData = await db.getAllPatientData(patient.id);

        const phases = [
            { id: 'basic_info', name: '基本信息', icon: '👤', checkField: 'study_id' },
            { id: 'T0', name: 'T0 术前基线', icon: '📋', checkField: 't0_mmse_total' },
            { id: 'POD1', name: 'POD1 术后第1天', icon: '🏥', checkField: 'pod1_cam_delirium' },
            { id: 'POD3', name: 'POD3 术后第3天', icon: '📈', checkField: 'pod3_mmse' },
            { id: 'POD7', name: 'POD7 术后第7天', icon: '✅', checkField: 'pod7_mmse' },
            { id: 'POD14', name: 'POD14 术后第14天', icon: '🔄', checkField: 'pod14_mmse_short' },
            { id: 'POD30', name: 'POD30 术后第30天', icon: '🎯', checkField: 'pod30_mmse' }
        ];

        const phaseNav = phases.map(p => {
            const active = p.id === this.currentPhase ? 'active' : '';
            const completed = allData[p.checkField] ? '✓' : '';
            return `<button class="phase-btn ${active}" onclick="app.switchPhase('${p.id}')">${p.icon} ${p.name} ${completed}</button>`;
        }).join('');

        return `
            <div class="phase-nav">${phaseNav}</div>
            <div class="container">
                <div class="card">
                    <span class="eyebrow">Patient</span>
                    <h2>${patient.study_id}</h2>
                    <p><strong>姓名：</strong>${patient.name || '未填写'}</p>
                    <p><strong>病案号：</strong>${patient.medical_record_no || '未填写'}</p>
                    <p><strong>病区：</strong>${patient.ward || '未填写'}</p>
                    <p><strong>床号：</strong>${patient.bed_no || '未填写'}</p>
                    <p><strong>联系电话：</strong>${patient.phone || '未填写'}</p>
                    <p><strong>入组日期：</strong>${patient.enrollment_date || '未设置'}</p>
                    <p><strong>手术日期：</strong>${patient.surgery_date || '未设置'}</p>
                    <button class="btn btn-danger" onclick="app.deletePatient('${patient.id}')" style="margin-top: 1rem;">删除患者</button>
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

        let data = {};
        if (this.currentPhase === 'basic_info') {
            data = this.currentPatient;
        } else {
            // getPatientData 返回宽表患者对象，直接用（不是 {data:...} 结构）
            const phaseData = await db.getPatientData(this.currentPatient.id, this.currentPhase);
            data = phaseData || {};
        }

        const html = fields.map(field => {
            const value = data[field.name] || '';

            if (field.type === 'select') {
                const options = field.options.map(opt =>
                    `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`
                ).join('');

                return `
                    <div class="form-group">
                        <label>${field.label} ${field.required ? '<span class="required">*</span>' : ''}</label>
                        <select id="${field.name}" onchange="app.handleFieldChange('${field.name}')">
                            <option value="">请选择</option>
                            ${options}
                        </select>
                        ${field.hint ? `<p class="form-hint">${field.hint}</p>` : ''}
                    </div>
                `;
            } else if (field.type === 'number') {
                const isReadonly = field.readonly ? 'readonly style="background-color: #f5f5f5; cursor: not-allowed;"' : '';
                return `
                    <div class="form-group">
                        <label>${field.label} ${field.required ? '<span class="required">*</span>' : ''}</label>
                        <input type="number" id="${field.name}" value="${value}"
                               ${field.min !== undefined ? `min="${field.min}"` : ''}
                               ${field.max !== undefined ? `max="${field.max}"` : ''}
                               ${field.step ? `step="${field.step}"` : ''}
                               ${isReadonly}
                               onchange="app.handleFieldChange('${field.name}')">
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
            } else if (field.type === 'tel') {
                return `
                    <div class="form-group">
                        <label>${field.label} ${field.required ? '<span class="required">*</span>' : ''}</label>
                        <input type="tel" id="${field.name}" value="${value}">
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

        // 渲染完成后，设置监听器
        setTimeout(() => this.setupAutoCalculate(), 0);

        return html;
    },

    handleFieldChange(fieldName) {
        // 当字段改变时触发自动计算
        this.autoCalculateScores();
    },

    setupAutoCalculate() {
        // 为所有分项字段添加change事件监听
        const fields = this.getFieldsForPhase(this.currentPhase);
        fields.forEach(field => {
            const element = document.getElementById(field.name);
            if (element && !field.readonly) {
                element.addEventListener('change', () => this.autoCalculateScores());
            }
        });

        // 初始计算一次
        this.autoCalculateScores();
    },

    autoCalculateScores() {
        // T0 MMSE自动计算（字段名带 t0_ 前缀，对齐 fields-complete-v3.js）
        const mmseFields = [
            't0_mmse_time_orientation',
            't0_mmse_place_orientation',
            't0_mmse_immediate_memory',
            't0_mmse_attention_calculation',
            't0_mmse_delayed_recall',
            't0_mmse_naming',
            't0_mmse_repetition',
            't0_mmse_comprehension',
            't0_mmse_reading',
            't0_mmse_writing',
            't0_mmse_structure'
        ];
        const mmseTotal = this.calculateSum(mmseFields);
        const mmseTotalElement = document.getElementById('t0_mmse_total');
        if (mmseTotalElement) {
            mmseTotalElement.value = mmseTotal;
        }

        // T0 MoCA自动计算（字段名带 t0_ 前缀）
        const mocaFields = [
            't0_moca_visuospatial',
            't0_moca_naming',
            't0_moca_attention',
            't0_moca_language',
            't0_moca_abstraction',
            't0_moca_delayed_recall',
            't0_moca_orientation'
        ];
        let mocaTotal = this.calculateSum(mocaFields);

        // 教育校正：教育年限≤12年 +1分
        const educationYears = document.getElementById('education_years');
        if (educationYears && parseInt(educationYears.value) <= 12 && mocaTotal > 0) {
            mocaTotal = Math.min(mocaTotal + 1, 30);
        }

        const mocaTotalElement = document.getElementById('t0_moca_total');
        if (mocaTotalElement) {
            mocaTotalElement.value = mocaTotal;
        }

        // T0 PSQI自动计算（字段名带 t0_psqi_ 前缀）
        const psqiFields = [
            't0_psqi_subjective_quality',
            't0_psqi_sleep_latency',
            't0_psqi_sleep_duration',
            't0_psqi_sleep_efficiency',
            't0_psqi_sleep_disturbance',
            't0_psqi_sleep_medication',
            't0_psqi_daytime_dysfunction'
        ];
        const psqiTotal = this.calculateSum(psqiFields);
        const psqiTotalElement = document.getElementById('t0_psqi_total');
        if (psqiTotalElement) {
            psqiTotalElement.value = psqiTotal;
        }
    },

    calculateSum(fieldNames) {
        let sum = 0;
        let hasValue = false;

        fieldNames.forEach(name => {
            const element = document.getElementById(name);
            if (element && element.value !== '') {
                sum += parseInt(element.value) || 0;
                hasValue = true;
            }
        });

        return hasValue ? sum : '';
    },

    getFieldsForPhase(phase) {
        return FIELD_DEFINITIONS[phase] || [];
    },

    // ========== 交互操作 ==========

    showNewPatient() {
        this.currentView = 'new-patient';
        this.render();
    },

    async submitNewPatient() {
        // 读取表单中所有字段
        const studyId = document.getElementById('new_study_id')?.value || '';
        const name = document.getElementById('new_name')?.value || '';
        const medicalRecordNo = document.getElementById('new_medical_record_no')?.value || '';
        const ward = document.getElementById('new_ward')?.value || '';
        const bedNo = document.getElementById('new_bed_no')?.value || '';
        const phone = document.getElementById('new_phone')?.value || '';
        const enrollDate = document.getElementById('new_enroll_date')?.value || '';
        const surgeryDate = document.getElementById('new_surgery_date')?.value || '';

        // 验证必填项
        if (!studyId || !medicalRecordNo || !ward || !bedNo || !enrollDate || !surgeryDate) {
            alert('请填写所有必填项：研究编号、病案号、病区、床号、入组日期、手术日期');
            return;
        }

        const patientData = {
            study_id: studyId,
            name: name,
            medical_record_no: medicalRecordNo,
            ward: ward,
            bed_no: bedNo,
            phone: phone,
            enrollment_date: enrollDate,
            surgery_date: surgeryDate
        };

        try {
            const patient = await db.createPatient(patientData);
            if (patient) {
                alert('患者创建成功！');
                await this.goToPatient(patient.id);
            }
        } catch (error) {
            console.error('创建患者失败:', error);
            alert('创建失败：' + error.message);
        }
    },

    async goToPatient(id, phase = 'basic_info') {
        try {
            this.currentPatient = await db.getPatient(id);
            if (!this.currentPatient) {
                throw new Error('患者数据不存在');
            }
            this.currentView = 'patient-detail';
            this.currentPhase = phase;
            await this.render();
        } catch (error) {
            console.error('加载患者失败:', error);
            alert('加载患者失败：' + error.message);
            this.backToTasks();
        }
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
                // 空字符串转为 null，避免数据库报错
                let value = element.value;
                // 数字类型的空值转为 null
                if (element.type === 'number' && value === '') {
                    value = null;
                } else if (value === '') {
                    value = null;
                }
                formData[field.name] = value;
            }
        });

        console.log('=== 保存阶段调试 ===');
        console.log('当前阶段:', this.currentPhase);
        console.log('字段定义数量:', fields.length);
        console.log('收集到的表单数据:', formData);
        console.log('患者ID:', this.currentPatient.id);

        if (this.currentPhase === 'basic_info') {
            // 更新患者基础信息 - 直接传整个 formData
            try {
                console.log('准备调用 db.updatePatient...');
                const updated = await db.updatePatient(this.currentPatient.id, formData);
                console.log('db.updatePatient 返回结果:', updated);

                if (updated) {
                    this.currentPatient = updated;
                    alert('基本信息保存成功！');
                    await this.render();
                } else {
                    alert('保存失败！请打开F12控制台查看错误信息');
                }
            } catch (error) {
                console.error('保存基本信息出错:', error);
                alert('保存失败：' + error.message);
            }
        } else {
            // 保存数据采集节点
            const completed = confirm('标记本阶段为已完成？');

            try {
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
            } catch (error) {
                console.error('保存数据失败:', error);
                alert('保存失败：' + (error.message || '未知错误') + '\n\n请打开F12控制台查看详细错误信息');
            }
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
    },

    async deletePatient(id) {
        if (!confirm('确定要删除这个患者吗？\n\n删除后将无法恢复，包括该患者的所有数据采集记录！')) {
            return;
        }

        try {
            await db.deletePatient(id);
            alert('患者已删除');

            // 清理状态
            db.clearCache();
            this.currentPatient = null;
            this.currentView = 'tasks';

            // 重新渲染
            await this.render();
        } catch (error) {
            console.error('删除患者失败:', error);
            alert('删除失败：' + error.message);
        }
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
