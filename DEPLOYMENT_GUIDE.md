# PWA V2.0 部署指南（云端同步版）

## 📋 部署前准备

### 1. 注册Supabase账号
1. 访问 https://supabase.com
2. 点击 "Start your project" → 用GitHub或Email注册
3. 创建新项目（Organization → New Project）
   - Name: `pocd-research`
   - Database Password: 自己设置一个强密码（记住它）
   - Region: 选择 `Northeast Asia (Tokyo)` 或 `Southeast Asia (Singapore)`（离中国近）

### 2. 配置数据库
1. 等待项目初始化完成（约2分钟）
2. 左侧菜单 → **SQL Editor**
3. 点击 "+ New query"
4. 复制 `supabase_schema.sql` 的全部内容，粘贴进去
5. 点击右下角 **RUN** 按钮
6. 看到 "Success. No rows returned" 说明成功

### 3. 开启匿名登录（简化版，不需要注册）
1. 左侧菜单 → **Authentication** → **Providers**
2. 找到 **Email** 提供商
3. 打开 **Enable Email provider** 开关
4. **取消勾选** "Confirm email" （允许匿名使用）
5. 点击 **Save**

### 4. 获取API密钥
1. 左侧菜单 → **Project Settings**（齿轮图标）→ **API**
2. 复制以下两个值：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGci...` （很长的字符串）

---

## ⚙️ 配置PWA应用

### 第一步：创建配置文件
在 `pwa_app` 文件夹中创建 `config.js`：

```javascript
// Supabase配置（替换成你自己的）
const SUPABASE_CONFIG = {
    url: 'https://你的项目ID.supabase.co',  // ← 改这里
    anonKey: '你的anon-key'  // ← 改这里
};
```

### 第二步：测试连接
1. 用 `python -m http.server 8000` 启动本地服务器
2. 手机浏览器访问 `http://你的电脑IP:8000`
3. 首次打开会自动创建匿名账户
4. 添加一个测试患者，刷新页面看数据是否保留

---

## 🚀 部署到云端

### 方式1：Vercel（推荐，最简单）

1. **安装Vercel CLI**（如果没有）：
   ```powershell
   npm install -g vercel
   ```

2. **部署**：
   ```powershell
   cd pwa_app
   vercel
   ```

3. **按提示操作**：
   - Set up and deploy? **Y**
   - Which scope? 选你的账户
   - Link to existing project? **N**
   - What's your project's name? `pocd-research`
   - In which directory is your code located? `./`
   - Want to override settings? **N**

4. **完成**：
   - 获得一个 `https://pocd-research.vercel.app` 网址
   - 手机访问这个网址，添加到主屏幕

---

### 方式2：GitHub Pages（免费，但需要手动配置）

1. **上传代码到GitHub**：
   - 创建新仓库 `pocd-research`
   - 上传 `pwa_app` 文件夹所有文件

2. **开启GitHub Pages**：
   - 仓库 Settings → Pages
   - Source: 选 `main` 分支
   - 点 Save

3. **等待5分钟**，访问：
   ```
   https://你的用户名.github.io/pocd-research/
   ```

---

## 🔒 安全注意事项

### ⚠️ 重要：配置文件安全
`config.js` 包含你的Supabase密钥，但这是**公开安全的**，因为：
- 使用的是 `anon` 密钥（公开密钥）
- 数据库已配置RLS（行级安全），用户只能访问自己的数据
- 不包含任何服务器密钥或管理员权限

### 🛡️ 如果担心被滥用
在Supabase后台设置：
1. **Authentication** → **URL Configuration**
2. **Site URL**: 设置为你的部署网址（如 `https://pocd-research.vercel.app`）
3. **Redirect URLs**: 同上
4. 这样只有从你的网址访问才能登录

---

## 📱 手机使用

### iOS（iPhone/iPad）
1. Safari浏览器打开部署后的网址
2. 点击底部 **分享** 按钮
3. 选择 **添加到主屏幕**
4. 点击右上角 **添加**
5. 主屏幕出现App图标，点击使用

### Android
1. Chrome浏览器打开网址
2. 浏览器会自动弹出 "添加到主屏幕" 提示
3. 如果没弹出，点右上角 **⋮** → **安装应用**
4. 主屏幕出现App图标

---

## 🧪 测试清单

部署完成后，测试以下功能：

- [ ] 添加患者（含入组日期、手术日期）
- [ ] 刷新页面，数据依然存在
- [ ] 换一台设备登录同一账号，能看到相同数据
- [ ] 今日任务列表正确显示红色/黄色/绿色
- [ ] 点击患者进入详情页，看到6个时间节点
- [ ] 填写T0数据，保存后标记为已完成
- [ ] 离线时能查看已加载的数据（Service Worker）

---

## ❓ 常见问题

### Q1: 提示 "Failed to fetch"
**原因**：Supabase配置错误
**解决**：检查 `config.js` 中的 `url` 和 `anonKey` 是否正确复制

### Q2: 数据保存后消失
**原因**：数据库RLS策略未生效，或未登录
**解决**：
1. 打开浏览器开发者工具（F12）→ Console
2. 看到 "User created: ..." 说明已登录
3. 如果没有，刷新页面重新初始化

### Q3: 换设备后看不到数据
**原因**：匿名账户是设备独立的
**解决方案**：
- **临时方案**：用同一台设备
- **长期方案**：V3.0加入邮箱登录功能

### Q4: 想清空所有测试数据重来
**步骤**：
1. Supabase后台 → **Table Editor**
2. 选择 `patients` 表 → 删除所有行
3. `patient_data` 表会自动级联删除

---

## 📞 需要帮助？

如果遇到问题，告诉我：
1. 卡在哪一步？
2. 浏览器Console有什么错误信息？
3. 截图给我看看

准备好了就开始部署！🚀
