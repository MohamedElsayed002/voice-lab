---
name: anti-ai-slop
description: "Use when creating, reviewing, or refining a user interface, landing page, or frontend component. Identify and replace generic AI-generated or template-driven design patterns with intentional, accessible, product-specific choices."
---

# Anti-AI Slop

Make interfaces feel designed for their product and users, not assembled from fashionable defaults. This is not a ban on AI-generated UI or a requirement to make every interface minimal. Keep visual choices when they serve a clear purpose or match an intentional user reference.

## Workflow

1. **Understand the product and task.** Read the relevant components, styles, copy, and project conventions. Identify the intended audience, primary action, and any supplied visual reference. Do not invent product facts, testimonials, or performance claims.
2. **Audit the interface for concrete issues.** Look for:
   - Color, gradients, glow, blur, and shadows that decorate rather than clarify.
   - Vague headlines, buzzwords, repetitive emphasis, or unverified metrics.
   - Template-like sections, excessive symmetry, repeated cards, and spacing without hierarchy.
   - Icons, badges, illustrations, and containers that add no information.
   - Motion or hover effects that distract instead of communicating state or feedback.
   - Low contrast, weak focus states, inaccessible controls, or non-semantic markup.
3. **Make deliberate replacements.** For every issue that matters, choose a product-appropriate alternative and preserve the design’s useful intent. Explain decisions through the implementation: palette supports brand and contrast; typography supports reading hierarchy; layout follows content and task flow; spacing groups related information; motion communicates a meaningful change.
4. **Implement the complete change.** Follow existing component, token, responsive, localization, and accessibility patterns. Prefer semantic HTML, truthful copy, restrained decoration, and clear interactive states. Keep user-provided references when requested, while ensuring the result remains usable.
5. **Verify.** Run the smallest relevant lint, type-check, build, or test command. When browser-preview tools are available and the change is visual, inspect the rendered result at relevant viewport sizes.
6. **Summarize.** Briefly report what generic patterns were addressed, the intentional choices made, and validation performed. If no change is warranted, say why rather than making arbitrary edits.

## Review checklist

- **Visual:** Is every color, gradient, shadow, and decorative element purposeful? Is hierarchy clear without effects?
- **Editorial:** Does the content explain this actual product and avoid unsupported claims or filler?
- **Layout:** Does structure follow content and user tasks instead of a generic landing-page template?
- **Interaction:** Are controls clearly functional? Does motion or hover communicate useful feedback?
- **Accessibility:** Are contrast, keyboard focus, semantics, labels, and responsive behavior adequate?
- **Code:** Does markup represent the content honestly and follow the project’s conventions?

Do not treat a checklist item as an automatic prohibition. Preserve a style when there is a specific product, usability, or user-reference reason for it; remove decoration that has no such reason.
