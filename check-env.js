#!/usr/bin/env node
/**
 * 🔍 Vercel 環境變數檢查腳本
 * 用於快速驗證環境變數設定是否正確
 * 
 * 使用方法: node check-env.js
 */

console.log('🔍 開始檢查環境變數...\n');

// 必要環境變數清單
const REQUIRED_VARS = [
  'NEXT_PUBLIC_RAGIC_API_KEY',
  'NEXT_PUBLIC_RAGIC_ACCOUNT', 
  'NEXT_PUBLIC_RAGIC_BASE_URL',
  'NEXT_PUBLIC_RAGIC_FORM_ID',
  'NEXT_PUBLIC_RAGIC_SUBTABLE_ID'
];

// 重要環境變數清單
const IMPORTANT_VARS = [
  'NEXTAUTH_SECRET',
  'NEXT_PUBLIC_API_BASE_URL',
  'NEXT_PUBLIC_CACHE_TTL'
];

// 可選環境變數清單
const OPTIONAL_VARS = [
  'NEXT_PUBLIC_RAGIC_ADD_RECORD_ID',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'ADMIN_EMAIL',
  'NOTIFICATION_FROM_EMAIL'
];

let hasErrors = false;
let hasWarnings = false;

console.log('📋 必要環境變數檢查:');
console.log(''.padEnd(50, '='));

REQUIRED_VARS.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: 未設定`);
    hasErrors = true;
  } else {
    // 隱藏敏感資訊
    const displayValue = varName.includes('API_KEY') || varName.includes('SECRET') 
      ? `(已設定, 長度: ${value.length})`
      : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  }
});

console.log('\n📋 重要環境變數檢查:');
console.log(''.padEnd(50, '='));

IMPORTANT_VARS.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`⚠️  ${varName}: 未設定`);
    hasWarnings = true;
  } else {
    const displayValue = varName.includes('API_KEY') || varName.includes('SECRET') 
      ? `(已設定, 長度: ${value.length})`
      : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  }
});

console.log('\n📋 可選環境變數檢查:');
console.log(''.padEnd(50, '='));

OPTIONAL_VARS.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`➖ ${varName}: 未設定`);
  } else {
    const displayValue = varName.includes('PASS') || varName.includes('SECRET') 
      ? `(已設定, 長度: ${value.length})`
      : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  }
});

// 特殊檢查：Ragic 配置一致性
console.log('\n🔍 特殊檢查:');
console.log(''.padEnd(50, '='));

const ragicAccount1 = process.env.NEXT_PUBLIC_RAGIC_ACCOUNT;
const ragicAccount2 = process.env.RAGIC_ACCOUNT;

if (ragicAccount1 && ragicAccount2 && ragicAccount1 !== ragicAccount2) {
  console.log(`⚠️  Ragic 帳號不一致: ${ragicAccount1} vs ${ragicAccount2}`);
  hasWarnings = true;
} else if (ragicAccount1) {
  console.log(`✅ Ragic 帳號一致: ${ragicAccount1}`);
}

// URL 格式檢查
const baseUrl = process.env.NEXT_PUBLIC_RAGIC_BASE_URL;
if (baseUrl && !baseUrl.startsWith('https://')) {
  console.log(`⚠️  RAGIC_BASE_URL 應使用 HTTPS: ${baseUrl}`);
  hasWarnings = true;
} else if (baseUrl) {
  console.log(`✅ RAGIC_BASE_URL 格式正確: ${baseUrl}`);
}

// 數值檢查
const formId = process.env.NEXT_PUBLIC_RAGIC_FORM_ID;
const subtableId = process.env.NEXT_PUBLIC_RAGIC_SUBTABLE_ID;

if (formId && isNaN(Number(formId))) {
  console.log(`⚠️  RAGIC_FORM_ID 應為數字: ${formId}`);
  hasWarnings = true;
}

if (subtableId && isNaN(Number(subtableId))) {
  console.log(`⚠️  RAGIC_SUBTABLE_ID 應為數字: ${subtableId}`);
  hasWarnings = true;
}

// 總結
console.log('\n📊 檢查總結:');
console.log(''.padEnd(50, '='));

if (hasErrors) {
  console.log('❌ 發現嚴重錯誤！請修正必要環境變數');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  發現警告項目，建議檢查');
  process.exit(0);
} else {
  console.log('✅ 所有環境變數檢查通過！');
  process.exit(0);
}
