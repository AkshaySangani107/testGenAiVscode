import * as vscode from 'vscode'

export class StatusBarManager {
    private readonly statusBarItem: vscode.StatusBarItem

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        )
        this.statusBarItem.command = 'testgenai.generateCurrentFile'
        this.showIdle()
    }

    public showIdle(): void {
        this.statusBarItem.text = '$(beaker) TestGenAI'
        this.statusBarItem.tooltip = 'Click to generate unit tests for current file'
        this.statusBarItem.show()
    }

    public showWorking(message: string): void {
        this.statusBarItem.text = `$(sync~spin) ${message}`
        this.statusBarItem.tooltip = 'TestGenAI is processing...'
        this.statusBarItem.show()
    }

    public showSuccess(message: string): void {
        this.statusBarItem.text = `$(check) TestGenAI: ${message}`
        this.statusBarItem.tooltip = 'Test generation completed'
        this.statusBarItem.show()
        setTimeout(() => this.showIdle(), 8000)
    }

    public showError(message: string): void {
        this.statusBarItem.text = `$(alert) TestGenAI: ${message}`
        this.statusBarItem.tooltip = 'Click to retry generation'
        this.statusBarItem.show()
        setTimeout(() => this.showIdle(), 8000)
    }

    public dispose(): void {
        this.statusBarItem.dispose()
    }
}
