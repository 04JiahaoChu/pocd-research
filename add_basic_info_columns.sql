-- 给 patients 表添加基本信息字段（年龄、性别等）
-- 执行方式：复制到 Supabase Dashboard → SQL Editor → 粘贴运行

ALTER TABLE patients
ADD COLUMN IF NOT EXISTS age INTEGER,  -- 年龄
ADD COLUMN IF NOT EXISTS gender TEXT,  -- 性别（男/女）
ADD COLUMN IF NOT EXISTS education_years INTEGER,  -- 受教育年限
ADD COLUMN IF NOT EXISTS occupation TEXT,  -- 职业
ADD COLUMN IF NOT EXISTS bmi NUMERIC(4,1);  -- BMI（体重指数）

-- 添加注释
COMMENT ON COLUMN patients.age IS '年龄（岁）';
COMMENT ON COLUMN patients.gender IS '性别（男/女）';
COMMENT ON COLUMN patients.education_years IS '受教育年限（年）';
COMMENT ON COLUMN patients.occupation IS '职业';
COMMENT ON COLUMN patients.bmi IS 'BMI体重指数（kg/m²）';
