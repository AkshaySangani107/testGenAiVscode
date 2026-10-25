import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'
import { ConfigService } from '../services/config.service'
import { BackendClient } from '../services/backend.client'
import { StatusBarManager } from '../utils/status-bar'
import { DiffViewer } from '../views/diff.viewer'
import { getLogger, log } from '../utils/logger'

export async function handleExpandCommand(
    uri: vscode.Uri | undefined,
    statusBar: StatusBarManager
): Promise<void> {
    const logger = getLogger()
    logger.show(true)
    log('=== TestGenAI: Expand Test Coverage Triggered ===')

    const targetUri = uri || vscode.window.activeTextEditor?.document.uri
    if (!targetUri) {
        log('Warning: No target file selected.')
        vscode.window.showWarningMessage('Please select a service file to expand test coverage.')
        return
    }

    const filePath = targetUri.fsPath
    log(`Target file: ${filePath}`)

    const parsed = path.parse(filePath)
    const specPath = path.join(parsed.dir, `${parsed.name}.spec${parsed.ext}`)

    if (!fs.existsSync(specPath)) {
        log(`No existing spec found at ${specPath}`)
        const choice = await vscode.window.showInformationMessage(
            `No existing spec found at ${path.basename(specPath)}. Would you like to generate a new test suite instead?`,
            'Generate Tests',
            'Cancel'
        )
        if (choice === 'Generate Tests') {
            vscode.commands.executeCommand('testgenai.generateCurrentFile', targetUri)
        }
        return
    }

    const config = ConfigService.getConfig()
    statusBar.showWorking('Expanding test suite...')
    log(`Expanding test suite for ${parsed.name} with min-coverage ${config.minCoverage}%...`)

    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: `TestGenAI: Expanding coverage for ${parsed.name}...`,
            cancellable: false,
        },
        async (progress) => {
            progress.report({ message: 'Analyzing missing methods and error branches...' })

            const result = await BackendClient.runCli(
                filePath,
                config.backendUrl,
                config.minCoverage,
                true,
                (chunk) => {
                    if (chunk.includes('Expanding')) {
                        progress.report({ message: 'Synthesizing targeted expansion tests...' })
                    }
                }
            )

            if (result.success && result.specPath) {
                const covInfo = result.coverage ? `Coverage: ${result.coverage}%` : 'Coverage expanded'
                statusBar.showSuccess(covInfo)
                log(`🎯 Expansion completed: ${covInfo}`)
                vscode.window.showInformationMessage(
                    `🎯 Test coverage expanded successfully! (${covInfo})`
                )
                await DiffViewer.openGeneratedSpec(result.specPath)
            } else {
                statusBar.showError('Expansion Failed')
                log(`❌ Expansion failed: ${result.error || 'Unknown error'}`)
                vscode.window.showErrorMessage(
                    `Failed to expand test suite: ${result.error || 'Check TestGenAI output panel.'}`
                )
            }
        }
    )
}
