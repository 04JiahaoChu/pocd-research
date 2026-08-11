// Supabase配置文件
// 已配置完成 - 2026-08-09

const SUPABASE_CONFIG = {
    url: 'https://hzgpajksyfgvaxzytlpn.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6Z3BhamtzeWZndmF4enl0bHBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyODAwMTgsImV4cCI6MjEwMTg1NjAxOH0.yAJ2PqNSv6ZbA6KuU4I-MJn_RGny3gIf7sC5YmH4WBM'
};

// 警告配置
const WARNING_DAYS = 2;  // 提前几天显示"即将到期"

// 超期容错时间（天）
const OVERDUE_LIMITS = {
    POD1: 1,
    POD3: 2,
    POD7: 2,
    POD14: 3,
    POD30: 5
};
