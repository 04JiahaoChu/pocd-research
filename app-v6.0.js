// POCD鐮旂┒鏁版嵁閲囬泦绯荤粺 V6.0 - 瀹屾暣鐗?// 鏂板锛氬垎椤靛鑸€佸娉ㄥ姛鑳姐€佹暟鎹獙璇併€佸鍑哄姛鑳?
const app = {
    currentView: 'tasks',
    currentPatient: null,
    currentPhase: 'basic_info',
    loading: false,

    // V6.0 鏂板灞炴€?    pageManager: null,
    notesAPI: null,
    validator: null,
    exporter: null,
    formData: {},

    async init() {
        this.showLoading();

        // 鍒濆鍖栨暟鎹簱
        const success = await db.initialize();
        if (!success) {
            this.hideLoading();
            return;
        }

        // V6.0: 鍒濆鍖栨柊妯″潡
        this.initializeV6Modules();

        this.hideLoading();
        await this.render();
    },

    // V6.0: 鍒濆鍖栨柊妯″潡
    initializeV6Modules() {
        // 鍒濆鍖栧垎椤电鐞嗗櫒
        this.pageManager = new FormPageManager(FIELD_DEFINITIONS, FIELD_PAGES);

        // 鍒濆鍖栧娉ˋPI
        this.notesAPI = new NotesAPI(db.supabase);

        // 鍒濆鍖栭獙璇佸櫒
        this.validator = new DataValidator();

        // 鍒濆鍖栧鍑哄櫒
        this.exporter = new DataExporter();
        this.exporter.setFieldDefinitions(FIELD_DEFINITIONS);

        console.log('鉁?V6.0妯″潡鍒濆鍖栧畬鎴?);
    },

    showLoading() {
        document.getElementById('app').innerHTML = `
            <div class="container">
                <div class="empty-state">
                    <p>鍔犺浇涓?..</p>
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

    // 娓叉煋浠诲姟瑙嗗浘锛堜繚鎸佸師鏈夐€昏緫锛?    async renderTasksView() {
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
                    <div class="task-icon">馃敶</div>
                    <div class="task-content">
                        <h3>${task.patient.study_id} ${task.patient.name ? '- ' + task.patient.name : ''}</h3>
                        <p>${task.patient.ward || ''} ${task.patient.bed_no || ''} | ${task.phaseName} ${task.daysOverdue > 0 ? `<span class="badge-urgent status-badge">寤惰繜${task.daysOverdue}澶?/span>` : `<span class="badge-urgent status-badge">浠婃棩鍒版湡</span>`}</p>
                    </div>
                </div>
            `).join('')
            : '<div class="empty-state"><p>鏆傛棤绱ф€ヤ换鍔?鉁?/p></div>';

        const upcomingHtml = tasks.upcoming.length > 0
            ? tasks.upcoming.map(task => `
                <div class="task-item task-upcoming" onclick="app.goToPatient('${task.patient.id}', '${task.phase}')">
                    <div class="task-icon">馃煛</div>
                    <div class="task-content">
                        <h3>${task.patient.study_id} ${task.patient.name ? '- ' + task.patient.name : ''}</h3>
                        <p>${task.patient.ward || ''} ${task.patient.bed_no || ''} | ${task.phaseName} <span class="badge-upcoming status-badge">${task.daysRemaining}澶╁悗鍒版湡</span></p>
                    </div>
                </div>
            `).join('')
            : '<div class="empty-state"><p>鏆傛棤鍗冲皢鍒版湡浠诲姟</p></div>';

        const completedHtml = tasks.completed.length > 0
            ? tasks.completed.map(task => {
                const time = new Date(task.completedAt).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                return `
                    <div class="task-item task-completed">
                        <div class="task-icon">鉁?/div>
                        <div class="task-content">
                            <h3>${task.patient.study_id}</h3>
                            <p>${task.phaseName} <span class="badge-completed status-badge">${time} 瀹屾垚</span></p>
                        </div>
                    </div>
                `;
            }).join('')
            : '<div class="empty-state"><p>浠婃棩鏆傛棤宸插畬鎴愪换鍔?/p></div>';

        return `
            <div class="container">
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 style="margin: 0; border: none; padding: 0;">浠婃棩浠诲姟</h2>
                        <button class="btn-secondary" onclick="app.showAllPatients()">鏌ョ湅鍏ㄩ儴鎮ｈ€?/button>
                    </div>
                    <p style="color: #5C635D; font-size: 14px; margin-bottom: 20px;">${today}</p>

                    <div class="eyebrow" style="background: #FFE5E5; color: #D32F2F;">绱ф€?路 ${tasks.urgent.length}</div>
                    ${urgentHtml}

                    <div class="eyebrow" style="margin-top: 20px; background: #FFF4E5; color: #F57C00;">鍗冲皢鍒版湡 路 ${tasks.upcoming.length}</div>
                    ${upcomingHtml}

                    <div class="eyebrow" style="margin-top: 20px; background: #E8F5E9; color: #388E3C;">浠婃棩宸插畬鎴?路 ${tasks.completed.length}</div>
                    ${completedHtml}
                </div>
            </div>
        `;
    },

    // 璺宠浆鍒版偅鑰呰鎯?    async goToPatient(patientId, phase = null) {
        this.currentPatient = patientId;
        this.currentPhase = phase || 'basic_info';
        this.currentView = 'patient-detail';

        // V6.0: 鍔犺浇鎮ｈ€呮暟鎹埌鍒嗛〉绠＄悊鍣?        const patient = await db.getPatient(patientId);
        if (patient) {
            this.formData = patient;
            this.pageManager.setFormData(patient);
            this.pageManager.setPhase(this.currentPhase);
        }

        await this.render();
    },

    // 娓叉煋鎮ｈ€呰鎯咃紙V6.0澧炲己鐗堬級
    async renderPatientDetail() {
        const patient = await db.getPatient(this.currentPatient);
        if (!patient) {
            return '<div class="container"><div class="empty-state"><p>鎮ｈ€呬笉瀛樺湪</p></div></div>';
        }

        this.formData = patient;
        this.pageManager.setFormData(patient);
        this.pageManager.setPhase(this.currentPhase);

        // V6.0: 娓叉煋甯﹀垎椤电殑琛ㄥ崟
        return this.renderPatientFormWithPagination(patient);
    },

    // V6.0: 娓叉煋甯﹀垎椤电殑鎮ｈ€呰〃鍗?    async renderPatientFormWithPagination(patient) {
        const phaseConfig = this.getPhaseConfig(this.currentPhase);

        // 鑾峰彇褰撳墠椤甸潰瀛楁
        const currentPageFields = this.pageManager.getCurrentPageFields();

        // 鑾峰彇鎵€鏈夐〉闈㈢姸鎬侊紙鐢ㄤ簬杩涘害鎸囩ず鍣級
        const pagesStatus = this.pageManager.getAllPagesStatus();

        // 娓叉煋杩涘害鎸囩ず鍣?        const progressHtml = this.renderProgressIndicator(pagesStatus);

        // 娓叉煋瀛楁
        const fieldsHtml = this.renderFields(currentPageFields);

        // 娓叉煋澶囨敞鍖哄煙
        const notesHtml = await this.renderNotesSection(patient.id, this.currentPhase);

        // 娓叉煋鍒嗛〉瀵艰埅鎸夐挳
        const paginationHtml = this.renderPaginationButtons();

        // 娓叉煋楠岃瘉閿欒鎻愮ず
        const validationHtml = this.renderValidationErrors();

        return `
            <div class="container">
                <!-- 杩斿洖鎸夐挳 -->
                <button class="btn-secondary" onclick="app.goBack()" style="margin-bottom: 16px;">
                    鈫?杩斿洖
                </button>

                <div class="card">
                    <!-- 鎮ｈ€呬俊鎭ご閮?-->
                    <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #E7E1D7;">
                        <h2 style="margin: 0 0 8px 0; border: none; padding: 0;">${patient.study_id}</h2>
                        <p style="color: #5C635D; font-size: 14px; margin: 0;">
                            ${patient.name || ''} | ${patient.ward || ''} ${patient.bed_no || ''}
                        </p>
                    </div>

                    <!-- 闃舵瀵艰埅 -->
                    ${this.renderPhaseNav(patient)}

                    <!-- V6.0: 杩涘害鎸囩ず鍣?-->
                    ${progressHtml}

                    <!-- 褰撳墠闃舵鏍囬 -->
                    <h3 style="font-size: 16px; font-weight: 500; color: #C4612F; margin: 20px 0 16px 0;">
                        ${phaseConfig.name}
                    </h3>

                    <!-- V6.0: 楠岃瘉閿欒鎻愮ず -->
                    ${validationHtml}

                    <!-- 琛ㄥ崟瀛楁 -->
                    <form id="patient-form" onsubmit="app.savePatientData(event)">
                        ${fieldsHtml}

                        <!-- V6.0: 澶囨敞鍖哄煙 -->
                        ${notesHtml}

                        <!-- V6.0: 鍒嗛〉瀵艰埅 -->
                        ${paginationHtml}

                        <!-- 淇濆瓨鎸夐挳 -->
                        <div style="display: flex; gap: 12px; margin-top: 24px;">
                            <button type="button" class="btn-secondary" onclick="app.saveDraft()">
                                淇濆瓨鑽夌
                            </button>
                            <button type="submit" class="btn-primary" style="flex: 1;">
                                ${this.currentPhase === 'basic_info' ? '淇濆瓨鍩烘湰淇℃伅' : '鎻愪氦鏈樁娈垫暟鎹?}
                            </button>
                        </div>
                    </form>

                    <!-- V6.0: 瀵煎嚭鎸夐挳 -->
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #E7E1D7;">
                        <button class="btn-secondary" onclick="app.exportPatientData()" style="width: 100%;">
                            馃摜 瀵煎嚭鎮ｈ€呮暟鎹?                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // V6.0: 娓叉煋杩涘害鎸囩ず鍣?    renderProgressIndicator(pagesStatus) {
        if (pagesStatus.length <= 1) {
            return ''; // 鍙湁1椤碉紝涓嶆樉绀鸿繘搴?        }

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
                    绗?${this.pageManager.currentPageIndex + 1} 椤?/ 鍏?${pagesStatus.length} 椤?(${progress}%)
                </p>
            </div>
        `;
    },

    // V6.0: 娓叉煋瀛楁锛堣€冭檻渚濊禆鍏崇郴锛?    renderFields(fields) {
        return fields.map(field => {
            // 妫€鏌ュ瓧娈垫槸鍚﹀簲璇ユ樉绀?            if (!this.pageManager.shouldShowField(field)) {
                return ''; // 闅愯棌瀛楁
            }

            return this.renderField(field);
        }).join('');
    },

    // 娓叉煋鍗曚釜瀛楁
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
                    <option value="">璇烽€夋嫨</option>
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

    // V6.0: 瀛楁鍊煎彉鍖栨椂瑙﹀彂
    onFieldChange(fieldName, value) {
        // 鏇存柊琛ㄥ崟鏁版嵁
        this.formData[fieldName] = value;
        this.pageManager.updateFormData(fieldName, value);

        // 鑷姩璁＄畻瀛楁
        this.pageManager.autoCalculateFields();

        // 鏇存柊璁＄畻瀛楁鐨勬樉绀?        this.updateComputedFields();

        // 瀹炴椂楠岃瘉
        this.validateAndShowErrors();
    },

    // V6.0: 鏇存柊璁＄畻瀛楁鐨勬樉绀?    updateComputedFields() {
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

    // V6.0: 楠岃瘉骞舵樉绀洪敊璇?    validateAndShowErrors() {
        const errors = this.pageManager.validateCurrentPage();

        // 娓呴櫎涔嬪墠鐨勯敊璇彁绀?        document.querySelectorAll('.field-error').forEach(el => el.remove());
        document.querySelectorAll('.form-field').forEach(el => el.classList.remove('has-error'));

        // 鏄剧ず閿欒
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

        // 鏇存柊楠岃瘉閿欒鎻愮ず鍖哄煙
        const validationContainer = document.getElementById('validation-errors');
        if (validationContainer) {
            validationContainer.innerHTML = this.renderValidationErrors();
        }
    },

    // V6.0: 娓叉煋楠岃瘉閿欒鎻愮ず
    renderValidationErrors() {
        const errors = this.validator.validateErrors(this.formData);
        const warnings = this.validator.validateWarnings(this.formData);

        if (errors.length === 0 && warnings.length === 0) {
            return '';
        }

        const errorsHtml = errors.map(err => `
            <div class="alert alert-error">
                <strong>閿欒:</strong> ${err.message}
            </div>
        `).join('');

        const warningsHtml = warnings.map(warn => `
            <div class="alert alert-warning">
                <strong>璀﹀憡:</strong> ${warn.message}
            </div>
        `).join('');

        return `
            <div id="validation-errors" style="margin-bottom: 20px;">
                ${errorsHtml}
                ${warningsHtml}
            </div>
        `;
    },

    // V6.0: 娓叉煋澶囨敞鍖哄煙
    async renderNotesSection(patientId, phase) {
        try {
            const note = await this.notesAPI.getNote(patientId, phase);
            const noteContent = note ? note.content : '';
            const noteInfo = note ? `
                <p style="font-size: 12px; color: #999; margin-top: 4px;">
                    鏈€鍚庢洿鏂? ${new Date(note.updated_at).toLocaleString('zh-CN')}
                    by ${note.users?.email || '鏈煡'}
                </p>
            ` : '';

            return `
                <div class="notes-section" style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #E7E1D7;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <label style="font-size: 14px; font-weight: 500; color: #1F2421;">
                            馃摑 澶囨敞 <span style="color: #999; font-weight: 400;">(鏈€澶?00瀛?</span>
                        </label>
                        <button type="button" class="btn-text" onclick="app.showNoteHistory('${patientId}', '${phase}')">
                            鏌ョ湅鍘嗗彶
                        </button>
                    </div>
                    <textarea
                        id="note-content"
                        maxlength="500"
                        placeholder="鍦ㄦ杈撳叆澶囨敞淇℃伅锛屼緥濡傦細鎮ｈ€呯壒娈婃儏鍐点€佹敞鎰忎簨椤圭瓑..."
                        style="width: 100%; padding: 10px; border: 1px solid #E7E1D7; border-radius: 6px; font-size: 14px; min-height: 100px;"
                    >${noteContent}</textarea>
                    ${noteInfo}
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                        <span id="note-char-count" style="font-size: 12px; color: #999;">
                            ${noteContent.length}/500
                        </span>
                        <button type="button" class="btn-secondary" onclick="app.saveNote('${patientId}', '${phase}')">
                            淇濆瓨澶囨敞
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
            console.error('娓叉煋澶囨敞鍖哄煙澶辫触:', error);
            return '';
        }
    },

    // V6.0: 娓叉煋鍒嗛〉瀵艰埅鎸夐挳
    renderPaginationButtons() {
        const totalPages = this.pageManager.getTotalPages();
        const currentPage = this.pageManager.currentPageIndex;

        if (totalPages <= 1) {
            return ''; // 鍙湁1椤碉紝涓嶆樉绀哄垎椤垫寜閽?        }

        const prevDisabled = currentPage === 0 ? 'disabled' : '';
        const nextDisabled = currentPage === totalPages - 1 ? 'disabled' : '';

        return `
            <div class="pagination-buttons" style="display: flex; gap: 12px; margin-top: 24px;">
                <button type="button" class="btn-secondary" onclick="app.previousPage()" ${prevDisabled}>
                    鈫?涓婁竴椤?                </button>
                <button type="button" class="btn-secondary" onclick="app.nextPage()" ${nextDisabled} style="flex: 1;">
                    涓嬩竴椤?鈫?                </button>
            </div>
        `;
    },

    // V6.0: 涓嬩竴椤?    async nextPage() {
        // 楠岃瘉褰撳墠椤?        const errors = this.pageManager.validateCurrentPage();
        if (errors.some(e => e.type !== 'warning')) {
            alert('璇蜂慨姝ｅ綋鍓嶉〉闈㈢殑閿欒鍚庡啀缁х画');
            return;
        }

        if (this.pageManager.nextPage()) {
            await this.render();
        }
    },

    // V6.0: 涓婁竴椤?    async previousPage() {
        if (this.pageManager.previousPage()) {
            await this.render();
        }
    },

    // V6.0: 璺宠浆鍒版寚瀹氶〉
    async goToPage(pageIndex) {
        if (this.pageManager.goToPage(pageIndex)) {
            await this.render();
        }
    },

    // 缁х画鍦ㄤ笅涓€涓枃浠?..
};

// 椤甸潰鍔犺浇瀹屾垚鍚庡垵濮嬪寲
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});


// POCD鐮旂┒鏁版嵁閲囬泦绯荤粺 V6.0 - Part 2
// 澶囨敞鍔熻兘銆佸鍑哄姛鑳姐€佽緟鍔╂柟娉?
// 缁х画 app 瀵硅薄...

// V6.0: 淇濆瓨澶囨敞
async saveNote(patientId, phase) {
    const noteContent = document.getElementById('note-content').value.trim();

    if (!noteContent) {
        alert('澶囨敞鍐呭涓嶈兘涓虹┖');
        return;
    }

    // 楠岃瘉澶囨敞
    const validation = this.notesAPI.validateNote(noteContent);
    if (!validation.valid) {
        alert(validation.errors.join('\n'));
        return;
    }

    try {
        const user = await db.getCurrentUser();
        await this.notesAPI.saveNote(patientId, phase, noteContent, user.id);
        alert('澶囨敞淇濆瓨鎴愬姛锛?);
    } catch (error) {
        console.error('淇濆瓨澶囨敞澶辫触:', error);
        alert('淇濆瓨澶囨敞澶辫触: ' + error.message);
    }
},

// V6.0: 鏄剧ず澶囨敞鍘嗗彶
async showNoteHistory(patientId, phase) {
    try {
        const history = await this.notesAPI.getNoteHistory(patientId, phase);
        const formatted = this.notesAPI.formatHistory(history);

        if (formatted.length === 0) {
            alert('鏆傛棤鍘嗗彶璁板綍');
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

        // 鏄剧ず妯℃€佹
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>澶囨敞鍘嗗彶</h3>
                    <button onclick="this.closest('.modal').remove()" class="modal-close">脳</button>
                </div>
                <div class="modal-body" style="max-height: 400px; overflow-y: auto;">
                    ${historyHtml}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    } catch (error) {
        console.error('鑾峰彇澶囨敞鍘嗗彶澶辫触:', error);
        alert('鑾峰彇澶囨敞鍘嗗彶澶辫触');
    }
},

// V6.0: 瀵煎嚭鎮ｈ€呮暟鎹?async exportPatientData() {
    const patient = await db.getPatient(this.currentPatient);
    if (!patient) {
        alert('鎮ｈ€呮暟鎹笉瀛樺湪');
        return;
    }

    const patientName = patient.study_id;
    this.exporter.exportSinglePatient(patient, patientName);
},

// V6.0: 瀵煎嚭鎵€鏈夋偅鑰呮暟鎹紙浠庡叏閮ㄦ偅鑰呴〉闈㈣皟鐢級
async exportAllPatientsData() {
    const patients = await db.getAllPatients();
    if (patients.length === 0) {
        alert('鏆傛棤鎮ｈ€呮暟鎹?);
        return;
    }

    this.exporter.exportAllPatients(patients);
},

// V6.0: 瀵煎嚭缁熻鎶ュ憡
async exportStatisticsReport() {
    const patients = await db.getAllPatients();
    if (patients.length === 0) {
        alert('鏆傛棤鎮ｈ€呮暟鎹?);
        return;
    }

    this.exporter.exportStatisticsReport(patients);
},

// 淇濆瓨鎮ｈ€呮暟鎹?async savePatientData(event) {
    event.preventDefault();

    // 鏀堕泦琛ㄥ崟鏁版嵁
    const formData = new FormData(event.target);
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }

    // 鍚堝苟鍒扮幇鏈夋暟鎹?    Object.assign(this.formData, data);

    // V6.0: 楠岃瘉鏁版嵁
    const errors = this.validator.validateErrors(this.formData);
    if (errors.length > 0) {
        const errorMessages = errors.map(e => `${e.field}: ${e.message}`).join('\n');
        alert('鏁版嵁楠岃瘉澶辫触:\n' + errorMessages);
        return;
    }

    // 淇濆瓨鍒版暟鎹簱
    try {
        await db.updatePatient(this.currentPatient, this.formData);
        alert('淇濆瓨鎴愬姛锛?);

        // 濡傛灉鏄渶鍚庝竴椤碉紝杩斿洖浠诲姟鍒楄〃
        if (this.pageManager.currentPageIndex === this.pageManager.getTotalPages() - 1) {
            this.goBack();
        }
    } catch (error) {
        console.error('淇濆瓨澶辫触:', error);
        alert('淇濆瓨澶辫触: ' + error.message);
    }
},

// 淇濆瓨鑽夌
async saveDraft() {
    // 鏀堕泦褰撳墠琛ㄥ崟鏁版嵁
    const form = document.getElementById('patient-form');
    if (form) {
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        Object.assign(this.formData, data);
    }

    // 淇濆瓨鍒?IndexedDB锛堣崏绋匡級
    try {
        await db.saveDraft(this.currentPatient, this.formData);
        alert('鑽夌淇濆瓨鎴愬姛锛?);
    } catch (error) {
        console.error('淇濆瓨鑽夌澶辫触:', error);
        alert('淇濆瓨鑽夌澶辫触');
    }
},

// 娓叉煋闃舵瀵艰埅
renderPhaseNav(patient) {
    const phases = [
        { key: 'basic_info', name: '鍩烘湰淇℃伅' },
        { key: 'T0', name: 'T0 鍩虹嚎' },
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

// 鍒囨崲闃舵
async switchPhase(phase) {
    // 淇濆瓨褰撳墠鏁版嵁
    await this.saveDraft();

    this.currentPhase = phase;
    this.pageManager.setPhase(phase);

    await this.render();
},

// 鑾峰彇闃舵閰嶇疆
getPhaseConfig(phase) {
    const configs = {
        'basic_info': { name: '鎮ｈ€呭熀鏈俊鎭?, color: '#C4612F' },
        'T0': { name: 'T0 鏈墠鍩虹嚎璇勪及', color: '#6B8E6F' },
        'POD1': { name: 'POD1 鏈悗绗?澶?, color: '#E9A854' },
        'POD3': { name: 'POD3 鏈悗绗?澶?, color: '#5B9BD5' },
        'POD7': { name: 'POD7 鏈悗绗?澶?, color: '#8E6BB0' }
    };
    return configs[phase] || configs['basic_info'];
},

// 鏄剧ず鎵€鏈夋偅鑰?async showAllPatients() {
    this.currentView = 'all-patients';
    await this.render();
},

// 娓叉煋鎵€鏈夋偅鑰呭垪琛?async renderAllPatients() {
    const patients = await db.getAllPatients();

    if (patients.length === 0) {
        return `
            <div class="container">
                <button class="btn-secondary" onclick="app.goBack()" style="margin-bottom: 16px;">
                    鈫?杩斿洖
                </button>
                <div class="empty-state">
                    <p>鏆傛棤鎮ｈ€呮暟鎹?/p>
                </div>
            </div>
        `;
    }

    const patientsHtml = patients.map(patient => {
        const lastUpdate = patient.updated_at ?
            new Date(patient.updated_at).toLocaleDateString('zh-CN') : '鏈煡';

        return `
            <div class="task-item" onclick="app.goToPatient('${patient.id}')">
                <div class="task-icon">馃懁</div>
                <div class="task-content">
                    <h3>${patient.study_id} ${patient.name ? '- ' + patient.name : ''}</h3>
                    <p>${patient.ward || ''} ${patient.bed_no || ''} | 鏈€鍚庢洿鏂? ${lastUpdate}</p>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="container">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <button class="btn-secondary" onclick="app.goBack()">
                    鈫?杩斿洖
                </button>
                <button class="btn-secondary" onclick="app.exportAllPatientsData()">
                    馃摜 瀵煎嚭鍏ㄩ儴
                </button>
            </div>

            <div class="card">
                <h2>鍏ㄩ儴鎮ｈ€?(${patients.length})</h2>
                ${patientsHtml}

                <!-- V6.0: 缁熻鎶ュ憡鎸夐挳 -->
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #E7E1D7;">
                    <button class="btn-secondary" onclick="app.exportStatisticsReport()" style="width: 100%;">
                        馃搳 瀵煎嚭缁熻鎶ュ憡
                    </button>
                </div>
            </div>
        </div>
    `;
},

// 鏄剧ず鏂版偅鑰呰〃鍗?showNewPatient() {
    this.currentView = 'new-patient';
    this.currentPhase = 'basic_info';
    this.formData = {};
    this.render();
},

// 娓叉煋鏂版偅鑰呰〃鍗?async renderNewPatientForm() {
    const basicInfoFields = FIELD_DEFINITIONS.basic_info;

    const fieldsHtml = basicInfoFields.map(field => this.renderField(field)).join('');

    return `
        <div class="container">
            <button class="btn-secondary" onclick="app.goBack()" style="margin-bottom: 16px;">
                鈫?杩斿洖
            </button>

            <div class="card">
                <h2>鏂板鎮ｈ€?/h2>

                <form onsubmit="app.createNewPatient(event)">
                    ${fieldsHtml}

                    <button type="submit" class="btn-primary" style="width: 100%; margin-top: 20px;">
                        鍒涘缓鎮ｈ€?                    </button>
                </form>
            </div>
        </div>
    `;
},

// 鍒涘缓鏂版偅鑰?async createNewPatient(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }

    // 楠岃瘉蹇呭～瀛楁
    if (!data.study_id || !data.enrollment_date) {
        alert('璇峰～鍐欑爺绌剁紪鍙峰拰鍏ョ粍鏃ユ湡');
        return;
    }

    try {
        const patientId = await db.createPatient(data);
        alert('鎮ｈ€呭垱寤烘垚鍔燂紒');
        this.goToPatient(patientId, 'basic_info');
    } catch (error) {
        console.error('鍒涘缓鎮ｈ€呭け璐?', error);
        alert('鍒涘缓鎮ｈ€呭け璐? ' + error.message);
    }
},

// 杩斿洖
goBack() {
    this.currentView = 'tasks';
    this.currentPatient = null;
    this.currentPhase = 'basic_info';
    this.render();
}

// 瀵煎嚭 app 瀵硅薄
window.app = app;

