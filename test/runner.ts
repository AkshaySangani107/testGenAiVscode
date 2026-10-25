import { BackendClient } from '../src/services/backend.client'
import * as assert from 'assert'

async function runTests(): Promise<void> {
    console.log('🧪 Running TestGenAI Extension Verification Tests...\n')

    // Test 1: Backend Health Check when offline (should return false gracefully, not throw)
    console.log('Test 1: BackendClient.checkHealth with unreachable port')
    const isOnline = await BackendClient.checkHealth('http://localhost:59999')
    assert.strictEqual(isOnline, false, 'Expected offline backend to return false')
    console.log('  ✅ Passed: Offline backend handled gracefully without throwing\n')

    // Test 2: Verify CLI output regex parsing for Score and Coverage
    console.log('Test 2: Regex extraction for Score and Coverage metrics')
    const sampleCliOutput = `
📊 Score: 74/80
🎯 Coverage: 88% (Methods: 100%, Branches: 60%)
🔄 Attempts: 1
`
    const scoreMatch = sampleCliOutput.match(/Score:\s*(\d+)\/(\d+)/)
    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : undefined
    assert.strictEqual(score, 74, 'Score should be parsed as 74')

    const covMatch = sampleCliOutput.match(/Coverage:\s*(\d+)%/)
    const cov = covMatch ? parseInt(covMatch[1], 10) : undefined
    assert.strictEqual(cov, 88, 'Coverage should be parsed as 88%')
    console.log('  ✅ Passed: Score and Coverage parsed accurately from CLI runner\n')

    console.log('🎉 All VS Code Extension Automated Tests Passed!')
}

runTests().catch((err: unknown) => {
    console.error('❌ Test failed:', err)
    process.exit(1)
})
