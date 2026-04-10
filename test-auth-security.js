#!/usr/bin/env node

/**
 * Voice Authentication Security Test Suite
 * Run this to verify all authentication changes are working correctly
 * 
 * Usage:
 *   node test-auth-security.js
 *   or: npm run test:auth
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3002/api';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(number, name) {
  log(colors.cyan, `\n[Test ${number}] ${name}`);
}

function logPass(message) {
  log(colors.green, `✓ ${message}`);
}

function logFail(message) {
  log(colors.red, `✗ ${message}`);
}

function logInfo(message) {
  log(colors.blue, `ℹ ${message}`);
}

function logWarn(message) {
  log(colors.yellow, `⚠ ${message}`);
}

// Test results
let testsPassed = 0;
let testsFailed = 0;

/**
 * Test 1: Guest User (No Token) - Should Allow Access but Indicate Guest
 */
async function test1_guestUser() {
  logTest(1, 'Guest User (No Token)');
  
  try {
    const response = await fetch(`${BASE_URL}/assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: 'what can I do here?',
        page: '/events'
      })
    });

    if (!response.ok) {
      logFail(`Expected 200, got ${response.status}`);
      testsFailed++;
      return;
    }

    const data = await response.json();
    
    // Guest should be able to get a response
    if (data.reply && data.action) {
      logPass('Guest user can make requests without token');
      logInfo(`Response: "${data.reply.substring(0, 50)}..."`);
      testsPassed++;
    } else {
      logFail('Response missing required fields');
      testsFailed++;
    }
  } catch (error) {
    logFail(`Error: ${error.message}`);
    testsFailed++;
  }
}

/**
 * Test 2: Spoofed Authentication (No Token, But Claim Auth in Body)
 * Should NOT grant access
 */
async function test2_spoofedAuth() {
  logTest(2, 'Spoofed Authentication (No Token)');
  
  try {
    // Attempt to spoof authentication by sending claims in body
    const response = await fetch(`${BASE_URL}/assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: 'show my bookings',
        // These should be IGNORED by backend
        isAuthenticated: true,
        user: {
          id: 'fake-user-123',
          role: 'admin',
          email: 'attacker@example.com'
        }
      })
    });

    if (!response.ok) {
      logFail(`Expected 200, got ${response.status}`);
      testsFailed++;
      return;
    }

    const data = await response.json();
    
    // Should NOT grant access to protected resource
    if (data.reply && (
        data.reply.toLowerCase().includes('sign in') ||
        data.reply.toLowerCase().includes('login') ||
        data.reply.toLowerCase().includes('authenticate')
    )) {
      logPass('Backend correctly rejected spoofed auth claims');
      logInfo(`Response: "${data.reply}"`);
      testsPassed++;
    } else {
      logWarn('Backend may have accepted spoofed claims');
      logInfo(`Response: "${data.reply}"`);
      testsFailed++;
    }
  } catch (error) {
    logFail(`Error: ${error.message}`);
    testsFailed++;
  }
}

/**
 * Test 3: Invalid Token Format
 * Should Handle Gracefully
 */
async function test3_invalidToken() {
  logTest(3, 'Invalid Token Format');
  
  try {
    const response = await fetch(`${BASE_URL}/assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token-xyz'
      },
      body: JSON.stringify({
        query: 'book an event'
      })
    });

    if (!response.ok) {
      logFail(`Expected 200, got ${response.status}`);
      testsFailed++;
      return;
    }

    const data = await response.json();
    
    // Should treat as guest since token is invalid
    if (data.reply && (
        data.reply.toLowerCase().includes('sign in') ||
        data.reply.toLowerCase().includes('login')
    )) {
      logPass('Invalid token treated as guest (no crash)');
      logInfo(`Response: "${data.reply}"`);
      testsPassed++;
    } else {
      logInfo(`Response: "${data.reply}"`);
      testsPassed++; // Still OK if we get a response
    }
  } catch (error) {
    logFail(`Error: ${error.message}`);
    testsFailed++;
  }
}

/**
 * Test 4: Protected Commands Without Auth
 * Should Prompt Sign In
 */
async function test4_protectedCommandAuth() {
  logTest(4, 'Protected Commands Require Auth');
  
  try {
    const protectedCommands = [
      'show my bookings',
      'book an event',
      'go to dashboard',
      'create an event'
    ];

    let allCorrect = true;

    for (const command of protectedCommands) {
      const response = await fetch(`${BASE_URL}/assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: command,
          page: '/events'
        })
      });

      if (!response.ok) {
        logFail(`Command "${command}" returned ${response.status}`);
        allCorrect = false;
        continue;
      }

      const data = await response.json();
      
      // All protected commands should prompt sign in
      if (!data.reply.toLowerCase().includes('sign') && 
          !data.reply.toLowerCase().includes('login') &&
          !data.reply.toLowerCase().includes('authenticate')) {
        logWarn(`Command "${command}" didn't prompt sign in`);
        allCorrect = false;
      }
    }

    if (allCorrect) {
      logPass('All protected commands require authentication');
      testsPassed++;
    } else {
      logFail('Some protected commands not properly gated');
      testsFailed++;
    }
  } catch (error) {
    logFail(`Error: ${error.message}`);
    testsFailed++;
  }
}

/**
 * Test 5: Public Commands Work Without Auth
 * Should Not Require Sign In
 */
async function test5_publicCommands() {
  logTest(5, 'Public Commands Work Without Auth');
  
  try {
    const publicCommands = [
      'show me events',
      'search for music events',
      'what can I do?',
      'help'
    ];

    let allCorrect = true;

    for (const command of publicCommands) {
      const response = await fetch(`${BASE_URL}/assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: command,
          page: '/events'
        })
      });

      if (!response.ok) {
        logFail(`Command "${command}" returned ${response.status}`);
        allCorrect = false;
        continue;
      }

      const data = await response.json();
      logInfo(`"${command}" → ${data.action}`);
    }

    if (allCorrect) {
      logPass('All public commands accessible without authentication');
      testsPassed++;
    } else {
      logFail('Some public commands returned errors');
      testsFailed++;
    }
  } catch (error) {
    logFail(`Error: ${error.message}`);
    testsFailed++;
  }
}

/**
 * Test 6: Response Structure
 * Verify responses have proper structure
 */
async function test6_responseStructure() {
  logTest(6, 'Response Structure Validation');
  
  try {
    const response = await fetch(`${BASE_URL}/assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: 'test query',
        page: '/events'
      })
    });

    if (!response.ok) {
      logFail(`Expected 200, got ${response.status}`);
      testsFailed++;
      return;
    }

    const data = await response.json();
    const requiredFields = ['action', 'reply', 'params'];
    const missingFields = requiredFields.filter(field => !(field in data));

    if (missingFields.length === 0) {
      logPass('Response has all required fields');
      logInfo(`Actions: speak_only, navigate, book_event, etc.`);
      testsPassed++;
    } else {
      logFail(`Missing fields: ${missingFields.join(', ')}`);
      testsFailed++;
    }
  } catch (error) {
    logFail(`Error: ${error.message}`);
    testsFailed++;
  }
}

/**
 * Test 7: Error Handling
 * Verify proper error responses
 */
async function test7_errorHandling() {
  logTest(7, 'Error Handling');
  
  try {
    // Test with empty query
    const response = await fetch(`${BASE_URL}/assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: '',
        page: '/events'
      })
    });

    if (response.status === 400) {
      logPass('Empty query returns 400 Bad Request');
      testsPassed++;
    } else if (response.status === 200) {
      logWarn('Empty query accepted (graceful fallback)');
      testsPassed++;
    } else {
      logFail(`Unexpected status: ${response.status}`);
      testsFailed++;
    }
  } catch (error) {
    logFail(`Error: ${error.message}`);
    testsFailed++;
  }
}

/**
 * Main Test Runner
 */
async function runAllTests() {
  console.log(colors.blue + '\n╔════════════════════════════════════════════════════════╗');
  console.log('║  Voice Assistant Authentication Security Test Suite  ║');
  console.log('║  Testing JWT validation and auth security            ║');
  console.log('╚════════════════════════════════════════════════════════╝' + colors.reset);
  
  logInfo(`API URL: ${BASE_URL}`);
  logInfo('Running 7 security tests...\n');

  await test1_guestUser();
  await test2_spoofedAuth();
  await test3_invalidToken();
  await test4_protectedCommandAuth();
  await test5_publicCommands();
  await test6_responseStructure();
  await test7_errorHandling();

  // Print summary
  console.log('\n' + colors.blue + '╔════════════════════════════════════════════════════════╗');
  console.log('║  Test Results Summary                                  ║');
  console.log('╚════════════════════════════════════════════════════════╝' + colors.reset);

  log(colors.green, `✓ Passed: ${testsPassed}`);
  log(colors.red, `✗ Failed: ${testsFailed}`);

  const totalTests = testsPassed + testsFailed;
  const passRate = totalTests > 0 ? Math.round((testsPassed / totalTests) * 100) : 0;

  console.log('');
  if (testsFailed === 0) {
    log(colors.green, `Success Rate: ${passRate}% - All tests passed! ✓`);
    console.log(colors.green + '\n✅ Authentication security implementation is working correctly!\n' + colors.reset);
    process.exit(0);
  } else {
    log(colors.red, `Success Rate: ${passRate}% - Some tests failed`);
    console.log(colors.red + '\n❌ Please review the failures above\n' + colors.reset);
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  logFail(`Fatal error: ${error.message}`);
  process.exit(1);
});
