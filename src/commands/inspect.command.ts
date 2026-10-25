import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'

let outputChannel: vscode.OutputChannel | undefined

function getOutputChannel(): vscode.OutputChannel {
    if (!outputChannel) {
        outputChannel = vscode.window.createOutputChannel('TestGenAI Coverage Report')
    }
    return outputChannel
}

export async function handleInspectCommand(
    uri: vscode.Uri | undefined
): Promise<void> {
    const targetUri = uri || vscode.window.activeTextEditor?.document.uri
    if (!targetUri) {
        vscode.window.showWarningMessage('Please select a service file to inspect coverage.')
        return
    }

    const filePath = targetUri.fsPath
    const parsed = path.parse(filePath)
    const specPath = path.join(parsed.dir, `${parsed.name}.spec${parsed.ext}`)

    const channel = getOutputChannel()
    channel.clear()
    channel.show(true)

    channel.appendLine(`====================================================`)
    channel.appendLine(`🔍 TestGenAI Coverage Gap Analysis`)
    channel.appendLine(`Target Service: ${path.basename(filePath)}`)
    channel.appendLine(`Spec File:      ${fs.existsSync(specPath) ? path.basename(specPath) : 'NOT FOUND'}`)
    channel.appendLine(`====================================================\n`)

    if (!fs.existsSync(specPath)) {
        channel.appendLine(`⚠️  No existing test spec file found.`)
        channel.appendLine(`Run 'TestGenAI: Generate Unit Tests' to create a comprehensive test suite.`)
        return
    }

    const specContent = fs.readFileSync(specPath, 'utf8')
    const sourceContent = fs.readFileSync(filePath, 'utf8')

    // Extract methods via simple AST scan
    const methodMatches = sourceContent.matchAll(/(?:public\s+)?(?:async\s+)?([a-zA-Z0-9_]+)\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*\{/g)
    const methods: string[] = []
    for (const match of methodMatches) {
        const name = match[1]
        if (!['constructor', 'if', 'switch', 'for', 'while', 'catch'].includes(name)) {
            methods.push(name)
        }
    }

    const covered: string[] = []
    const uncovered: string[] = []

    methods.forEach((m) => {
        if (specContent.includes(`.${m}(`) || specContent.includes(`'${m}'`) || specContent.includes(`"${m}"`)) {
            covered.push(m)
        } else {
            uncovered.push(m)
        }
    })

    const pct = methods.length > 0 ? Math.round((covered.length / methods.length) * 100) : 100

    channel.appendLine(`📊 Method Coverage: ${pct}% (${covered.length}/${methods.length} methods tested)`)
    channel.appendLine(`\n✅ Tested Methods:`)
    covered.forEach((m) => channel.appendLine(`   • ${m}`))

    if (uncovered.length > 0) {
        channel.appendLine(`\n⚠️  Untested Methods (Coverage Gaps):`)
        uncovered.forEach((m) => channel.appendLine(`   • ${m}`))
        channel.appendLine(`\n💡 Tip: Run 'TestGenAI: Expand Test Coverage' to automatically generate tests for missing methods.`)
    } else {
        channel.appendLine(`\n🎉 All public methods are covered in the test suite!`)
    }
}
