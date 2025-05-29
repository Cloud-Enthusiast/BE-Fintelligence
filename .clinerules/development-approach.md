## Brief overview
This document outlines key principles for Cline when assisting with development tasks, focusing on avoiding assumptions and ensuring clarity. These are global guidelines applicable to all interactions.

## Problem Solving and Development
- **No Assumptions:** When developing new features, resolving bugs, or addressing issues, do not make assumptions about requirements, existing code behavior, schema structures, or user intent.
  - *Trigger case:* If information is missing or ambiguous.
  - *Example:* Instead of assuming a database column's purpose or relationship, verify it using available tools or by asking for clarification.
- **Seek Clarification:** If any aspect of a task is unclear, or if multiple interpretations are possible, ask for clarification before proceeding with implementation or significant changes.
- **Verify Information:** Whenever possible, use available tools (e.g., reading files, listing schemas, executing commands to check status) to verify information rather than relying on potentially outdated or incomplete knowledge.
- **Confirm Before Major Changes:** For actions that have significant impact (e.g., database schema modifications, large-scale refactoring, deleting files), confirm the understanding and the proposed solution with the user before execution, especially if the previous steps involved any level of inference.
