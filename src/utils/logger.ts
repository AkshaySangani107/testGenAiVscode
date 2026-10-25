import * as vscode from 'vscode'

let channel: vscode.OutputChannel | undefined

export function getLogger(): vscode.OutputChannel {
    if (!channel) {
        channel = vscode.window.createOutputChannel('TestGenAI')
    }
    return channel
}

export function log(message: string): void {
    const ch = getLogger()
    const timestamp = new Date().toLocaleTimeString()
    ch.appendLine(`[${timestamp}] ${message}`)
}
