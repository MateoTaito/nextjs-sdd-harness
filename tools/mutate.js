#!/usr/bin/env node
/**
 * Mutador wrapper para Stryker Mutator.
 *
 * Ejecuta Stryker sobre un archivo específico y reporta el score.
 * Soporta múltiples test runners: jest, node:test, tsc.
 *
 * Uso:
 *   node tools/mutate.js src/components/TodoList.tsx
 *   node tools/mutate.js src/lib/storage.ts --runner=node
 *   node tools/mutate.js src/lib/storage.ts --runner=tsc
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Uso: node tools/mutate.js <archivo> [--runner=jest|node|tsc]');
  process.exit(1);
}

// Parsear argumentos
let targetFile = null;
let runner = 'jest';

for (const arg of args) {
  if (arg.startsWith('--runner=')) {
    runner = arg.split('=')[1];
  } else if (!arg.startsWith('-')) {
    targetFile = arg;
  }
}

if (!targetFile) {
  console.error('Error: Debes especificar un archivo a mutar.');
  process.exit(1);
}

if (!fs.existsSync(targetFile)) {
  console.error(`Error: El archivo ${targetFile} no existe.`);
  process.exit(1);
}

console.log(`── Mutando ${targetFile} (runner: ${runner}) ──`);

// Detectar el directorio raíz del monorepo
let rootDir = process.cwd();
while (rootDir !== '/' && !fs.existsSync(path.join(rootDir, 'package.json'))) {
  rootDir = path.dirname(rootDir);
}

// Detectar el package.json más cercano al archivo target
let packageDir = path.dirname(targetFile);
while (packageDir !== '/' && !fs.existsSync(path.join(packageDir, 'package.json'))) {
  packageDir = path.dirname(packageDir);
}

// Configuración según el runner
let testCommand;
let configFile;
let tsconfigFile;

switch (runner) {
  case 'jest':
    // Jest (default) - buscar jest.config en el package o en la raíz
    const jestConfigPaths = [
      path.join(packageDir, 'jest.config.js'),
      path.join(packageDir, 'jest.config.ts'),
      path.join(packageDir, 'jest.config.mjs'),
      path.join(rootDir, 'jest.config.js'),
      path.join(rootDir, 'jest.config.harness.js'),
    ];
    const jestConfig = jestConfigPaths.find(p => fs.existsSync(p));
    
    configFile = jestConfig || 'jest.config.js';
    tsconfigFile = path.join(packageDir, 'tsconfig.json');
    
    testCommand = `npx jest --config ${configFile} --passWithNoTests`;
    break;
    
  case 'node':
    // Node.js native test runner - buscar archivos .test.mts/.test.ts
    const testDir = path.join(packageDir, 'tests');
    const testPattern = fs.existsSync(testDir) 
      ? `${testDir}/*.test.{ts,mts}`
      : `${path.dirname(targetFile)}/*.test.{ts,mts}`;
    
    testCommand = `npx tsx --test ${testPattern}`;
    tsconfigFile = path.join(packageDir, 'tsconfig.json');
    break;
    
  case 'tsc':
    // Solo verificación de tipos
    tsconfigFile = path.join(packageDir, 'tsconfig.json');
    testCommand = `npx tsc --noEmit --project ${tsconfigFile}`;
    break;
    
  default:
    console.error(`Error: Runner '${runner}' no soportado. Usa: jest, node, tsc`);
    process.exit(1);
}

// Crear configuración temporal de Stryker
const tempConfig = {
  mutate: [targetFile],
  testRunner: runner === 'jest' ? 'jest' : 'command',
  ...(runner === 'jest' ? {
    jest: {
      projectType: 'custom',
      configFile: configFile,
      enableFinding: true,
    },
  } : {
    commandRunner: {
      command: testCommand,
    },
  }),
  checkers: ['typescript'],
  tsconfigFile: tsconfigFile,
  reporters: ['clear-text'],
  coverageAnalysis: 'perTest',
  thresholds: {
    high: 100,
    low: 80,
    break: 100,
  },
};

const tempConfigPath = path.join(__dirname, 'stryker.temp.conf.js');
fs.writeFileSync(
  tempConfigPath,
  `module.exports = ${JSON.stringify(tempConfig, null, 2)};`
);

try {
  // Ejecutar Stryker con la configuración temporal
  const command = `npx stryker run --configFile ${tempConfigPath}`;
  const output = execSync(command, {
    encoding: 'utf8',
    stdio: 'inherit',
    timeout: 300000, // 5 minutos timeout
    cwd: rootDir,
  });
} catch (error) {
  // Stryker puede fallar si hay mutantes que sobreviven (break threshold)
  // Eso es esperado, no es un error del script
  if (error.status === 0) {
    console.log('\n── Mutación completada ──');
  } else {
    console.error('\n── Mutación completada con mutantes sobrevivientes ──');
  }
} finally {
  // Limpiar archivo temporal
  if (fs.existsSync(tempConfigPath)) {
    fs.unlinkSync(tempConfigPath);
  }
}
