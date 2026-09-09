// 备注功能API - 处理备注的CRUD和历史记录

class NotesAPI {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
    }

    // 获取患者某个阶段的当前备注
    async getNote(patientId, phase) {
        try {
            const { data, error } = await this.supabase
                .from('patient_notes')
                .select(`
                    *,
                    users:created_by(email, id)
                `)
                .eq('patient_id', patientId)
                .eq('phase', phase)
                .is('deleted_at', null)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Error fetching note:', error);
            throw error;
        }
    }

    // 获取患者所有阶段的备注
    async getAllNotes(patientId) {
        try {
            const { data, error } = await this.supabase
                .from('patient_notes')
                .select(`
                    *,
                    users:created_by(email, id)
                `)
                .eq('patient_id', patientId)
                .is('deleted_at', null)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching all notes:', error);
            throw error;
        }
    }

    // 创建或更新备注
    async saveNote(patientId, phase, content, userId) {
        try {
            // 检查是否已存在备注
            const existingNote = await this.getNote(patientId, phase);

            if (existingNote) {
                // 更新现有备注
                const { data, error } = await this.supabase
                    .from('patient_notes')
                    .update({
                        content: content,
                        updated_at: new Date().toISOString(),
                        created_by: userId // 记录最后修改人
                    })
                    .eq('id', existingNote.id)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            } else {
                // 创建新备注
                const { data, error } = await this.supabase
                    .from('patient_notes')
                    .insert({
                        patient_id: patientId,
                        phase: phase,
                        content: content,
                        created_by: userId
                    })
                    .select()
                    .single();

                if (error) throw error;
                return data;
            }
        } catch (error) {
            console.error('Error saving note:', error);
            throw error;
        }
    }

    // 删除备注（软删除）
    async deleteNote(noteId, userId) {
        try {
            const { data, error } = await this.supabase
                .from('patient_notes')
                .update({
                    deleted_at: new Date().toISOString(),
                    created_by: userId // 记录删除人
                })
                .eq('id', noteId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error deleting note:', error);
            throw error;
        }
    }

    // 获取备注历史记录
    async getNoteHistory(patientId, phase) {
        try {
            // 首先获取备注ID
            const note = await this.getNote(patientId, phase);
            if (!note) {
                return [];
            }

            // 获取历史记录
            const { data, error } = await this.supabase
                .from('patient_notes_history')
                .select(`
                    *,
                    users:modified_by(email, id)
                `)
                .eq('note_id', note.id)
                .order('modified_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching note history:', error);
            throw error;
        }
    }

    // 获取所有历史记录（包括已删除的备注）
    async getAllHistory(patientId) {
        try {
            const { data, error } = await this.supabase
                .from('patient_notes_history')
                .select(`
                    *,
                    users:modified_by(email, id)
                `)
                .eq('patient_id', patientId)
                .order('modified_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching all history:', error);
            throw error;
        }
    }

    // 格式化历史记录为易读格式
    formatHistory(historyRecords) {
        return historyRecords.map(record => {
            const actionText = {
                'created': '创建',
                'updated': '更新',
                'deleted': '删除'
            }[record.action] || record.action;

            const userEmail = record.users?.email || '未知用户';
            const timestamp = new Date(record.modified_at).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });

            return {
                ...record,
                actionText,
                userEmail,
                timestamp,
                displayText: `${timestamp} - ${userEmail} ${actionText}了备注`
            };
        });
    }

    // 验证备注内容
    validateNote(content) {
        const errors = [];

        if (!content || content.trim().length === 0) {
            errors.push('备注内容不能为空');
        }

        if (content.length > 500) {
            errors.push('备注内容不能超过500字符');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotesAPI;
}
