// POCD研究数据采集系统 V6.0 - 完整版
// 新增：分页导航、备注功能、数据验证、导出功能

const app = {
    currentView: 'tasks',
    currentPatient: null,
    currentPhase: 'basic_info',
    loading: false,

    // V6.0 新增属性
    pageManager: null,
    notesAPI: null,
    validator: null,
    exporter: null,
    formData: {},

    async init() {
        try {
            this.showLoading();

            // 初始化数据库
            const success = await db.initialize();
            if (!success) {
                this.hideLoading();
                alert('数据库初始化失败，请刷新页面重试');
                return;
            }

            // V6.0: 初始化新模块
            this.initializeV6Modules();

            this.hideLoading();
            await this.render();
        } catch (error) {
            console.error('初始化失败:', error);
            this.hideLoading();
            alert('系统初始化失败: ' + error.message);
        }
    },

    // V6.0: 初始化新模块
    initializeV6Modules() {
        // 初始化分页管理器
        this.pageManager = new FormPageManager(FIELD_DEFINITIONS, FIELD_PAGES);

        // 初始化备注API
        this.notesAPI = new NotesAPI(db.supabase);

        // 初始化验证器
        this.validator = new DataValidator();

        // 初始化导出器
        this.exporter = new DataExporter();
        this.exporter.setFieldDefinitions(FIELD_DEFINITIONS);

        console.log('✓ V6.0模块初始化完成');
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

    // 渲染任务视图（保持原有逻辑）
    async renderTasksView() {
        const tasks = await db.getTodayTasks();
        const today = new Date().toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'short'
        });

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
            : '<div class="empty-state"><p>今日暂无已完成任务</p></div>';

        return `
            <div class="container">
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 style="margin: 0; border: none; padding: 0;">今日任务</h2>
                        <button class="btn-secondary" onclick="app.showAllPatients()">查看全部患者</button>
                    </div>
                    <p style="color: #5C635D; font-size: 14px; margin-bottom: 20px;">${today}</p>

                    <div class="eyebrow" style="background: #FFE5E5; color: #D32F2F;">紧急 · ${tasks.urgent.length}</div>
                    ${urgentHtml}

                    <div class="eyebrow" style="margin-top: 20px; background: #FFF4E5; color: #F57C00;">即将到期 · ${tasks.upcoming.length}</div>
                    ${upcomingHtml}

                    <div class="eyebrow" style="margin-top: 20px; background: #E8F5E9; color: #388E3C;">今日已完成 · ${tasks.completed.length}</div>
                    ${completedHtml}
                </div>
            </div>
        `;
    },

    // 跳转到患者详情
    async goToPatient(patientId, phase = null) {
        this.currentPatient = patientId;
        this.currentPhase = phase || 'basic_info';
        this.currentView = 'patient-detail';

        // V6.0: 加载患者数据到分页管理器
        const patient = await db.getPatient(patientId);
        if (patient) {
            this.formData = patient;
            this.pageManager.setFormData(patient);
            this.pageManager.setPhase(this.currentPhase);
        }

        await this.render();
    },

    // 渲染患者详情（V6.0增强版）
    async renderPatientDetail() {
        const patient = await db.getPatient(this.currentPatient);
        if (!patient) {
            return '<div class="container"><div class="empty-state"><p>患者不存在</p></div></div>';
        }

        this.formData = patient;
        this.pageManager.setFormData(patient);
        this.pageManager.setPhase(this.currentPhase);

        // V6.0: 渲染带分页的表单
        return this.renderPatientFormWithPagination(patient);
    },

    // V6.0: 渲染带分页的患者表单
    async renderPatientFormWithPagination(patient) {
        const phaseConfig = this.getPhaseConfig(this.currentPhase);

        // 获取当前页面字段
        const currentPageFields = this.pageManager.getCurrentPageFields();

        // 获取所有页面状态（用于进度指示器）
        const pagesStatus = this.pageManager.getAllPagesStatus();

        // 渲染进度指示器
        const progressHtml = this.renderProgressIndicator(pagesStatus);

        // 渲染字段
        const fieldsHtml = this.renderFields(currentPageFields);

        // 渲染备注区域
        const notesHtml = await this.renderNotesSection(patient.id, this.currentPhase);

        // 渲染分页导航按钮
        const paginationHtml = this.renderPaginationButtons();

        // 渲染验证错误提示
        const validationHtml = this.renderValidationErrors();

        return `
            <div class="container">
                <!-- 返回按钮 -->
                <button class="btn-secondary" onclick="app.goBack()" style="margin-bottom: 16px;">
                    ← 返回
                </button>

                <div class="card">
                    <!-- 患者信息头部 -->
                    <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #E7E1D7;">
                        <h2 style="margin: 0 0 8px 0; border: none; padding: 0;">${patient.study_id}</h2>
                        <p style="color: #5C635D; font-size: 14px; margin: 0;">
                            ${patient.name || ''} | ${patient.ward || ''} ${patient.bed_no || ''}
                        </p>
                    </div>

                    <!-- 阶段导航 -->
                    ${this.renderPhaseNav(patient)}

                    <!-- V6.0: 进度指示器 -->
                    ${progressHtml}

                    <!-- 当前阶段标题 -->
                    <h3 style="font-size: 16px; font-weight: 500; color: #C4612F; margin: 20px 0 16px 0;">
                        ${phaseConfig.name}
                    </h3>

                    <!-- V6.0: 验证错误提示 -->
                    ${validationHtml}

                    <!-- 表单字段 -->
                    <form id="patient-form" onsubmit="app.savePatientData(event)">
                        ${fieldsHtml}

                        <!-- V6.0: 备注区域 -->
                        ${notesHtml}

                        <!-- V6.0: 分页导航 -->
                        ${paginationHtml}

                        <!-- 保存按钮 -->
                        <div style="display: flex; gap: 12px; margin-top: 24px;">
                            <button type="button" class="btn-secondary" onclick="app.saveDraft()">
                                保存草稿
                            </button>
                            <button type="submit" class="btn-primary" style="flex: 1;">
                                ${this.currentPhase === 'basic_info' ? '保存基本信息' : '提交本阶段数据'}
                            </button>
                        </div>
                    </form>

                    <!-- V6.0: 导出按钮 -->
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #E7E1D7;">
                        <button class="btn-secondary" onclick="app.exportPatientData()" style="width: 100%;">
                            📥 导出患者数据
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // V6.0: 渲染进度指示器
    renderProgressIndicator(pagesStatus) {
        if (pagesStatus.length <= 1) {
            return ''; // 只有1页，不显示进度
        }

        const progress = this.pageManager.getProgress();

        const dotsHtml = pagesStatus.map((page, index) => {
            const dotClass = page.completed ? 'progress-dot-completed' :
                           page.isCurrent ? 'progress-dot-current' :
                           'progress-dot-pending';
            return `
                <div class="progress-dot-container" onclick="app.goToPage(${index})" title="${page.title}">
                    <div class="progress-dot ${dotClass}"></div>
                    <span class="progress-dot-label">${page.title}</span>
                </div>
            `;
        }).join('');

        return `
            <div class="progress-indicator">
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width: ${progress}%"></div>
                </div>
                <div class="progress-dots">
                    ${dotsHtml}
                </div>
                <p class="progress-text">
                    第 ${this.pageManager.currentPageIndex + 1} 页 / 共 ${pagesStatus.length} 页 (${progress}%)
                </p>
            </div>
        `;
    },

    // V6.0: 渲染字段（考虑依赖关系）
    renderFields(fields) {
        return fields.map(field => {
            // 检查字段是否应该显示
            if (!this.pageManager.shouldShowField(field)) {
                return ''; // 隐藏字段
            }

            return this.renderField(field);
        }).join('');
    },

    // 渲染单个字段
    renderField(field) {
        const value = this.formData[field.name] || '';
        const required = field.required ? 'required' : '';
        const readonly = field.readonly ? 'readonly' : '';
        const hint = field.hint ? `<span style="color: #999; font-size: 12px;">${field.hint}</span>` : '';

        let inputHtml = '';

        if (field.type === 'text' || field.type === 'number' || field.type === 'date') {
            const inputMode = field.type === 'number' ? 'inputmode="numeric"' : '';
            const step = field.step ? `step="${field.step}"` : '';
            const min = field.min !== undefined ? `min="${field.min}"` : '';
            const max = field.max !== undefined ? `max="${field.max}"` : '';

            inputHtml = `
                <input
                    type="${field.type}"
                    name="${field.name}"
                    value="${value}"
                    ${inputMode}
                    ${step}
                    ${min}
                    ${max}
                    ${required}
                    ${readonly}
                    onchange="app.onFieldChange('${field.name}', this.value)"
                    style="width: 100%; padding: 10px; border: 1px solid #E7E1D7; border-radius: 6px; font-size: 14px;"
                >
            `;
        } else if (field.type === 'select') {
            const options = field.options.map(opt =>
                `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`
            ).join('');

            inputHtml = `
                <select
                    name="${field.name}"
                    ${required}
                    ${readonly}
                    onchange="app.onFieldChange('${field.name}', this.value)"
                    style="width: 100%; padding: 10px; border: 1px solid #E7E1D7; border-radius: 6px; font-size: 14px;"
                >
                    <option value="">请选择</option>
                    ${options}
                </select>
            `;
        } else if (field.type === 'textarea') {
            inputHtml = `
                <textarea
                    name="${field.name}"
                    ${required}
                    ${readonly}
                    onchange="app.onFieldChange('${field.name}', this.value)"
                    style="width: 100%; padding: 10px; border: 1px solid #E7E1D7; border-radius: 6px; font-size: 14px; min-height: 80px;"
                >${value}</textarea>
            `;
        }

        return `
            <div class="form-field" style="margin-bottom: 16px;" id="field-${field.name}">
                <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px; color: #1F2421;">
                    ${field.label}
                    ${field.required ? '<span style="color: #C4612F;">*</span>' : ''}
                    ${hint}
                </label>
                ${inputHtml}
            </div>
        `;
    },

    // V6.0: 字段值变化时触发
    onFieldChange(fieldName, value) {
        // 更新表单数据
        this.formData[fieldName] = value;
        this.pageManager.updateFormData(fieldName, value);

        // 自动计算字段
        this.pageManager.autoCalculateFields();

        // 更新计算字段的显示
        this.updateComputedFields();

        // 实时验证
        this.validateAndShowErrors();
    },

    // V6.0: 更新计算字段的显示
    updateComputedFields() {
        Object.values(FIELD_DEFINITIONS).forEach(group => {
            group.forEach(field => {
                if (field.computed && field.formula) {
                    const computedValue = this.pageManager.computeFieldValue(field.formula);
                    const input = document.querySelector(`input[name="${field.name}"]`);
                    if (input && !isNaN(computedValue)) {
                        input.value = computedValue;
                        this.formData[field.name] = computedValue;
                    }
                }
            });
        });
    },

    // V6.0: 验证并显示错误
    validateAndShowErrors() {
        const errors = this.pageManager.validateCurrentPage();

        // 清除之前的错误提示
        document.querySelectorAll('.field-error').forEach(el => el.remove());
        document.querySelectorAll('.form-field').forEach(el => el.classList.remove('has-error'));

        // 显示错误
        errors.forEach(error => {
            const fieldElement = document.getElementById(`field-${error.field}`);
            if (fieldElement) {
                fieldElement.classList.add('has-error');
                const errorDiv = document.createElement('div');
                errorDiv.className = 'field-error';
                errorDiv.textContent = error.message;
                fieldElement.appendChild(errorDiv);
            }
        });

        // 更新验证错误提示区域
        const validationContainer = document.getElementById('validation-errors');
        if (validationContainer) {
            validationContainer.innerHTML = this.renderValidationErrors();
        }
    },

    // V6.0: 渲染验证错误提示
    renderValidationErrors() {
        const errors = this.validator.validateErrors(this.formData);
        const warnings = this.validator.validateWarnings(this.formData);

        if (errors.length === 0 && warnings.length === 0) {
            return '';
        }

        const errorsHtml = errors.map(err => `
            <div class="alert alert-error">
                <strong>错误:</strong> ${err.message}
            </div>
        `).join('');

        const warningsHtml = warnings.map(warn => `
            <div class="alert alert-warning">
                <strong>警告:</strong> ${warn.message}
            </div>
        `).join('');

        return `
            <div id="validation-errors" style="margin-bottom: 20px;">
                ${errorsHtml}
                ${warningsHtml}
            </div>
        `;
    },

    // V6.0: 渲染备注区域
    async renderNotesSection(patientId, phase) {
        try {
            const note = await this.notesAPI.getNote(patientId, phase);
            const noteContent = note ? note.content : '';
            const noteInfo = note ? `
                <p style="font-size: 12px; color: #999; margin-top: 4px;">
                    最后更新: ${new Date(note.updated_at).toLocaleString('zh-CN')}
                    by ${note.users?.email || '未知'}
                </p>
            ` : '';

            return `
                <div class="notes-section" style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #E7E1D7;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <label style="font-size: 14px; font-weight: 500; color: #1F2421;">
                            📝 备注 <span style="color: #999; font-weight: 400;">(最多500字)</span>
                        </label>
                        <button type="button" class="btn-text" onclick="app.showNoteHistory('${patientId}', '${phase}')">
                            查看历史
                        </button>
                    </div>
                    <textarea
                        id="note-content"
                        maxlength="500"
                        placeholder="在此输入备注信息，例如：患者特殊情况、注意事项等..."
                        style="width: 100%; padding: 10px; border: 1px solid #E7E1D7; border-radius: 6px; font-size: 14px; min-height: 100px;"
                    >${noteContent}</textarea>
                    ${noteInfo}
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                        <span id="note-char-count" style="font-size: 12px; color: #999;">
                            ${noteContent.length}/500
                        </span>
                        <button type="button" class="btn-secondary" onclick="app.saveNote('${patientId}', '${phase}')">
                            保存备注
                        </button>
                    </div>
                </div>

                <script>
                    document.getElementById('note-content').addEventListener('input', function() {
                        document.getElementById('note-char-count').textContent = this.value.length + '/500';
                    });
                </script>
            `;
        } catch (error) {
            console.error('渲染备注区域失败:', error);
            return '';
        }
    },

    // V6.0: 渲染分页导航按钮
    renderPaginationButtons() {
        const totalPages = this.pageManager.getTotalPages();
        const currentPage = this.pageManager.currentPageIndex;

        if (totalPages <= 1) {
            return ''; // 只有1页，不显示分页按钮
        }

        const prevDisabled = currentPage === 0 ? 'disabled' : '';
        const nextDisabled = currentPage === totalPages - 1 ? 'disabled' : '';

        return `
            <div class="pagination-buttons" style="display: flex; gap: 12px; margin-top: 24px;">
                <button type="button" class="btn-secondary" onclick="app.previousPage()" ${prevDisabled}>
                    ← 上一页
                </button>
                <button type="button" class="btn-secondary" onclick="app.nextPage()" ${nextDisabled} style="flex: 1;">
                    下一页 →
                </button>
            </div>
        `;
    },

    // V6.0: 下一页
    async nextPage() {
        // 验证当前页
        const errors = this.pageManager.validateCurrentPage();
        if (errors.some(e => e.type !== 'warning')) {
            alert('请修正当前页面的错误后再继续');
            return;
        }

        if (this.pageManager.nextPage()) {
            await this.render();
        }
    },

    // V6.0: 上一页
    async previousPage() {
        if (this.pageManager.previousPage()) {
            await this.render();
        }
    },

    // V6.0: 跳转到指定页
    async goToPage(pageIndex) {
        if (this.pageManager.goToPage(pageIndex)) {
            await this.render();
        }
    },

    // V6.0: 保存备注
    async saveNote(patientId, phase) {
    const noteContent = document.getElementById('note-content').value.trim();

    if (!noteContent) {
        alert('备注内容不能为空');
        return;
    }

    // 验证备注
    const validation = this.notesAPI.validateNote(noteContent);
    if (!validation.valid) {
        alert(validation.errors.join('\n'));
        return;
    }

    try {
        const user = await db.getCurrentUser();
        await this.notesAPI.saveNote(patientId, phase, noteContent, user.id);
        alert('备注保存成功！');
    } catch (error) {
        console.error('保存备注失败:', error);
        alert('保存备注失败: ' + error.message);
    }
},

// V6.0: 显示备注历史
async showNoteHistory(patientId, phase) {
    try {
        const history = await this.notesAPI.getNoteHistory(patientId, phase);
        const formatted = this.notesAPI.formatHistory(history);

        if (formatted.length === 0) {
            alert('暂无历史记录');
            return;
        }

        const historyHtml = formatted.map(record => `
            <div style="padding: 12px; border-bottom: 1px solid #E7E1D7;">
                <div style="font-size: 12px; color: #999; margin-bottom: 4px;">
                    ${record.timestamp} - ${record.userEmail} ${record.actionText}
                </div>
                <div style="font-size: 14px; color: #1F2421;">
                    ${record.content}
                </div>
            </div>
        `).join('');

        // 显示模态框
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>备注历史</h3>
                    <button onclick="this.closest('.modal').remove()" class="modal-close">×</button>
                </div>
                <div class="modal-body" style="max-height: 400px; overflow-y: auto;">
                    ${historyHtml}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    } catch (error) {
        console.error('获取备注历史失败:', error);
        alert('获取备注历史失败');
    }
},

// V6.0: 导出患者数据
async exportPatientData() {
    const patient = await db.getPatient(this.currentPatient);
    if (!patient) {
        alert('患者数据不存在');
        return;
    }

    const patientName = patient.study_id;
    this.exporter.exportSinglePatient(patient, patientName);
},

// V6.0: 导出所有患者数据（从全部患者页面调用）
async exportAllPatientsData() {
    const patients = await db.getAllPatients();
    if (patients.length === 0) {
        alert('暂无患者数据');
        return;
    }

    this.exporter.exportAllPatients(patients);
},

// V6.0: 导出统计报告
async exportStatisticsReport() {
    const patients = await db.getAllPatients();
    if (patients.length === 0) {
        alert('暂无患者数据');
        return;
    }

    this.exporter.exportStatisticsReport(patients);
},

// 保存患者数据
async savePatientData(event) {
    event.preventDefault();

    // 收集表单数据
    const formData = new FormData(event.target);
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }

    // 合并到现有数据
    Object.assign(this.formData, data);

    // V6.0: 验证数据
    const errors = this.validator.validateErrors(this.formData);
    if (errors.length > 0) {
        const errorMessages = errors.map(e => `${e.field}: ${e.message}`).join('\n');
        alert('数据验证失败:\n' + errorMessages);
        return;
    }

    // 保存到数据库
    try {
        await db.updatePatient(this.currentPatient, this.formData);
        alert('保存成功！');

        // 如果是最后一页，返回任务列表
        if (this.pageManager.currentPageIndex === this.pageManager.getTotalPages() - 1) {
            this.goBack();
        }
    } catch (error) {
        console.error('保存失败:', error);
        alert('保存失败: ' + error.message);
    }
},

// 保存草稿
async saveDraft() {
    // 收集当前表单数据
    const form = document.getElementById('patient-form');
    if (form) {
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        Object.assign(this.formData, data);
    }

    // 保存到 IndexedDB（草稿）
    try {
        await db.saveDraft(this.currentPatient, this.formData);
        alert('草稿保存成功！');
    } catch (error) {
        console.error('保存草稿失败:', error);
        alert('保存草稿失败');
    }
},

// 渲染阶段导航
renderPhaseNav(patient) {
    const phases = [
        { key: 'basic_info', name: '基本信息' },
        { key: 'T0', name: 'T0 基线' },
        { key: 'POD1', name: 'POD1' },
        { key: 'POD3', name: 'POD3' },
        { key: 'POD7', name: 'POD7' }
    ];

    const navItems = phases.map(phase => {
        const isActive = this.currentPhase === phase.key;
        const activeClass = isActive ? 'phase-nav-active' : '';
        return `
            <button
                class="phase-nav-btn ${activeClass}"
                onclick="app.switchPhase('${phase.key}')"
            >
                ${phase.name}
            </button>
        `;
    }).join('');

    return `
        <div class="phase-nav" style="display: flex; gap: 8px; margin-bottom: 20px; overflow-x: auto;">
            ${navItems}
        </div>
    `;
},

// 切换阶段
async switchPhase(phase) {
    // 保存当前数据
    await this.saveDraft();

    this.currentPhase = phase;
    this.pageManager.setPhase(phase);

    await this.render();
},

// 获取阶段配置
getPhaseConfig(phase) {
    const configs = {
        'basic_info': { name: '患者基本信息', color: '#C4612F' },
        'T0': { name: 'T0 术前基线评估', color: '#6B8E6F' },
        'POD1': { name: 'POD1 术后第1天', color: '#E9A854' },
        'POD3': { name: 'POD3 术后第3天', color: '#5B9BD5' },
        'POD7': { name: 'POD7 术后第7天', color: '#8E6BB0' }
    };
    return configs[phase] || configs['basic_info'];
},

// 显示所有患者
async showAllPatients() {
    this.currentView = 'all-patients';
    await this.render();
},

// 渲染所有患者列表
async renderAllPatients() {
    const patients = await db.getAllPatients();

    if (patients.length === 0) {
        return `
            <div class="container">
                <button class="btn-secondary" onclick="app.goBack()" style="margin-bottom: 16px;">
                    ← 返回
                </button>
                <div class="empty-state">
                    <p>暂无患者数据</p>
                </div>
            </div>
        `;
    }

    const patientsHtml = patients.map(patient => {
        const lastUpdate = patient.updated_at ?
            new Date(patient.updated_at).toLocaleDateString('zh-CN') : '未知';

        return `
            <div class="task-item" onclick="app.goToPatient('${patient.id}')">
                <div class="task-icon">👤</div>
                <div class="task-content">
                    <h3>${patient.study_id} ${patient.name ? '- ' + patient.name : ''}</h3>
                    <p>${patient.ward || ''} ${patient.bed_no || ''} | 最后更新: ${lastUpdate}</p>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="container">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <button class="btn-secondary" onclick="app.goBack()">
                    ← 返回
                </button>
                <button class="btn-secondary" onclick="app.exportAllPatientsData()">
                    📥 导出全部
                </button>
            </div>

            <div class="card">
                <h2>全部患者 (${patients.length})</h2>
                ${patientsHtml}

                <!-- V6.0: 统计报告按钮 -->
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #E7E1D7;">
                    <button class="btn-secondary" onclick="app.exportStatisticsReport()" style="width: 100%;">
                        📊 导出统计报告
                    </button>
                </div>
            </div>
        </div>
    `;
},

// 显示新患者表单
showNewPatient() {
    this.currentView = 'new-patient';
    this.currentPhase = 'basic_info';
    this.formData = {};
    this.render();
},

// 渲染新患者表单
async renderNewPatientForm() {
    const basicInfoFields = FIELD_DEFINITIONS.basic_info;

    const fieldsHtml = basicInfoFields.map(field => this.renderField(field)).join('');

    return `
        <div class="container">
            <button class="btn-secondary" onclick="app.goBack()" style="margin-bottom: 16px;">
                ← 返回
            </button>

            <div class="card">
                <h2>新增患者</h2>

                <form onsubmit="app.createNewPatient(event)">
                    ${fieldsHtml}

                    <button type="submit" class="btn-primary" style="width: 100%; margin-top: 20px;">
                        创建患者
                    </button>
                </form>
            </div>
        </div>
    `;
},

// 创建新患者
async createNewPatient(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }

    // 验证必填字段
    if (!data.study_id || !data.enrollment_date) {
        alert('请填写研究编号和入组日期');
        return;
    }

    try {
        const patientId = await db.createPatient(data);
        alert('患者创建成功！');
        this.goToPatient(patientId, 'basic_info');
    } catch (error) {
        console.error('创建患者失败:', error);
        alert('创建患者失败: ' + error.message);
    }
},

// 返回
    goBack() {
        this.currentView = 'tasks';
        this.currentPatient = null;
        this.currentPhase = 'basic_info';
        this.render();
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
