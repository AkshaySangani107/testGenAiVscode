import * as vscode from 'vscode'
import * as fs from 'fs'

export class DiffViewer {
    public static async openGeneratedSpec(specPath: string): Promise<void> {
        if (!fs.existsSync(specPath)) return

        const uri = vscode.Uri.file(specPath)
        const document = await vscode.workspace.openTextDocument(uri)
        await vscode.window.showTextDocument(document, {
            preview: false,
            viewColumn: vscode.ViewColumn.Beside
        })
    }

    public static async showDiff(
        originalUri: vscode.Uri,
        modifiedUri: vscode.Uri,
        title: string
    ): Promise<void> {
        await vscode.commands.executeCommand(
            'vscode.diff',
            originalUri,
            modifiedUri,
            title,
            { preview: false, viewColumn: vscode.ViewColumn.Beside }
        )
    }
}
