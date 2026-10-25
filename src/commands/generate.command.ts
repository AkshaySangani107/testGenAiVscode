import * as vscode from 'vscode'
import * as path from 'path'
import { ConfigService } from '../services/config.service'
import { BackendClient } from '../services/backend.client'
import { StatusBarManager } from '../utils/status-bar'
import { DiffViewer } from '../views/diff.viewer'
import { getLogger, log } from '../utils/logger'

export async function handleGenerateCommand(
    uri: vscode.Uri | undefined,
    statusBar: StatusBarManager
): Promise<void> {
    const logger = getLogger()
    logger.show(true)
    log('=== TestGenAI: Generate Unit Tests Triggered ===')

    const targetUri = uri || vscode.window.activeTextEditor?.document.uri
    if (!targetUri) {
        log('Warning: No target file selected or open.')
        vscode.window.showWarningMessage('Please open or right-click a TypeScript service file to generate tests.')
        return
    }

    const filePath = targetUri.fsPath
    log(`Target file: ${filePath}`)

    if (!filePath.endsWith('.ts') || filePath.endsWith('.spec.ts')) {
        log('Warning: Selected file is not an eligible .ts service file.')
        vscode.window.showWarningMessage('TestGenAI generates tests for .ts files (excluding .spec.ts).')
        return
    }

    const config = ConfigService.getConfig()
    statusBar.showWorking('Checking backend...')
    log(`Checking backend at ${config.backendUrl}...`)

    const isHealthy = await BackendClient.checkHealth(config.backendUrl)
    if (!isHealthy) {
        statusBar.showError('Backend Offline')
        log(`Error: Backend is offline at ${config.backendUrl}`)
        const action = await vscode.window.showErrorMessage(
            `TestGenAI backend is offline at ${config.backendUrl}. Please start it with 'npm run start:dev'.`,
            'Open Settings'
        )
        if (action === 'Open Settings') {
            vscode.commands.executeCommand('workbench.action.openSettings', 'testgenai')
        }
        return
    }

    const fileName = path.basename(filePath)
    log(`Backend online. Initiating test generation loop for ${fileName}...`)

    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: `TestGenAI: Generating tests for ${fileName}...`,
            cancellable: false,
        },
        async (progress) => {
            statusBar.showWorking(`Testing ${fileName}...`)
            progress.report({ message: 'Running AST parsing and AI generation loop...' })

            const result = await BackendClient.runCli(
                filePath,
                config.backendUrl,
                config.minCoverage,
                false,
                (chunk) => {
                    if (chunk.includes('attempt 2')) {
                        progress.report({ message: 'Refining test assertions (attempt 2)...' })
                    } else if (chunk.includes('attempt 3')) {
                        progress.report({ message: 'Finalizing mocks and compilation (attempt 3)...' })
                    } else if (chunk.includes('Expanding')) {
                        progress.report({ message: 'Closing coverage gaps...' })
                    }
                }
            )

            if (result.success && result.specPath) {
                const scoreInfo = result.score ? `Score: ${result.score}/80` : ''
                const covInfo = result.coverage ? `Coverage: ${result.coverage}%` : ''
                const details = [scoreInfo, covInfo].filter(Boolean).join(' | ')

                statusBar.showSuccess(details || 'Accepted')
                log(`✅ Generation completed successfully. ${details}`)
                vscode.window.showInformationMessage(
                    `✅ Test suite generated successfully! ${details ? `(${details})` : ''}`
                )

                await DiffViewer.openGeneratedSpec(result.specPath)
            } else {
                statusBar.showError('Failed')
                log(`❌ Generation failed: ${result.error || 'Unknown error'}`)
                vscode.window.showErrorMessage(
                    `❌ Test generation failed: ${result.error || 'Check TestGenAI output panel for details.'}`
                )
            }
        }
    )
}
