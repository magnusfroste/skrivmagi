# Architecture rules
- Keep AI request timeout handling in a client data helper and waiting feedback in a separate view component; this keeps request behavior independent of page presentation.
- Use shared button and form primitives for minimum touch sizes and readable input text; this keeps accessibility consistent across pages.