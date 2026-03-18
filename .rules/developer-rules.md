# Developer Collaboration Rules

## 1. Change Approval Protocol
- After each code iteration (i.e., a set of changes that includes new or updated functionality **and** its corresponding unit tests), pause and request explicit confirmation before proceeding.
- No further modifications may be made until the user approves the completed iteration.

## 2. Testing Requirements
- All unit tests must pass after any change
- No new functionality may be added without corresponding unit tests
- Tests must verify both normal operation and edge cases
- Always run tests after modifications and report test results

## 3. Code Quality Standards
- Maintain consistent coding style and conventions
- Follow TypeScript best practices
- Use meaningful variable and function names
- Add clear comments for complex logic
- Avoid unnecessary complexity

## 4. File Modification Process
- Always verify file existence before editing
- Use `read_file` to understand context before modifying
- When fixing syntax errors, provide complete corrected code
- For significant changes, create a backup before overwriting

## 5. Communication Protocol
- Clearly explain the purpose of each change
- Report any issues or limitations encountered
- If tools fail, attempt alternative approaches before requesting help
- Never make assumptions about user intent without confirmation

## 6. Project Structure Awareness
- Always reference the correct project root directory
- Verify file paths using `find_path` or `list_directory` when uncertain
- Respect the existing project architecture and patterns
- Follow the workflow specifications in `workflow/spec.md`

## 7. Error Handling
- If a tool fails, attempt one alternative approach
- If the issue persists, report it clearly with context
- Never guess file paths or content
- When in doubt, pause and ask for clarification

## 8. Documentation
- Keep `workflow/status.md` updated with progress
- Document decisions and rationale in the status file
- Ensure specifications in `workflow/spec.md` are reflected in implementation
- Maintain clear traceability between requirements and code

## 9. Security & Best Practices
- Never hardcode sensitive information
- Use environment variables where appropriate
- Follow secure coding practices
- Validate all inputs and handle errors gracefully
```
