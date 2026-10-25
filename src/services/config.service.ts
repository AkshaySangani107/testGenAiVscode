import * as vscode from 'vscode'

export interface TestGenAIConfig {
    backendUrl: string
    minCoverage: number
    showDiffBeforeSaving: boolean
    autoSaveAccepted: boolean
}

export class ConfigService {
    public static getConfig(): TestGenAIConfig {
        const config = vscode.workspace.getConfiguration('testgenai')

        return {
            backendUrl: config.get<string>('backendUrl', 'http://localhost:3000'),
            minCoverage: config.get<number>('minCoverage', 75),
            showDiffBeforeSaving: config.get<boolean>('showDiffBeforeSaving', true),
            autoSaveAccepted: config.get<boolean>('autoSaveAccepted', false),
        }
    }
}
