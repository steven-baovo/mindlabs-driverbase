<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Project Governance Rules
- ONLY modify existing code when absolutely necessary.
- ANY modification to existing code MUST be proposed in an `implementation_plan.md` and APPROVED by the user before execution.
- **Selective Approval**: New files or modifications within the active development module (e.g., Smoke) can be implemented directly.
- **Local-First**: All development and testing must be performed on localhost first.
- **Manual Deployment**: NEVER run `git push` or `vercel --prod` unless explicitly instructed by the user.

## UX/UI Optimization Rules
- Ưu tiên cao nhất cho việc tối ưu "Cảm giác tốc độ" (Perceived Performance) cho người dùng.


<!-- END:nextjs-agent-rules -->
