// Supabase客户端初始化和数据库操作封装
// 依赖：https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2

class Database {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
    }

    async init() {
        // 加载Supabase客户端
        const { createClient } = supabase;
        this.supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

        // 自动登录（使用固定测试账号）
        const { data: { user } } = await this.supabase.auth.getUser();

        if (!user) {
            // 使用固定测试账号自动登录
            const testEmail = 'pocd-test@example.com';
            const testPassword = 'pocd123456';

            let { data, error } = await this.supabase.auth.signInWithPassword({
                email: testEmail,
                password: testPassword
            });

            // 如果账号不存在，自动注册
            if (error && error.message.includes('Invalid')) {
                const { data: signUpData, error: signUpError } = await this.supabase.auth.signUp({
                    email: testEmail,
                    password: testPassword
                });

                if (signUpError) {
                    console.error('注册失败:', signUpError);
                    alert('连接服务器失败，请检查网络或联系管理员');
                    return false;
                }
                data = signUpData;
            } else if (error) {
                console.error('登录失败:', error);
                alert('连接服务器失败: ' + error.message);
                return false;
            }

            this.currentUser = data.user;
            console.log('测试用户已登录:', this.currentUser.id);
        } else {
            this.currentUser = user;
            console.log('已登录用户:', this.currentUser.id);
        }

        return true;
    }

    // ========== 患者管理 ==========

    async getAllPatients() {
        const { data, error } = await this.supabase
            .from('patients')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('获取患者列表失败:', error);
            return [];
        }
        return data;
    }

    async getPatient(id) {
        const { data, error } = await this.supabase
            .from('patients')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('获取患者失败:', error);
            return null;
        }
        return data;
    }

    async createPatient(patientData) {
        const { data, error } = await this.supabase
            .from('patients')
            .insert([{
                user_id: this.currentUser.id,
                study_id: patientData.studyId,
                name: patientData.name || '',
                medical_record_no: patientData.medicalRecordNo || '',
                ward: patientData.ward || '',
                bed_no: patientData.bedNo || '',
                phone: patientData.phone || '',
                enroll_date: patientData.enrollDate,
                surgery_date: patientData.surgeryDate || null,
                has_l3_ct: patientData.hasL3Ct || null,
                sleep_intervention_triggered: patientData.sleepInterventionTriggered || null
            }])
            .select()
            .single();

        if (error) {
            console.error('创建患者失败:', error);
            if (error.code === '23505') {  // 研究编号重复
                alert('研究编号已存在！');
            }
            return null;
        }
        return data;
    }

    async updatePatient(id, updates) {
        const { data, error } = await this.supabase
            .from('patients')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('更新患者失败:', error);
            alert('数据库错误：' + error.message + '\n错误代码：' + error.code);
            return null;
        }
        return data;
    }

    async deletePatient(id) {
        const { error } = await this.supabase
            .from('patients')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('删除患者失败:', error);
            return false;
        }
        return true;
    }

    // ========== 数据采集管理 ==========

    async getPatientData(patientId, phase) {
        const { data, error } = await this.supabase
            .from('patient_data')
            .select('*')
            .eq('patient_id', patientId)
            .eq('phase', phase)
            .maybeSingle();  // 可能不存在

        if (error) {
            console.error('获取数据失败:', error);
            return null;
        }
        return data;
    }

    async getAllPatientData(patientId) {
        const { data, error } = await this.supabase
            .from('patient_data')
            .select('*')
            .eq('patient_id', patientId);

        if (error) {
            console.error('获取患者所有数据失败:', error);
            return [];
        }
        return data;
    }

    async savePatientData(patientId, phase, formData, completed = false) {
        const record = {
            patient_id: patientId,
            phase: phase,
            data: formData,
            completed: completed,
            completed_at: completed ? new Date().toISOString() : null
        };

        // 使用upsert（如果存在则更新，不存在则插入）
        const { data, error } = await this.supabase
            .from('patient_data')
            .upsert(record, {
                onConflict: 'patient_id,phase'  // 按患者+节点去重
            })
            .select()
            .single();

        if (error) {
            console.error('保存数据失败:', error);
            return null;
        }
        return data;
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
        today.setHours(0, 0, 0, 0);  // 今天0点

        for (const patient of patients) {
            if (!patient.surgery_date) {
                // 没有手术日期，只能显示T0待采集
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

            // 有手术日期，计算所有POD节点
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

            // 按顺序检查每个节点（只显示最早的未完成节点）
            for (const phase of phases) {
                const phaseData = await this.getPatientData(patient.id, phase.id);

                if (phaseData && phaseData.completed) {
                    // 已完成，检查是否今日完成
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
                    continue;  // 跳到下一个节点
                }

                // 未完成，计算截止日期
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
                    // 今天或已过期 → 🔴 紧急
                    tasks.urgent.push({
                        patient,
                        phase: phase.id,
                        phaseName: phase.name,
                        dueDate: dueDate.toISOString().split('T')[0],
                        daysOverdue: Math.abs(daysDiff),
                        status: 'urgent'
                    });
                    break;  // 只显示最早的未完成节点
                } else if (daysDiff <= WARNING_DAYS) {
                    // 2天内到期 → 🟡 即将到期
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
                // daysDiff > 2，不显示，跳到下一个患者
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

    // ========== 数据导出 ==========

    async exportAllData() {
        const patients = await this.getAllPatients();
        const exportData = [];

        for (const patient of patients) {
            const allData = await this.getAllPatientData(patient.id);
            const dataByPhase = {};
            allData.forEach(d => {
                dataByPhase[d.phase] = d.data;
            });

            exportData.push({
                ...patient,
                phaseData: dataByPhase
            });
        }

        return exportData;
    }
}

// 全局实例
const db = new Database();
