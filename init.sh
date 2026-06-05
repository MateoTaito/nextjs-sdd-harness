#!/usr/bin/env bash
# init.sh — Verificación e inicialización del entorno
#
# Este script lo ejecuta el agente al COMENZAR una sesión y antes de
# declarar cualquier tarea como `done`. Si falla, la sesión no debe avanzar.
#
# Salida esperada: códigos de salida claros y bloques marcados con [OK]/[FAIL].

set -u
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

ok()    { printf "${GREEN}[OK]${NC}    %s\n" "$1"; }
warn()  { printf "${YELLOW}[WARN]${NC}  %s\n" "$1"; }
fail()  { printf "${RED}[FAIL]${NC}  %s\n" "$1"; }

EXIT_CODE=0

echo "── 1. Verificando entorno ─────────────────────────────"

# Node.js disponible
if ! command -v node >/dev/null 2>&1; then
  fail "node no está instalado"
  exit 1
fi
ok "node -> $(node --version)"

# npm disponible
if ! command -v npm >/dev/null 2>&1; then
  fail "npm no está instalado"
  exit 1
fi
ok "npm -> $(npm --version)"

# Versión mínima de Node.js 18
NODE_VERSION=$(node -e "console.log(process.version.match(/^v(\d+)/)[1])")
if [ "$NODE_VERSION" -lt 18 ]; then
  fail "Se requiere Node.js >= 18 (actual: $(node --version))"
  exit 1
fi
ok "Versión de Node.js compatible"

echo ""
echo "── 2. Verificando archivos base del arnés ──────────────"

for f in AGENTS.md feature_list.json progress/current.md docs/architecture.md docs/conventions.md docs/verification.md docs/workflow.md tools/mutate.js CHECKPOINTS.md package.json tsconfig.json; do
  if [ ! -f "$f" ]; then
    fail "Falta archivo base: $f"
    EXIT_CODE=1
  else
    ok "Existe $f"
  fi
done

echo ""
echo "── 3. Validando feature_list.json y escenarios ────────"

node - <<'JS'
const fs = require('fs');
const path = require('path');

try {
  const data = JSON.parse(fs.readFileSync('feature_list.json', 'utf8'));
  const valid = new Set(['pending', 'spec_ready', 'in_progress', 'done', 'blocked']);
  const inProgress = data.features.filter(f => f.status === 'in_progress');
  
  if (inProgress.length > 1) {
    console.log(`[FAIL]  Hay ${inProgress.length} features en in_progress (máximo 1)`);
    process.exit(1);
  }
  
  const requiresSpec = new Set(['spec_ready', 'in_progress', 'done']);
  const specErrors = [];
  
  for (const f of data.features) {
    if (!valid.has(f.status)) {
      console.log(`[FAIL]  Estado inválido en feature ${f.id}: ${f.status}`);
      process.exit(1);
    }
    if (f.sdd && requiresSpec.has(f.status)) {
      const featureFile = path.join('features', f.name + '.feature');
      if (!fs.existsSync(featureFile)) {
        specErrors.push(
          `feature ${f.id} (${f.name}) en ${f.status} sin ${featureFile}`
        );
      }
    }
  }
  
  if (specErrors.length > 0) {
    for (const e of specErrors) {
      console.log(`[FAIL]  ${e}`);
    }
    process.exit(1);
  }
  
  console.log(`[OK]    feature_list.json válido (${data.features.length} features)`);
  console.log(`[OK]    Escenarios .feature presentes para features sdd no-pending`);
} catch (e) {
  console.log(`[FAIL]  feature_list.json o specs inválidos: ${e.message}`);
  process.exit(1);
}
JS

if [ $? -ne 0 ]; then EXIT_CODE=1; fi

echo ""
echo "── 4. Instalando dependencias ────────────────────────────"

if [ -f "package.json" ]; then
  if npm install --silent 2>&1; then
    ok "Dependencias instaladas"
  else
    fail "Error al instalar dependencias"
    EXIT_CODE=1
  fi
else
  warn "package.json no existe"
fi

echo ""
echo "── 5. Ejecutando tests ─────────────────────────────────"

if [ -d "tests" ] || [ -d "__tests__" ]; then
  if npm test 2>&1; then
    ok "Todos los tests pasan"
  else
    fail "Hay tests rotos"
    EXIT_CODE=1
  fi
else
  warn "Carpeta tests/ no existe todavía"
fi

echo ""
echo "── 6. Verificando TypeScript ───────────────────────────"

if [ -f "tsconfig.json" ]; then
  if npx tsc --noEmit 2>&1; then
    ok "TypeScript compila sin errores"
  else
    fail "Errores de TypeScript"
    EXIT_CODE=1
  fi
else
  warn "tsconfig.json no existe"
fi

echo ""
echo "── 7. Resumen ──────────────────────────────────────────"

if [ $EXIT_CODE -eq 0 ]; then
  ok "Entorno listo. Puedes empezar a trabajar."
else
  fail "Entorno NO está listo. Resuelve los errores antes de avanzar."
fi

exit $EXIT_CODE