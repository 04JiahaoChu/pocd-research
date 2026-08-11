// 用户认证模块
// 账号密码登录 + 角色权限管理

class Auth {
    constructor() {
        this.currentUser = null;
        this.sessionToken = null;
    }

    // 初始化（检查登录状态）
    async init() {
        try {
            // 从 localStorage 读取会话
            const savedSession = localStorage.getItem('pocd_session');
            if (!savedSession) {
                return false;
            }

            const session = JSON.parse(savedSession);
            this.sessionToken = session.token;

            // 验证会话是否过期
            if (new Date(session.expiresAt) < new Date()) {
                this.logout();
                return false;
            }

            // 恢复用户信息
            this.currentUser = session.user;
            console.log('会话恢复成功:', this.currentUser.username);
            return true;

        } catch (error) {
            console.error('会话恢复失败:', error);
            this.logout();
            return false;
        }
    }

    // 登录
    async login(username, password) {
        try {
            // 调用数据库验证函数
            const { data, error } = await db.supabase.rpc('verify_login', {
                p_username: username,
                p_password: password
            });

            if (error || !data || data.length === 0) {
                throw new Error('用户名或密码错误');
            }

            const user = data[0];

            // 生成会话令牌
            const sessionToken = this.generateToken();
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7天过期

            // 保存会话到数据库
            await db.supabase
                .from('user_sessions')
                .insert({
                    user_id: user.user_id,
                    session_token: sessionToken,
                    expires_at: expiresAt.toISOString()
                });

            // 保存会话到本地
            this.currentUser = user;
            this.sessionToken = sessionToken;

            localStorage.setItem('pocd_session', JSON.stringify({
                user: user,
                token: sessionToken,
                expiresAt: expiresAt.toISOString()
            }));

            console.log('登录成功:', user.username, '角色:', user.role);
            return true;

        } catch (error) {
            console.error('登录失败:', error);
            throw error;
        }
    }

    // 登出
    logout() {
        // 清除本地会话
        localStorage.removeItem('pocd_session');
        this.currentUser = null;
        this.sessionToken = null;

        // 跳转到登录页
        window.location.href = 'login.html';
    }

    // 修改密码
    async changePassword(oldPassword, newPassword) {
        try {
            const { data, error } = await db.supabase.rpc('change_password', {
                p_user_id: this.currentUser.user_id,
                p_old_password: oldPassword,
                p_new_password: newPassword
            });

            if (error || !data) {
                throw new Error('旧密码错误');
            }

            alert('密码修改成功！');
            return true;

        } catch (error) {
            console.error('修改密码失败:', error);
            throw error;
        }
    }

    // 生成随机令牌
    generateToken() {
        return 'pocd_' + Math.random().toString(36).substring(2, 15) +
               Math.random().toString(36).substring(2, 15) +
               Date.now().toString(36);
    }

    // 获取角色显示名称
    getRoleDisplayName() {
        if (!this.currentUser) return '';
        const roleMap = {
            'super_admin': '超级管理员',
            'admin': '管理员',
            'user': '普通用户'
        };
        return roleMap[this.currentUser.role] || this.currentUser.role;
    }

    // 权限检查
    hasPermission(action) {
        if (!this.currentUser) return false;

        const role = this.currentUser.role;

        // 超级管理员和管理员：所有权限
        if (role === 'super_admin' || role === 'admin') {
            return true;
        }

        // 普通用户：只读权限
        if (role === 'user') {
            return action === 'read' || action === 'view';
        }

        return false;
    }

    // 是否为管理员
    isAdmin() {
        return this.currentUser &&
               (this.currentUser.role === 'super_admin' || this.currentUser.role === 'admin');
    }

    // 是否为超级管理员
    isSuperAdmin() {
        return this.currentUser && this.currentUser.role === 'super_admin';
    }
}

// 全局实例
const auth = new Auth();
