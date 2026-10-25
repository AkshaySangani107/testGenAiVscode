import * as vscode from 'vscode'
import { handleGenerateCommand } from './commands/generate.command'
import { handleExpandCommand } from './commands/expand.command'
import { handleInspectCommand } from './commands/inspect.command'
import { StatusBarManager } from './utils/status-bar'
import { log } from './utils/logger'

let statusBar: StatusBarManager | undefined

export function activate(context: vscode.ExtensionContext): void {
    log('TestGenAI Extension is active and ready!')
    statusBar = new StatusBarManager()
    context.subscriptions.push(statusBar)

    const generateCmd = vscode.commands.registerCommand(
        'testgenai.generateCurrentFile',
        (uri?: vscode.Uri) => handleGenerateCommand(uri, statusBar!)
    )

    const expandCmd = vscode.commands.registerCommand(
        'testgenai.expandCoverage',
        (uri?: vscode.Uri) => handleExpandCommand(uri, statusBar!)
    )

    const inspectCmd = vscode.commands.registerCommand(
        'testgenai.inspectGaps',
        (uri?: vscode.Uri) => handleInspectCommand(uri)
    )

    context.subscriptions.push(generateCmd, expandCmd, inspectCmd)
}

export function deactivate(): void {
    if (statusBar) {
        statusBar.dispose()
    }
}
