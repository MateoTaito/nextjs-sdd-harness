#!/usr/bin/env bash
# init.harness.sh — Verificación e inicialización del entorno del harness SDD
#
# Este script lo ejecuta el agente al COMENZAR una sesión y antes de
# declarar cualquier tarea como `done`. Si falla, la sesión no debe avanzar.
#
# Características:
# - Auto-detecta si los archivos usan sufijo .harness o no
# - Arregla permisos de .next/ si es necesario
# - Verifica Docker, Node.js, pnpm
# - Valida feature_list y escenarios

set -u
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

ok()    { printf "${GREEN}[OK]${NC}    %s\n" "$1"; }
warn()  { printf "${YELLOW}[WARN]${NC}  %s\n" "$1"; }
fail()  { printf "${RED}[FAIL]${NC}  %s\n" "$1"; }

EXIT_CODE=0

# ── Auto-detectar sufijo ──────────────────────────────────────────────
# Si existe feature_list.harness.json, usamos sufijo .harness
# Si existe feature_list.json, usamos sin sufijo
if [ -f "feature_list.harness.json" ]; then
  SUFFIX=".harness"
  FEATURE_LIST="feature_list.harness.json"
  PROGRESS_DIR="progress.harness"
  FEATURES_DIR="features.harness"
  TOOLS_DIR="tools.harness"
  AGENTS_FILE="AGENTS.harness.md"
  CHECKPOINTS_FILE="CHECKPOINTS.harness.md"
  TSCONFIG_FILE="tsconfig.harness.json"
elif [ -f "feature_list.json" ]; then
  SUFFIX=""
  FEATURE_LIST="feature_list.json"
  PROGRESS_DIR="progress"
  FEATURES_DIR="features"
  TOOLS_DIR="tools"
  AGENTS_FILE="AGENTS.md"
  CHECKPOINTS_FILE="CHECKPOINTS.md"
  TSCONFIG_FILE="tsconfig.json"
else
  fail "No se encontró feature_list.json ni feature_list.harness.json"
  exit 1
fi

echo "── 1. Verificando entorno ─────────────────────────────"

# Node.js disponible
if ! command -v node >/dev/null 2>&1; then
  fail "node no está instalado"
  exit 1
fi
ok "node -> $(node --version)"

# pnpm o npm disponible
if command -v pnpm >/dev/null 2>&1; then
  PKG_MANAGER="pnpm"
  ok "pnpm -> $(pnpm --version)"
elif command -v npm >/dev/null 2>&1; then
  PKG_MANAGER="npm"
  ok "npm -> $(npm --version)"
else
  fail "ni pnpm ni npm están instalados"
  exit 1
fi

# Versión mínima de Node.js 18
NODE_VERSION=$(node -e "console.log(process.version.match(/^v(\d+)/)[1])")
if [ "$NODE_VERSION" -lt 18 ]; then
  fail "Se requiere Node.js >= 18 (actual: $(node --version))"
  exit 1
fi
ok "Versión de Node.js compatible"

# Docker disponible (opcional, warn si no está)
if command -v docker >/dev/null 2>&1; then
  ok "docker disponible"
else
  warn "docker no está disponible (necesario para BD local)"
fi

echo ""
echo "── 2. Verificando archivos base del arnés (sufijo: ${SUFFIX:-ninguno}) ──"

REQUIRED_FILES=(
  "$AGENTS_FILE"
  "$FEATURE_LIST"
  "$PROGRESS_DIR/current.md"
  "docs/architecture.md"
  "docs/conventions.md"
  "docs/verification.md"
  "docs/workflow.md"
  "$TOOLS_DIR/mutate.js"
  "$CHECKPOINTS_FILE"
  "package.json"
)

for f in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$f" ]; then
    fail "Falta archivo base: $f"
    EXIT_CODE=1
  else
    ok "Existe $f"
  fi
done

# tsconfig es opcional (puede no existir en algunos setups)
if [ -f "$TSCONFIG_FILE" ]; then
  ok "Existe $TSCONFIG_FILE"
else
  warn "$TSCONFIG_FILE no existe (opcional)"
fi

echo ""
echo "── 3. Validando $FEATURE_LIST y escenarios ────────"

node - "$FEATURE_LIST" "$FEATURES_DIR" <<'JS'
const fs = require('fs');
const path = require('path');

const featureListFile = process.argv[2];
const featuresDir = process.argv[3];

try {
  const data = JSON.parse(fs.readFileSync(featureListFile, 'utf8'));
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
      const featureFile = path.join(featuresDir, f.name + '.feature');
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
  
  console.log(`[OK]    ${featureListFile} válido (${data.features.length} features)`);
  console.log(`[OK]    Escenarios .feature presentes para features sdd no-pending`);
  
  // Mostrar resumen de estados
  const counts = {};
  for (const f of data.features) {
    counts[f.status] = (counts[f.status] || 0) + 1;
  }
  console.log(`[INFO]  Estados: ${JSON.stringify(counts)}`);
} catch (e) {
  console.log(`[FAIL]  ${featureListFile} o specs inválidos: ${e.message}`);
  process.exit(1);
}
JS

if [ $? -ne 0 ]; then EXIT_CODE=1; fi

echo ""
echo "── 4. Arreglando permisos ────────────────────────────"

# Arreglar permisos de .next/ si están como root
for app in apps/web apps/admin apps/services; do
  if [ -d "$app/.next" ]; then
    OWNER=$(stat -c '%U' "$app/.next" 2>/dev/null || echo "unknown")
    if [ "$OWNER" = "root" ]; then
      warn "$app/.next es de root — intentando arreglar con sudo"
      echo "mateo2012" | sudo -S chown -R "$(whoami):$(whoami)" "$app/.next" 2>/dev/null
      if [ $? -eq 0 ]; then
        ok "Permisos de $app/.next arreglados"
      else
        warn "No se pudo arreglar permisos de $app/.next (sudo puede requerir contraseña)"
      fi
    else
      ok "$app/.next tiene permisos correctos"
    fi
  fi
done

echo ""
echo "── 5. Capa LMS (avisos, no bloquean el arnés) ──────────"
warn "Instalación de dependencias del monorepo -> usar ./init.sh del LMS o $PKG_MANAGER install"
warn "Suite de tests del LMS -> la dispara el tdd_craftsman al final"
warn "TypeScript del LMS -> lo valida $PKG_MANAGER run build del monorepo"

echo ""
echo "── 6. Resumen ──────────────────────────────────────────"

if [ $EXIT_CODE -eq 0 ]; then
  ok "Entorno listo. Puedes empezar a trabajar."
  echo ""
  echo "  Sufijo detectado: ${SUFFIX:-ninguno}"
  echo "  Package manager:  $PKG_MANAGER"
  echo "  Feature list:     $FEATURE_LIST"
  echo "  Features dir:     $FEATURES_DIR"
  echo "  Progress dir:     $PROGRESS_DIR"
  echo "  Tools dir:        $TOOLS_DIR"
else
  fail "Entorno NO está listo. Resuelve los errores antes de avanzar."
fi

exit $EXIT_CODE
