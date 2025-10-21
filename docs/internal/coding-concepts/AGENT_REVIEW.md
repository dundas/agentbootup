# Agent Review & Documentation Agent Proposal

**Date**: 2025-10-18
**Review Scope**: Code writing agents + OpenAPI documentation needs

---

## Current Implementation Agents

### 1. **tdd-code-developer.md** ✅ VALIDATED
- **Methodology**: Test-Driven Development (Red-Green-Refactor)
- **Best For**: Complex logic, safety-critical features, high coverage requirements
- **Workflow**: Tests FIRST → Implementation → Refactor → Coverage → Docs
- **Results**: 94.81% coverage, 32/32 tests passing
- **Time Estimates**: REMOVED (per user request)
- **Tools**: Read, Write, Edit, Bash, Glob, Grep

### 2. **contract-driven-api-developer.md**
- **Methodology**: Contract-First (OpenAPI → Tests → Code)
- **Best For**: Multi-client APIs, parallel development teams
- **Workflow**: OpenAPI spec → Contract tests → Implementation → SDK gen
- **Expected Coverage**: ~88%
- **Tools**: Read, Write, Edit, Bash, Glob, Grep

### 3. **pattern-driven-api-developer.md**
- **Methodology**: Pattern-First (Skill → OpenAPI → Tests → Code)
- **Best For**: API families with reusable patterns
- **Workflow**: Document patterns as skills → OpenAPI → Tests → Code
- **Expected Coverage**: ~90%
- **Output**: Skills in `.claude/skills/` + working API
- **Tools**: Read, Write, Edit, Bash, Glob, Grep

### 4. **phased-code-developer.md**
- **Methodology**: Iterative Phased Development
- **Best For**: MVPs, prototypes, evolving requirements, speed-critical
- **Workflow**: MVP → Enhance → Polish (incremental delivery)
- **Expected Coverage**: ~85%
- **Speed**: Fastest to first working version
- **Tools**: Read, Write, Edit, Bash, Glob, Grep

### 5. **concurrent-artifact-developer.md**
- **Methodology**: Parallel Artifact Generation
- **Best For**: Libraries, SDKs, documentation-heavy projects
- **Workflow**: Generate code, tests, docs, examples in parallel → Validate consistency
- **Expected Coverage**: ~87%
- **Focus**: Artifact alignment (code ↔ tests ↔ docs ↔ examples)
- **Tools**: Read, Write, Edit, Bash, Glob, Grep

---

## OpenAPI Standards Review

### Current Standard: `/api/openapi.json` Endpoint

**Standardization Status** (from `OPENAPI_ENDPOINT_STANDARDIZATION.md`):
- **Endpoint Paths**: 6/8 services (75%) compliant with `/api/openapi.json`
- **operationIds**: 5/8 services (62.5%) compliant with naming convention

### operationId Convention

**Pattern**: `{servicePrefix}{Action}{Resource}` in camelCase

**Examples**:
```yaml
operationId: queueSubmitJob           # mech-queue
operationId: readerProcessContent     # mech-reader
operationId: storageUploadFile        # mech-storage
operationId: vaultCreateSecret        # mech-vault
```

**Service Prefixes**:
- `queue` - mech-queue
- `reader` - mech-reader
- `storage` - mech-storage
- `llms` - mech-llms
- `chat` - mech-chat
- `sequences` - mech-sequences
- `search` - mech-search
- `vault` - mech-vault
- `apps` - mech-apps
- `docs` - mech-docs

### Tools: swagger-jsdoc

**Recommended Approach**: Use `swagger-jsdoc` to generate OpenAPI specs from JSDoc comments

**Benefits**:
- ✅ Zero refactoring - works with existing routes
- ✅ operationIds at source (where code lives)
- ✅ Documentation in code (JSDoc comments)
- ✅ Auto-sync (generated spec always matches implementation)
- ✅ Fast implementation (30-60 minutes per service)

**Example**:
```typescript
/**
 * @openapi
 * /api/jobs:
 *   post:
 *     operationId: queueSubmitJob
 *     summary: Submit a job to the queue
 *     tags: [Jobs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobRequest'
 *     responses:
 *       201:
 *         description: Job submitted successfully
 */
router.post('/api/jobs', async (req, res) => {
  // Handler code
});
```

---

## Existing OpenAPI Files

### mech-vault/src/openapi/openapi.json
- **Size**: 2,259 lines
- **Compliance**: Comprehensive with operationIds
- **Schemas**: Full component schemas, security schemes, reusable responses
- **Tags**: Organized by feature (Secrets, SSH Keys, Environment Files, Deployment, System, Admin)
- **Examples**: vaultCreateSecret, vaultGetSecretValue, vaultGenerateSSHKey

### mech-auth/src/openapi/openapi.json
- **Size**: 87 lines
- **Compliance**: Basic structure
- **Coverage**: 4 endpoints (health, discovery, config)
- **Note**: Proxies to Better Auth, minimal endpoints

---

## Gap Analysis: Documentation Agent

### What's Missing

**Current agents handle**:
- ✅ Code generation (TDD, Contract-First, Pattern-First, Phased, Concurrent)
- ✅ Test generation
- ✅ Pre-implementation planning (Spec Writer, Clarification, Technical Planner, Task Generator)

**Not handled**:
- ❌ OpenAPI spec generation from existing routes
- ❌ swagger-jsdoc implementation workflow
- ❌ operationId validation and generation
- ❌ OpenAPI schema validation
- ❌ Documentation consistency checking

### Proposed Agent: openapi-doc-writer.md

**Methodology**: Research-Driven OpenAPI Documentation

**Use Cases**:
1. Add OpenAPI documentation to existing service
2. Migrate from manual OpenAPI to swagger-jsdoc
3. Validate operationIds against standard
4. Generate missing operationIds following convention
5. Update OpenAPI schemas to match code

**Workflow**:
1. **Research**: Scan routes, identify endpoints, analyze patterns
2. **Configure**: Set up swagger-jsdoc, create swagger config
3. **Document**: Add JSDoc comments with operationIds to routes
4. **Validate**: Check operationId compliance, schema validity
5. **Generate**: Produce `/api/openapi.json` endpoint

**Expected Output**:
- `src/config/swagger.ts` - Swagger configuration
- JSDoc comments on all routes with operationIds
- Updated `/api/openapi.json` route
- Validation report showing compliance

**Compliance Checks**:
- ✅ Endpoint path: `/api/openapi.json`
- ✅ operationIds follow `{servicePrefix}{Action}{Resource}` pattern
- ✅ All operations have operationIds
- ✅ All operationIds are unique
- ✅ Service prefix matches service name

---

## Recommendation

**Create** `openapi-doc-writer.md` agent to handle OpenAPI documentation workflow.

**Integrate with existing agents**:
- **contract-driven-api-developer** → Can invoke openapi-doc-writer to generate OpenAPI first
- **pattern-driven-api-developer** → Can invoke openapi-doc-writer after documenting patterns

**Benefits**:
- Standardizes OpenAPI documentation across all mech services
- Reduces time to add OpenAPI from "manual JSON writing" to "guided workflow"
- Ensures compliance with mech platform standards
- Enables clean SDK generation in mech-client
