// 数据库连接优化配置
// 添加重试机制、超时控制、连接池优化

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
                            persistSession: false,  // 使用自定义会话管理
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
                    await this.sleep(this.retryDelay * (i + 1));  // 递增延迟
                } else {
                    alert('数据库连接失败，请检查网络后刷新页面重试');
                    throw error;
                }
            }
        }
    }

    // 测试连接（匿名访问测试）
    async testConnection() {
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('连接超时')), this.connectionTimeout)
        );

        const check = this.supabase
            .from('patients')
            .select('id')
            .limit(1);

        const result = await Promise.race([check, timeout]);

        // 测试连接成功后，设置用户角色上下文（如果已登录）
        if (window.auth && window.auth.currentUser) {
            await this.setRoleContext(window.auth.currentUser.role);
        }

        return result;
    }

    // 设置角色上下文（用于RLS策略）
    async setRoleContext(role) {
        try {
            // 通过自定义请求头传递角色信息
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

    // 删除登录相关方法
    // 登录由 auth.js 统一管理

    // 获取所有患者（带缓存，所有人可见）
    async getAllPatients() {
        // 先尝试从缓存读取
        const cached = this.getCachedPatients();
        if (cached && Date.now() - cached.timestamp < 30000) {  // 30秒缓存
            console.log('使用缓存的患者列表');
            return cached.data;
        }

        // 从数据库获取（所有患者，不区分创建者）
        return this.retryOperation(async () => {
            const { data, error } = await this.supabase
                .from('patients')
                .select('id, patient_id, name, age, gender, surgery_date, surgery_type, baseline_completed, pod1_completed, pod3_completed, pod7_completed, pod14_completed, pod30_completed')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('获取患者列表失败:', error);
                // 如果有缓存，即使过期也返回
                if (cached) return cached.data;
                throw error;
            }

            // 将 patient_id 映射为 study_id 以便前端使用
            const mappedData = data.map(p => ({
                ...p,
                study_id: p.patient_id
            }));

            // 更新缓存
            this.setCachedPatients(mappedData);
            return mappedData;
        }, '获取患者列表');
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
                .single();

            if (error) {
                console.error('获取患者失败:', error);
                throw error;
            }

            // 将 patient_id 映射为 study_id 以便前端使用
            return {
                ...data,
                study_id: data.patient_id
            };
        }, '获取患者详情');
    }

    // 创建患者（带重试，管理员权限）
    async createPatient(patientData) {
        return this.retryOperation(async () => {
            const { data, error } = await this.supabase
                .from('patients')
                .insert([{
                    patient_id: patientData.studyId || patientData.patient_id,
                    name: patientData.name || '',
                    age: patientData.age || null,
                    gender: patientData.gender || null,
                    surgery_date: patientData.surgeryDate || patientData.surgery_date,
                    surgery_type: patientData.surgery_type || null,
                    asa_class: patientData.asa_class || null,
                    education_years: patientData.education_years || null,
                    phone: patientData.phone || '',
                    created_by: window.auth ? window.auth.currentUser.username : null
                }])
                .select()
                .single();

            if (error) {
                console.error('创建患者失败:', error);
                if (error.code === '23505') {
                    alert('研究编号已存在！');
                }
                throw error;
            }

            // 清除缓存
            this.clearCache();
            return data;
        }, '创建患者');
    }

    // 更新患者（带重试）
    async updatePatient(id, updates) {
        return this.retryOperation(async () => {
            const { data, error } = await this.supabase
                .from('patients')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('更新患者失败:', error);
                alert('数据库错误：' + error.message + '\n错误代码：' + error.code);
                throw error;
            }

            // 清除缓存
            this.clearCache();
            return data;
        }, '更新患者');
    }

    // 删除患者（带重试）
    async deletePatient(id) {
        return this.retryOperation(async () => {
            const { error } = await this.supabase
                .from('patients')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('删除患者失败:', error);
                throw error;
            }

            // 清除缓存
            this.clearCache();
            return true;
        }, '删除患者');
    }

    // 保存患者数据（带重试）
    async savePatientData(patientId, phase, formData, isCompleted) {
        return this.retryOperation(async () => {
            const { data, error } = await this.supabase
                .from('assessments')
                .upsert({
                    patient_id: patientId,
                    phase: phase,
                    data: formData,
                    completed: isCompleted,
                    completed_at: isCompleted ? new Date().toISOString() : null,
                    created_by: window.auth ? window.auth.currentUser.username : null
                }, {
                    onConflict: 'patient_id,phase'
                })
                .select()
                .single();

            if (error) {
                console.error('保存数据失败:', error);
                throw error;
            }
            return data;
        }, '保存患者数据');
    }

    // 获取患者数据（带重试）
    async getPatientData(patientId, phase) {
        return this.retryOperation(async () => {
            const { data, error } = await this.supabase
                .from('assessments')
                .select('*')
                .eq('patient_id', patientId)
                .eq('phase', phase)
                .single();

            if (error && error.code !== 'PGRST116') {  // PGRST116 = 未找到记录
                console.error('获取数据失败:', error);
                throw error;
            }
            return data;
        }, '获取患者数据');
    }

    // 获取患者所有阶段数据（带重试）
    async getAllPatientData(patientId) {
        return this.retryOperation(async () => {
            const { data, error } = await this.supabase
                .from('assessments')
                .select('*')
                .eq('patient_id', patientId);

            if (error) {
                console.error('获取所有数据失败:', error);
                throw error;
            }
            return data;
        }, '获取所有患者数据');
    }

    // ========== 今日任务计算 ==========

    async getTodayTasks() {
        const patients = await this.getAllPatients();
        const tasks = {
            urgent: [],      // 🔴 需要立即采集
            upcoming: [],    // 🟡 即将到期
            completed: []    // ✅ 今日已完成
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const patient of patients) {
            if (!patient.surgery_date) {
                const t0Data = await this.getPatientData(patient.id, 'T0');
                if (!t0Data || !t0Data.completed) {
                    tasks.urgent.push({
                        patient,
                        phase: 'T0',
                        phaseName: 'T0 术前基线',
                        dueDate: patient.enroll_date,
                        daysOverdue: this.calculateDaysOverdue(patient.enroll_date, today),
                        status: 'urgent'
                    });
                }
                continue;
            }

            const surgeryDate = new Date(patient.surgery_date);
            surgeryDate.setHours(0, 0, 0, 0);

            const phases = [
                { id: 'T0', name: 'T0 术前基线', offset: null },
                { id: 'POD1', name: 'POD1 术后第1天', offset: 1 },
                { id: 'POD3', name: 'POD3 术后第3天', offset: 3 },
                { id: 'POD7', name: 'POD7 术后第7天', offset: 7 },
                { id: 'POD14', name: 'POD14 术后第14天', offset: 14 },
                { id: 'POD30', name: 'POD30 术后第30天', offset: 30 }
            ];

            for (const phase of phases) {
                const phaseData = await this.getPatientData(patient.id, phase.id);

                if (phaseData && phaseData.completed) {
                    const completedDate = new Date(phaseData.completed_at);
                    completedDate.setHours(0, 0, 0, 0);
                    if (completedDate.getTime() === today.getTime()) {
                        tasks.completed.push({
                            patient,
                            phase: phase.id,
                            phaseName: phase.name,
                            completedAt: phaseData.completed_at
                        });
                    }
                    continue;
                }

                let dueDate;
                if (phase.id === 'T0') {
                    dueDate = new Date(patient.enroll_date);
                } else {
                    dueDate = new Date(surgeryDate);
                    dueDate.setDate(dueDate.getDate() + phase.offset);
                }
                dueDate.setHours(0, 0, 0, 0);

                const daysDiff = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));

                if (daysDiff <= 0) {
                    tasks.urgent.push({
                        patient,
                        phase: phase.id,
                        phaseName: phase.name,
                        dueDate: dueDate.toISOString().split('T')[0],
                        daysOverdue: Math.abs(daysDiff),
                        status: 'urgent'
                    });
                    break;
                } else if (daysDiff <= 2) {
                    tasks.upcoming.push({
                        patient,
                        phase: phase.id,
                        phaseName: phase.name,
                        dueDate: dueDate.toISOString().split('T')[0],
                        daysRemaining: daysDiff,
                        status: 'upcoming'
                    });
                    break;
                }
                break;
            }
        }

        return tasks;
    }

    calculateDaysOverdue(dueDateStr, today) {
        const dueDate = new Date(dueDateStr);
        dueDate.setHours(0, 0, 0, 0);
        const diff = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
        return Math.max(0, diff);
    }
}

// 创建全局数据库实例
window.db = new DatabaseOptimized();
