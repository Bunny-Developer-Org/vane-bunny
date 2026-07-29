/* eslint-disable no-console */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');

// Parse CLI flags
const args = process.argv.slice(2);
let noBail = false;
let fullTestOutput = false;
let jsonOutput = false;
let jsonOutputPath = path.join(repoRoot, 'tmp', 'quality-check-report.json');

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '--no-bail') {
    noBail = true;
  } else if (arg === '--full-test-output') {
    fullTestOutput = true;
  } else if (arg === '--json-output' || arg.startsWith('--json-output=')) {
    jsonOutput = true;
    if (arg.startsWith('--json-output=')) {
      const customPath = arg.split('=', 2)[1];
      if (customPath) {
        jsonOutputPath = path.isAbsolute(customPath)
          ? customPath
          : path.resolve(repoRoot, customPath);
      }
    } else if (args[i + 1] && !args[i + 1].startsWith('-')) {
      jsonOutputPath = path.isAbsolute(args[i + 1])
        ? args[i + 1]
        : path.resolve(repoRoot, args[i + 1]);
      i += 1;
    }
  }
}

const testScriptArgs = fullTestOutput
  ? ['test']
  : ['test', '--', '--silent'];

const STEPS = [
  { id: 1, name: 'Format Check', cmd: 'npm', args: ['run', 'format:check'], dir: '.' },
  { id: 2, name: 'Type Check', cmd: 'npx', args: ['tsc', '--noEmit'], dir: '.' },
  { id: 3, name: 'Lint', cmd: 'npm', args: ['run', 'lint'], dir: '.' },
  {
    id: 4,
    name: 'Dependency Boundaries',
    cmd: 'npx',
    args: ['dependency-cruiser', '--config', '.dependency-cruiser.cjs', '--output-type', 'err-long', 'src', 'app'],
    dir: '.',
  },
  {
    id: 5,
    name: 'Dead Code Check',
    cmd: 'npx',
    args: ['fallow', 'dead-code', '--fail-on-issues'],
    dir: '.',
  },
  {
    id: 6,
    name: 'Duplicate Code Check',
    cmd: 'npx',
    args: ['fallow', 'dupes', '--fail-on-issues'],
    dir: '.',
  },
  {
    id: 7,
    name: 'Audit Dependencies',
    cmd: 'npm',
    args: ['audit', '--audit-level=moderate'],
    dir: '.',
  },
  { id: 8, name: 'Test', cmd: 'npm', args: testScriptArgs, dir: '.' },
];

function stripAnsi(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}

function parseIssues(step, rawOutput, exitCode) {
  if (exitCode === 0) return [];
  const output = stripAnsi(rawOutput);
  const issues = [];
  const lines = output.split('\n');

  if (step.name.includes('Format')) {
    for (const line of lines) {
      const match = /^\[warn\]\s+(.+)$/.exec(line.trim());
      if (match) {
        issues.push({
          type: 'format',
          file: match[1].trim(),
          message: 'Formatting issue detected by Prettier',
        });
      }
    }
  } else if (step.name.includes('Lint')) {
    let currentFile = '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (
        trimmed.length > 0 &&
        !trimmed.startsWith('>') &&
        !trimmed.startsWith('npm ') &&
        !trimmed.startsWith('✖') &&
        (trimmed.endsWith('.ts') || trimmed.endsWith('.tsx') || trimmed.endsWith('.js') || trimmed.endsWith('.jsx')) &&
        !trimmed.includes(':')
      ) {
        currentFile = trimmed;
        continue;
      }
      const lintMatch = /^\s*(\d+):(\d+)\s+(error|warning)\s+(.*?)(?:\s{2,}([a-z0-9-/]+))?$/i.exec(
        line,
      );
      if (lintMatch) {
        issues.push({
          type: 'lint',
          file: currentFile || 'unknown',
          line: Number(lintMatch[1]),
          column: Number(lintMatch[2]),
          severity: lintMatch[3].toLowerCase(),
          message: lintMatch[4].trim(),
          rule: lintMatch[5] || '',
        });
      }
    }
  } else if (step.name.includes('Type Check')) {
    for (const line of lines) {
      const tscMatch =
        /^([^\s(:]+)(?::|\()(\d+)(?:,|:)(\d+)\)?:?\s*(?:-\s*)?(error|warning)?\s*(TS\d+)?:?\s*(.*)$/i.exec(
          line.trim(),
        );
      if (tscMatch && (tscMatch[5] || tscMatch[4])) {
        issues.push({
          type: 'typecheck',
          file: tscMatch[1],
          line: Number(tscMatch[2]),
          column: Number(tscMatch[3]),
          severity: (tscMatch[4] || 'error').toLowerCase(),
          code: tscMatch[5] || '',
          message: tscMatch[6].trim(),
        });
      }
    }
  } else if (step.name.includes('Test')) {
    let currentFile = '';
    for (const line of lines) {
      if (line.includes('FAIL ')) {
        currentFile = line.replace(/.*FAIL\s+/, '').trim();
      }
      const testFailMatch = /^\s*●\s+(.*?)$/.exec(line);
      if (testFailMatch) {
        issues.push({
          type: 'test',
          file: currentFile || 'unknown',
          testName: testFailMatch[1].trim(),
          message: 'Test failed',
        });
      }
    }
  } else if (step.name.includes('Code Check')) {
    let currentFile = '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('src\\') || trimmed.startsWith('src/') || trimmed.startsWith('app\\') || trimmed.startsWith('app/')) {
        currentFile = trimmed.split(' ')[0];
      }
      if (trimmed.startsWith(':')) {
        issues.push({
          type: 'dead-code',
          file: currentFile || 'unknown',
          message: trimmed,
        });
      } else if (trimmed.startsWith('●')) {
        issues.push({
          type: 'dead-code',
          file: currentFile || 'unknown',
          message: trimmed,
        });
      }
    }
  }

  // Fallback for general errors
  if (issues.length === 0) {
    const errorLines = lines
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('>') && !l.startsWith('npm '));
    const sample = errorLines.slice(-20).join('\n');
    issues.push({
      type: 'general',
      message: sample || `Step failed with exit code ${exitCode}`,
    });
  }

  return issues;
}

function run() {
  console.log(`Test mode: ${fullTestOutput ? 'full output' : 'quiet (--silent)'}`);
  console.log(`No-bail mode: ${noBail ? '1' : '0'}`);
  if (jsonOutput) {
    console.log(`JSON output: ${jsonOutputPath}`);
  }
  console.log('Running Quality Pipeline...');

  const results = [];
  const allIssues = [];
  let overallFailed = false;

  for (let idx = 0; idx < STEPS.length; idx += 1) {
    const step = STEPS[idx];
    const stepNum = idx + 1;
    const workdir = path.resolve(repoRoot, step.dir);
    const fullCmdStr = `${step.cmd} ${step.args.join(' ')}`;

    console.log(`\n[${stepNum}/${STEPS.length}] ${step.name}... (${fullCmdStr})`);

    const start = Date.now();
    const res = spawnSync(step.cmd, step.args, {
      cwd: workdir,
      encoding: 'utf8',
      env: process.env,
      stdio: 'pipe',
      shell: true,
    });

    const durationMs = Date.now() - start;
    const stdout = res.stdout || '';
    const stderr = res.stderr || '';
    const combinedOutput = stdout + (stderr ? `\n${stderr}` : '');
    const exitCode = typeof res.status === 'number' ? res.status : 1;

    // Print output live to terminal
    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);

    const status = exitCode === 0 ? 'OK' : 'FAIL';
    if (exitCode !== 0) {
      overallFailed = true;
    }

    const issues = parseIssues(step, combinedOutput, exitCode);
    for (const issue of issues) {
      allIssues.push({
        stepId: step.id,
        stepName: step.name,
        ...issue,
      });
    }

    results.push({
      id: step.id,
      name: step.name,
      command: fullCmdStr,
      workdir: step.dir,
      status,
      exitCode,
      durationMs,
      issuesCount: issues.length,
      issues,
      outputSample: exitCode !== 0 ? stripAnsi(combinedOutput.slice(-2000)) : undefined,
    });

    if (exitCode !== 0 && !noBail) {
      console.log(`\nStopping pipeline due to failure in step ${stepNum}: ${step.name}`);
      // Mark remaining as SKIPPED
      for (let remaining = idx + 1; remaining < STEPS.length; remaining += 1) {
        results.push({
          id: STEPS[remaining].id,
          name: STEPS[remaining].name,
          command: `${STEPS[remaining].cmd} ${STEPS[remaining].args.join(' ')}`,
          workdir: STEPS[remaining].dir,
          status: 'SKIPPED',
          exitCode: -1,
          durationMs: 0,
          issuesCount: 0,
          issues: [],
        });
      }
      break;
    }
  }

  // Summary Table
  console.log('\n============================================');
  console.log('  QUALITY PIPELINE SUMMARY');
  console.log('============================================');
  for (const r of results) {
    const paddedId = String(r.id).padStart(2, ' ');
    const paddedName = r.name.padEnd(25, ' ');
    console.log(`  [${paddedId}] ${paddedName}: ${r.status}`);
  }
  console.log('============================================');
  console.log(`  RESULT: ${overallFailed ? 'FAILED' : 'ALL PASSED'}`);

  // Generate JSON report if requested
  if (jsonOutput) {
    const reportDir = path.dirname(jsonOutputPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const report = {
      timestamp: new Date().toISOString(),
      passed: !overallFailed,
      options: {
        noBail,
        fullTestOutput,
        jsonOutput: true,
        jsonOutputPath,
      },
      summary: {
        total: STEPS.length,
        passed: results.filter((r) => r.status === 'OK').length,
        failed: results.filter((r) => r.status === 'FAIL').length,
        skipped: results.filter((r) => r.status === 'SKIPPED').length,
        totalIssues: allIssues.length,
      },
      steps: results,
      allIssues,
    };

    fs.writeFileSync(jsonOutputPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`  JSON Report: ${jsonOutputPath}`);
    console.log('============================================');
  }

  process.exit(overallFailed ? 1 : 0);
}

module.exports = { stripAnsi, parseIssues, STEPS };

if (require.main === module) {
  run();
}
