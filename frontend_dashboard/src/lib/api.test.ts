/**
 * API Connection Test
 * 
 * This script tests the connection between frontend and backend.
 * Run this in the browser console to verify API connectivity.
 */

import { apiClient } from './api.config';

export async function testAPIConnection() {
  console.log('🧪 Testing API Connection...\n');
  
  const tests = [
    {
      name: 'Backend Root',
      test: async () => {
        const response = await apiClient.get('/');
        return response.data;
      }
    },
    {
      name: 'Driver Summary Stats',
      test: async () => {
        const response = await apiClient.get('/drivers/stats/summary');
        return response.data;
      }
    },
    {
      name: 'Order Stats',
      test: async () => {
        const response = await apiClient.get('/orders/stats');
        return response.data;
      }
    },
    {
      name: 'Active Driver Locations',
      test: async () => {
        const response = await apiClient.get('/drivers/active-locations');
        return response.data;
      }
    }
  ];

  const results = {
    passed: 0,
    failed: 0,
    errors: [] as any[]
  };

  for (const { name, test } of tests) {
    try {
      console.log(`Testing: ${name}...`);
      const result = await test();
      console.log(`✅ ${name} - PASSED`, result);
      results.passed++;
    } catch (error: any) {
      console.error(`❌ ${name} - FAILED`, error.message);
      results.failed++;
      results.errors.push({ test: name, error: error.message });
    }
  }

  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(({ test, error }) => {
      console.log(`  - ${test}: ${error}`);
    });
  }

  if (results.failed === 0) {
    console.log('\n🎉 All tests passed! Backend connection successful!');
  } else {
    console.log('\n⚠️ Some tests failed. Check backend is running and CORS is configured.');
  }

  return results;
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testAPIConnection = testAPIConnection;
}
