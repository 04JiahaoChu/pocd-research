-- POCD研究数据库 - 匿名访问版本（团队共享）
-- 执行日期：2026-08-11
-- 说明：允许所有人无需登录即可访问和修改数据

-- ===========================
-- 第1步：删除旧的RLS策略
-- ===========================

DROP POLICY IF EXISTS "用户只能查看自己的患者" ON patients;
DROP POLICY IF EXISTS "用户只能创建自己的患者" ON patients;
DROP POLICY IF EXISTS "用户只能更新自己的患者" ON patients;
DROP POLICY IF EXISTS "用户只能删除自己的患者" ON patients;

DROP POLICY IF EXISTS "用户只能查看自己患者的数据" ON patient_data;
DROP POLICY IF EXISTS "用户只能插入自己患者的数据" ON patient_data;
DROP POLICY IF EXISTS "用户只能更新自己患者的数据" ON patient_data;
DROP POLICY IF EXISTS "用户只能删除自己患者的数据" ON patient_data;

DROP POLICY IF EXISTS "允许所有人查看患者数据" ON patients;
DROP POLICY IF EXISTS "允许所有人插入患者数据" ON patients;
DROP POLICY IF EXISTS "允许所有人更新患者数据" ON patients;
DROP POLICY IF EXISTS "允许所有人删除患者数据" ON patients;

DROP POLICY IF EXISTS "允许所有人查看评估数据" ON patient_data;
DROP POLICY IF EXISTS "允许所有人插入评估数据" ON patient_data;
DROP POLICY IF EXISTS "允许所有人更新评估数据" ON patient_data;
DROP POLICY IF EXISTS "允许所有人删除评估数据" ON patient_data;

-- ===========================
-- 第2步：创建新的匿名访问策略
-- ===========================

-- 患者表 - 允许所有人访问
CREATE POLICY "匿名用户可以查看所有患者"
    ON patients FOR SELECT
    USING (true);

CREATE POLICY "匿名用户可以创建患者"
    ON patients FOR INSERT
    WITH CHECK (true);

CREATE POLICY "匿名用户可以更新患者"
    ON patients FOR UPDATE
    USING (true);

CREATE POLICY "匿名用户可以删除患者"
    ON patients FOR DELETE
    USING (true);

-- 患者数据表 - 允许所有人访问
CREATE POLICY "匿名用户可以查看所有数据"
    ON patient_data FOR SELECT
    USING (true);

CREATE POLICY "匿名用户可以创建数据"
    ON patient_data FOR INSERT
    WITH CHECK (true);

CREATE POLICY "匿名用户可以更新数据"
    ON patient_data FOR UPDATE
    USING (true);

CREATE POLICY "匿名用户可以删除数据"
    ON patient_data FOR DELETE
    USING (true);

-- ===========================
-- 完成！
-- ===========================

SELECT
    '✅ 匿名访问已启用！' AS status,
    '所有人无需登录即可使用' AS access_mode,
    '适合团队共享数据' AS use_case;
