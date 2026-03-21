/**
 * k6 负载测试共享配置
 * 所有请求仅打 localhost:3000 + 本地 Supabase
 */

// 基础 URL — 本地 dev server
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'

// 本地 Supabase 配置
export const SUPABASE_URL = __ENV.SUPABASE_URL || 'http://127.0.0.1:54321'
export const SUPABASE_ANON_KEY = __ENV.SUPABASE_ANON_KEY || ''
export const SUPABASE_SERVICE_ROLE_KEY = __ENV.SUPABASE_SERVICE_ROLE_KEY || ''

// 性能基准阈值
export const THRESHOLDS = {
  // API 端点 P95 < 500ms
  http_req_duration: ['p(95)<500'],
  // 页面渲染 P95 < 2000ms
  'http_req_duration{type:page}': ['p(95)<2000'],
  // API 端点 P95 < 500ms（带 tag）
  'http_req_duration{type:api}': ['p(95)<500'],
  // 错误率 < 1%
  http_req_failed: ['rate<0.01'],
}

// 负载阶段定义
export const STAGES = {
  smoke: [
    { duration: '10s', target: 1 },
    { duration: '20s', target: 1 },
  ],
  load: [
    { duration: '30s', target: 10 },   // 渐增到 10 VU
    { duration: '1m', target: 50 },     // 渐增到 50 VU
    { duration: '3m', target: 50 },     // 维持 50 VU
    { duration: '30s', target: 0 },     // 渐降
  ],
  stress: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '1m', target: 100 },    // 极限 100 VU
    { duration: '1m', target: 100 },    // 维持
    { duration: '30s', target: 0 },
  ],
}

// 测试用工单数据（符合 ticketCreateSchema）
export const TEST_TICKET_DATA = {
  title: 'Load Test - Data Cleanup Request for CRM Import',
  category: 'data_cleanup_import_prep',
  problem_summary:
    'We have approximately 5000 customer records exported from Salesforce that contain duplicate entries, ' +
    'inconsistent phone number formats, and missing email addresses. These need to be cleaned before import.',
  expected_output:
    'A deduplicated CSV file with standardized phone numbers in E.164 format and flagged rows where email is missing.',
  acceptance_criteria_json: [
    {
      id: 'ac-1',
      description: 'All duplicate records merged by matching on company name + email domain',
      required: true,
    },
    {
      id: 'ac-2',
      description: 'Phone numbers converted to E.164 format with country code',
      required: true,
    },
  ],
  out_of_scope_json: ['Data enrichment from external sources'],
  sensitivity_level: 'standard',
  row_count_estimate: 5000,
  file_count_estimate: 1,
}
