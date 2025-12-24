Run dialectical autocoding for the specified task or feature.

Follow `skills/dialectical-autocoder/SKILL.md` to orchestrate the player-coach adversarial loop:

1. **Identify requirements** - Locate PRD, spec, or task description
2. **Set turn limit** - Default 5 turns
3. **Player turn** - Use tdd-developer agent to implement
4. **Coach turn** - Use coach agent to validate against requirements
5. **Loop** - Continue until APPROVED or max turns reached
6. **Escalate** - If not approved by turn limit, request human guidance

Arguments:
- $ARGUMENTS - Path to requirements document or task reference

Example: `/dialectical docs/PRD_user_auth.md`
