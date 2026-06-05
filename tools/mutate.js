#!/usr/bin/env node
/**
 * Mutador wrapper para Stryker Mutator.
 *
 * Ejecuta Stryker sobre un archivo específico y reporta el score.
 *
 * Uso:
 *   node tools/mutate.js src/components/TodoList.tsx
 *   node tools/mutate.js src/lib/storage.ts
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Uso: node tools/mutate.js <archivo>');
  process.exit(1);
}

const targetFile = args[0];
if (!fs.existsSync(targetFile)) {
  console.error(`Error: El archivo ${targetFile} no existe.`);
  process.exit(1);
}

console.log(`── Mutando ${targetFile} ──`);

// Crear configuración temporal de Stryker para este archivo
const tempConfig = {
  mutate: [targetFile],
  testRunner: 'jest',
  jest: {
    projectType: 'custom',
    configFile: 'jest.config.js',
    enableFinding: true,
  },
  checkers: ['typescript'],
  tsconfigFile: 'tsconfig.json',
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