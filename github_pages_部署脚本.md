# GitHub Pages 重新部署脚本

## 前提条件
1. 已有GitHub账号：04JiahaoChu
2. pwa_app文件夹包含所有必需文件

## 步骤1：在GitHub网页创建仓库

1. 访问 https://github.com/new
2. 填写：
   - Repository name: `pocd-research`
   - Description: POCD研究数据采集系统
   - **勾选 Public**（必须公开才能用GitHub Pages免费版）
   - 不勾选 "Initialize with README"
3. 点击 "Create repository"

## 步骤2：本地初始化Git并推送

在PowerShell中执行：

```powershell
# 进入pwa_app目录
cd "D:\褚嘉豪\杭州医学院\科研论文\2026.4.28POCD+机器学习（省创-进行中）\pwa_app"

# 初始化Git仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: POCD研究数据采集PWA V2.3"

# 设置分支名为main
git branch -M main

# 添加远程仓库
git remote add origin https://github.com/04JiahaoChu/pocd-research.git

# 推送到GitHub
git push -u origin main
```

## 步骤3：启用GitHub Pages

1. 访问 https://github.com/04JiahaoChu/pocd-research/settings/pages
2. Source: 选择 `Deploy from a branch`
3. Branch: 选择 `main` 分支，文件夹选 `/ (root)`
4. 点击 Save
5. 等待2-3分钟，刷新页面看到绿色提示："Your site is live at https://04jiahaochu.github.io/pocd-research/"

## 步骤4：测试访问

访问：https://04jiahaochu.github.io/pocd-research/

## 注意事项

1. **必须是Public仓库**才能免费使用GitHub Pages
2. 第一次部署需要等待2-5分钟
3. 每次修改代码后，需要git push才能更新网站
4. 所有访问这个网址的人都使用同一个Supabase数据库
