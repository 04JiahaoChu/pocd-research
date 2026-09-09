// 数据库连接优化配置
// 适配完整116字段数据库结构
// 版本：3.1
// 日期：2026-08-14

// ── Boolean字段映射 ────────────────────────────────────────────────────────
// 数据库列为 BOOLEAN 类型，前端用"是/否"或"有/无"表示
// 写入前需要转换为 true/false，读出后需要还原为中文
const BOOLEAN_FIELDS = {
    // "是"=true / "否"=false
    yesNo: new Set([
        'sleep_correction_triggered',
        'has_standard_l3_ct',
        'pod1_sleep_correction_triggered',
        'pod1_pca_use'
    ]),
    // "有"=true / "无"=false
    haveNot: new Set([
        'hypertension',
        'diabetes',
        'coronary_heart_disease',
        'cerebrovascular_disease',
        'benzodiazepine_history',
        'statin_history'
    ])
};

class DatabaseOptimized {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.retryCount = 3;  // 重试次数
        this.retryDelay = 1000;  // 重试延迟（毫秒）
        this.connectionTimeout = 10000;  // 连接超时10秒
    }

    // 初始化数据库连接（带重试）
    async initialize() {
        for (let i = 0; i < this.retryCount; i++) {
            try {
                this.supabase = supabase.createClient(
                    SUPABASE_CONFIG.url,
                    SUPABASE_CONFIG.anonKey,
                    {
                        auth: {
                            persistSession: false,
                            autoRefreshToken: false
                        },
                        global: {
                            headers: {
                                'x-application-name': 'pocd-research'
                            }
                        },
                        db: {
                            schema: 'public'
                        }
                    }
                );

                // 测试连接
                await this.testConnection();
                console.log('数据库连接成功');
                return true;

            } catch (error) {
                console.error(`数据库连接失败 (尝试 ${i + 1}/${this.retryCount}):`, error);
                if (i < this.retryCount - 1) {
                    await this.sleep(this.retryDelay * (i + 1));
                } else {
                    alert('数据库连接失败，请检查网络后刷新页面重试');
                    throw error;
                }
            }
        }
    }

    // 测试连接
    async testConnection() {
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('连接超时')), this.connectionTimeout)
        );

        const check = this.supabase
            .from('patients')
            .select('id')
            .limit(1);

        const result = await Promise.race([check, timeout]);

        if (window.auth && window.auth.currentUser) {
            await this.setRoleContext(window.auth.currentUser.role);
        }

        return result;
    }

    // 设置角色上下文
    async setRoleContext(role) {
        try {
            this.supabase.rest.headers = {
                ...this.supabase.rest.headers,
                'x-user-role': role
            };
        } catch (error) {
            console.warn('设置角色上下文失败:', error);
        }
    }

    // 延迟函数
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ── Boolean 类型转换 ────────────────────────────────────────────────────

    // 写入DB前：把中文"是/否/有/无"转为 true/false
    convertForDatabase(data) {
        if (!data || typeof data !== 'object') return data;
        const result = { ...data };
        for (const [key, value] of Object.entries(result)) {
            if (BOOLEAN_FIELDS.yesNo.has(key)) {
                if (value === '是') result[key] = true;
                else if (value === '否') result[key] = false;
                else if (value === '' || value === undefined) result[key] = null;
                // null 保持 null，true/false 保持原样
            } else if (BOOLEAN_FIELDS.haveNot.has(key)) {
                if (value === '有') result[key] = true;
                else if (value === '无') result[key] = false;
                else if (value === '' || value === undefined) result[key] = null;
            }
        }
        return result;
    }

    // 读出DB后：把 true/false 还原为中文，方便表单下拉回显
    convertFromDatabase(data) {
        if (!data || typeof data !== 'object') return data;
        const result = { ...data };
        for (const [key, value] of Object.entries(result)) {
            if (BOOLEAN_FIELDS.yesNo.has(key)) {
                if (value === true) result[key] = '是';
                else if (value === false) result[key] = '否';
            } else if (BOOLEAN_FIELDS.haveNot.has(key)) {
                if (value === true) result[key] = '有';
                else if (value === false) result[key] = '无';
            }
        }
        return result;
    }

    // 带重试的通用数据库操作
    async retryOperation(operation, operationName) {
        for (let i = 0; i < this.retryCount; i++) {
            try {
                const result = await operation();
                return result;
            } catch (error) {
                console.error(`${operationName} 失败 (尝试 ${i + 1}/${this.retryCount}):`, error);
                if (i < this.retryCount - 1) {
                    await this.sleep(this.retryDelay);
                } else {
                    throw error;
                }
            }
        }
    }

    // 获取所有患者（带缓存）
    async getAllPatients() {
        const cached = this.getCachedPatients();
        if (cached && Date.now() - cached.timestamp < 30000) {
            console.log('使用缓存的患者列表');
            return cached.data;
        }

        return this.retryOperation(async () => {
            const { data, error } = await this.supabase
                .from('patients')
                .select('id, study_id, name, age, gender, surgery_date, surgery_type, enrollment_date, created_at')
                .is('deleted_at', null)  // 过滤已删除的患者
                .order('created_at', { ascending: false });

            if (error) {
                console.error('获取患者列表失败:', error);
                if (cached) return cached.data;
                throw error;
            }

            this.setCachedPatients(data);
            return data;
        }, '获取患者列表');
    }

    // 【新增】批量获取患者及进度（解决N+1问题）
    async getAllPatientsWithProgress() {
        return this.retryOperation(async () => {
            const { data, error } = await this.supabase
                .from('patients')
                .select('id, study_id, name, enrollment_date, surgery_date, ward, bed_no, ' +
                       't0_mmse_total, pod1_cam_delirium, pod3_mmse, pod7_mmse')
                .is('deleted_at', null)  // 过滤已删除的患者
                .order('created_at', { ascending: false });

            if (error) {
                console.error('批量获取患者进度失败:', error);
                throw error;
            }

            return data;
        }, '批量获取患者进度');
    }

    // 缓存管理
    getCachedPatients() {
        try {
            const cached = localStorage.getItem('patients_cache');
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    }

    setCachedPatients(data) {
        try {
            localStorage.setItem('patients_cache', JSON.stringify({
                data,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.warn('缓存写入失败:', error);
        }
    }

    clearCache() {
        localStorage.removeItem('patients_cache');
    }

    // 获取单个患者（带重试）
    async getPatient(id) {
        return this.retryOperation(async () => {
            const { data, error } = await this.supabase
                .from('patients')
                .select('*')
                .eq('id', id)
                .is('deleted_at', null)  // 过滤已删除的患者
                .single();

            if (error) {
                console.error('获取患者失败:', error);
                throw error;
            }

            // 读出后把 boolean 还原为中文，方便表单回显
            return this.convertFromDatabase(data);
        }, '获取患者详情');
    }

    // 创建患者（带重试）
    async createPatient(patientData) {
        return this.retryOperation(async () => {
            // 获取user_id
            let userId = null;
            if (window.auth && window.auth.currentUser) {
                userId = window.auth.currentUser.user_id || window.auth.currentUser.id;
            }

            const insertData = {
                user_id: userId,
                study_id: patientData.study_id,
                name: patientData.name || '',
                age: patientData.age || null,
                gender: patientData.gender || null,
                enrollment_date: patientData.enrollment_date || new Date().toISOString().split('T')[0],
                surgery_date: patientData.surgery_date || null,
                // 以下字段之前被遗漏
                medical_record_no: patientData.medical_record_no || null,
                ward: patientData.ward || null,
                bed_no: patientData.bed_no || null,
                phone: patientData.phone || null
            };

            console.log('即将插入的数据:', insertData);

            const { data, error } = await this.supabase
                .from('patients')
                .insert([insertData])
                .select()
                .single();

            if (error) {
                console.error('创建患者失败:', error);
                if (error.code === '23505') {
                    alert('研究编号已存在！');
                }
                throw error;
            }

            this.clearCache();
            return data;
        }, '创建患者');
    }

    // 更新患者（带重试）
    async updatePatient(id, updates) {
        return this.retryOperation(async () => {
            // 写入前：把中文"是/否/有/无"转为 boolean
            const safeUpdates = this.convertForDatabase({ ...updates });
            safeUpdates.updated_at = new Date().toISOString();

            const { data, error } = await this.supabase
                .from('patients')
                .update(safeUpdates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('更新患者失败:', error);
                alert('数据库错误：' + error.message + '\n错误代码：' + error.code);
                throw error;
            }

            this.clearCache();
            // 读出后还原为中文
            return this.convertFromDatabase(data);
        }, '更新患者');
    }

    // 删除患者（软删除）
    async deletePatient(id) {
        return this.retryOperation(async () => {
            // 获取当前用户ID
            let userId = null;
            if (window.auth && window.auth.currentUser) {
                userId = window.auth.currentUser.user_id || window.auth.currentUser.id;
            }

            // 软删除：标记 deleted_at 而非物理删除
            const { error } = await this.supabase
                .from('patients')
                .update({
                    deleted_at: new Date().toISOString(),
                    deleted_by: userId
                })
                .eq('id', id);

            if (error) {
                console.error('删除患者失败:', error);
                throw error;
            }

            this.clearCache();
            console.log('患者已标记为删除（软删除）:', id);
            return true;
        }, '删除患者');
    }

    // 获取患者所有阶段数据（新增方法）
    async getAllPatientData(patientId) {
        // 因为使用的是宽表结构，所有数据都在 patients 表中
        // 这个方法返回完整的患者记录
        return this.retryOperation(async () => {
            const { data, error } = await this.supabase
                .from('patients')
                .select('*')
                .eq('id', patientId)
                .is('deleted_at', null)  // 过滤已删除的患者
                .single();

            if (error) {
                console.error('获取患者数据失败:', error);
                throw error;
            }

            // 读出后还原 boolean 为中文
            return this.convertFromDatabase(data);
        }, '获取患者所有数据');
    }

    // 保存患者数据（用于表单保存）
    async savePatientData(patientId, phase, formData, isCompleted) {
        // 宽表结构：直接更新 patients 表的相应字段
        return this.retryOperation(async () => {
            // 写入前：把中文"是/否/有/无"转为 boolean
            const safeData = this.convertForDatabase({ ...formData });

            const { data, error } = await this.supabase
                .from('patients')
                .update(safeData)
                .eq('id', patientId)
                .select()
                .single();

            if (error) {
                console.error('保存患者数据失败:', error);
                throw error;
            }

            this.clearCache();
            // 读出后还原为中文
            return this.convertFromDatabase(data);
        }, '保存患者数据');
    }

    // 获取患者某个阶段的数据
    async getPatientData(patientId, phase) {
        // 宽表结构：返回整个患者记录，由调用方筛选需要的字段
        return this.getPatient(patientId);
    }

    // ========== 今日任务计算 ==========
    async getTodayTasks() {
        // 【优化】使用批量查询，一次性获取所有患者数据
        const patients = await this.getAllPatientsWithProgress();
        const tasks = {
            urgent: [],
            upcoming: [],
            completed: []
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const patient of patients) {
            // 检查每个阶段的完成情况
            const phases = [
                { id: 'T0', name: 'T0 术前基线', checkField: 't0_mmse_total', offset: null },
                { id: 'POD1', name: 'POD1 术后第1天', checkField: 'pod1_cam_delirium', offset: 1 },
                { id: 'POD3', name: 'POD3 术后第3天', checkField: 'pod3_mmse', offset: 3 },
                { id: 'POD7', name: 'POD7 术后第7天', checkField: 'pod7_mmse', offset: 7 }
            ];

            // 【优化】直接使用已查询的数据，无需再次调用 getPatient
            const fullPatient = patient;

            for (const phase of phases) {
                // 检查该阶段是否已完成（关键字段是否有数据）
                const isCompleted = fullPatient[phase.checkField] !== null && fullPatient[phase.checkField] !== undefined;

                if (isCompleted) {
                    continue;  // 已完成，跳过
                }

                // 计算到期日期
                let dueDate;
                if (phase.id === 'T0') {
                    dueDate = new Date(fullPatient.enrollment_date || today);
                } else {
                    if (!fullPatient.surgery_date) {
                        continue;  // 没有手术日期，无法计算术后阶段
                    }
                    dueDate = new Date(fullPatient.surgery_date);
                    dueDate.setDate(dueDate.getDate() + phase.offset);
                }
                dueDate.setHours(0, 0, 0, 0);

                const daysDiff = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));

                if (daysDiff <= 0) {
                    // 紧急任务
                    tasks.urgent.push({
                        patient: fullPatient,
                        phase: phase.id,
                        phaseName: phase.name,
                        dueDate: dueDate.toISOString().split('T')[0],
                        daysOverdue: Math.abs(daysDiff),
                        status: 'urgent'
                    });
                    break;  // 只显示最紧急的一个阶段
                } else if (daysDiff <= 2) {
                    // 即将到期
                    tasks.upcoming.push({
                        patient: fullPatient,
                        phase: phase.id,
                        phaseName: phase.name,
                        dueDate: dueDate.toISOString().split('T')[0],
                        daysRemaining: daysDiff,
                        status: 'upcoming'
                    });
                    break;  // 只显示最近的一个阶段
                }
                break;  // 找到第一个未完成的阶段后停止
            }
        }

        return tasks;
    }
}

// 创建全局数据库实例
window.db = new DatabaseOptimized();
