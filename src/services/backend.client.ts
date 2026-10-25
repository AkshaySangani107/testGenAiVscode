import * as http from 'http'
import * as https from 'https'
import { exec } from 'child_process'
import * as path from 'path'
import * as fs from 'fs'
import { log } from '../utils/logger'

export interface GenerationOutput {
    success: boolean
    output: string
    specPath?: string
    score?: number
    coverage?: number
    error?: string
}

export class BackendClient {
    public static async checkHealth(apiUrl: string): Promise<boolean> {
        return new Promise((resolve) => {
            try {
                const url = new URL(`${apiUrl}/health`)
                const client = url.protocol === 'https:' ? https : http
                const req = client.get(url, { timeout: 4000 }, (res) => {
                    resolve(res.statusCode === 200)
                })
                req.on('error', () => resolve(false))
                req.on('timeout', () => {
                    req.destroy()
                    resolve(false)
                })
            } catch {
                resolve(false)
            }
        })
    }

    public static runCli(
        sourceFilePath: string,
        apiUrl: string,
        minCoverage: number,
        expand = false,
        onProgress?: (data: string) => void
    ): Promise<GenerationOutput> {
        return new Promise((resolve) => {
            const expandFlag = expand ? '-e' : ''
            
            // Resolve direct CLI script path if available
            const defaultCliJs = '/media/akshay/3ee97566-4736-4145-8ff8-e24a7d55ab831/esparkBiz/TestGenAI/testgenai-cli/dist/index.js'
            const defaultNodeBin = '/home/akshay/.nvm/versions/node/v24.12.0/bin/node'

            const nodeBin = fs.existsSync(defaultNodeBin) ? defaultNodeBin : 'node'
            const cliInvocation = fs.existsSync(defaultCliJs)
                ? `"${nodeBin}" "${defaultCliJs}"`
                : 'testgenai'

            const command = `${cliInvocation} "${sourceFilePath}" -C ${minCoverage} ${expandFlag} -y -u "${apiUrl}"`
            log(`Executing: ${command}`)

            const extendedPath = [
                '/home/akshay/.nvm/versions/node/v24.12.0/bin',
                '/usr/local/bin',
                '/usr/bin',
                '/bin',
                process.env.PATH || ''
            ].join(':')

            const child = exec(command, {
                cwd: path.dirname(sourceFilePath),
                env: { ...process.env, PATH: extendedPath }
            })

            let fullOutput = ''
            let errOutput = ''

            child.stdout?.on('data', (chunk: Buffer | string) => {
                const str = chunk.toString()
                fullOutput += str
                log(str.trimEnd())
                onProgress?.(str)
            })

            child.stderr?.on('data', (chunk: Buffer | string) => {
                const str = chunk.toString()
                errOutput += str
                log(`[stderr] ${str.trimEnd()}`)
                onProgress?.(str)
            })

            child.on('close', (code) => {
                log(`Process exited with code ${code}`)

                // Parse score: Score: 72/80
                const scoreMatch = fullOutput.match(/Score:\s*(\d+)\/(\d+)/)
                const score = scoreMatch ? parseInt(scoreMatch[1], 10) : undefined

                // Parse coverage: Coverage: 85%
                const covMatch = fullOutput.match(/Coverage:\s*(\d+)%/)
                const coverage = covMatch ? parseInt(covMatch[1], 10) : undefined

                const parsed = path.parse(sourceFilePath)
                const specPath = path.join(parsed.dir, `${parsed.name}.spec${parsed.ext}`)

                if (code === 0) {
                    resolve({
                        success: true,
                        output: fullOutput,
                        specPath,
                        score,
                        coverage
                    })
                } else {
                    resolve({
                        success: false,
                        output: fullOutput,
                        error: errOutput || 'TestGenAI CLI execution exited with non-zero status',
                        specPath,
                        score,
                        coverage
                    })
                }
            })
        })
    }
}
