# ===============================================================================
# TENANT THEME EDITOR - TILTFILE
# ===============================================================================
#
# A standalone Tiltfile for the Tenant Theme Editor micro-frontend.
# Run with: tilt up
#
# Resource Groups:
#   Dev     - Lint, unit tests, dev server (port 4446)
#   Build   - TypeCheck, production build, preview server (port 4447)
#   CodeGen - API hook generation (Orval)
#
# ===============================================================================

# ===============================================================================
# 1. DEVELOPMENT
# ===============================================================================

# --- Linter ---
local_resource(
    name='theme-editor-lint',
    labels=['Dev'],
    cmd='npm run lint',
    trigger_mode=TRIGGER_MODE_MANUAL,
    allow_parallel=True,
)

local_resource(
    name='theme-editor-lint-fix',
    labels=['Dev'],
    cmd='npm run lint:fix',
    trigger_mode=TRIGGER_MODE_MANUAL,
    auto_init=False,
    allow_parallel=True,
)

# --- Unit Tests (waits for Lint) ---
local_resource(
    name='theme-editor-unit-tests',
    labels=['Dev'],
    cmd='npm run test:coverage',
    resource_deps=['theme-editor-lint'],
    allow_parallel=True,
)

local_resource(
    name='theme-editor-unit-tests-watch',
    labels=['Dev'],
    serve_cmd='npm run test',
    trigger_mode=TRIGGER_MODE_MANUAL,
    allow_parallel=True,
)

# --- Development Server (port 4446) ---
local_resource(
    name='theme-editor-dev',
    labels=['Dev'],
    serve_cmd='npm run dev',
    resource_deps=['theme-editor-unit-tests'],
    links=[
        link('http://localhost:4446', 'Theme Editor'),
    ],
)

# ===============================================================================
# 2. BUILD & PREVIEW
# ===============================================================================

# --- TypeCheck (manual) ---
local_resource(
    name='theme-editor-typecheck',
    labels=['Build'],
    cmd='npm run typecheck',
    trigger_mode=TRIGGER_MODE_MANUAL,
    allow_parallel=True,
)

# --- Production Build (manual) ---
local_resource(
    name='theme-editor-build',
    labels=['Build'],
    cmd='npm run build',
    trigger_mode=TRIGGER_MODE_MANUAL,
    allow_parallel=True,
)

# --- Production Server (manual, port 4447) ---
local_resource(
    name='theme-editor-prod',
    labels=['Build'],
    serve_cmd='npm run preview',
    resource_deps=['theme-editor-build'],
    trigger_mode=TRIGGER_MODE_MANUAL,
    links=[
        link('http://localhost:4447', 'Theme Editor (Prod)'),
    ],
)

# ===============================================================================
# 3. CODE GENERATION
# ===============================================================================

# --- API Hook Generation (manual) ---
local_resource(
    name='theme-editor-generate-hooks',
    labels=['CodeGen'],
    cmd='npm run api:generate',
    trigger_mode=TRIGGER_MODE_MANUAL,
    allow_parallel=True,
)
