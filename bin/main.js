'use strict'

/**
 * Start both HTTP API and worker processes. If there is an error then
 * terminate all and exit by code 1.
 *
 * @file
 */

const path = require('path')
const childProcess = require('child_process')

function main() {
    let processes = [
        startApi(),
        startWorker()
    ]
    monitorProcesses(processes)
}

/**
 *
 * @return {childProcess.ChildProcess}
 */
function startApi() {
    let apiBinFile = path.join(__dirname, 'api.js')
    let spawnOptions = {
        stdio: [process.stdin, process.stdout, process.stderr]
    }
    return childProcess.spawn('node', [apiBinFile], spawnOptions)
}

/**
 *
 * @return {childProcess.ChildProcess}
 */
function startWorker() {
    let workerBinFile = path.join(__dirname, 'worker.js')
    let spawnOptions = {
        stdio: [process.stdin, process.stdout, process.stderr]
    }
    return childProcess.spawn(
        'node',
        [workerBinFile],
        spawnOptions
    )
}

/**
 *
 * @param {Array<childProcess.ChildProcess>} processes
 */
function monitorProcesses(processes) {
    for (let process of processes) {
        process.on('exit', () => killProcessesThenExit(processes))
        process.on('SIGINT', () => killProcessesThenExit(processes))
        process.on('SIGTERM', () => killProcessesThenExit(processes))
    }
}

/**
 *
 * @param {Array<childProcess.ChildProcess>} processes
 */
function killProcessesThenExit(processes) {
    for (let process of processes) {
        if (process.exitCode === null) {
            process.kill()
        }
    }
    process.exit(1)
}

main()
