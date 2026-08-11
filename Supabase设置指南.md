# Supabase 用户系统设置指南

## 🔗 第一步：打开Supabase

**访问：** https://supabase.com/dashboard/project/hzgpajksyfgvaxzytlpn

（如果未登录，先用你的账号登录）

---

## 🔧 第二步：启用密码加密扩展

1. **点击左侧的 "SQL Editor"**
2. **点击右上角 "+ New query"（新建查询）**
3. **复制粘贴以下代码：**

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

4. **点击右下角绿色的 "Run" 按钮**
5. **应该显示 "Success. No rows returned"**

---

## 👥 第三步：创建用户系统

1. **还是在 SQL Editor，点击 "+ New query" 新建查询**
2. **打开记事本文件：** `supabase_user_system.sql`（在你的项目文件夹）
3. **Ctrl+A 全选整个文件内容**
4. **Ctrl+C 复制**
5. **切换回Supabase，在SQL编辑器里 Ctrl+V 粘贴**
6. **点击 "Run" 按钮**
7. **应该看到一个表格显示：**
   ```
   ✅ 用户系统创建成功！
   total_users: 3
   super_admin: HMC23CJH
   admin1: HMC-LQY
   admin2: HMC24LKY
   ```

---

## ✅ 完成标志

**如果看到上面的成功信息，说明：**
- ✅ 3个管理员账号已创建
- ✅ 权限规则已设置
- ✅ 数据库配置完成

**然后告诉我"执行成功了"，我马上修改前端代码！** 🚀

---

## ❌ 如果遇到错误

把错误信息截图或复制给我，我立即修复！
