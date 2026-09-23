# Extension visual system

The source of truth is `src/design/tokens.ts`, emitted by `src/design/theme-css.ts`. Reuse those tokens rather than introducing another palette.

- Blue for OPT and teal for STEM, with both palettes defined in the shared theme tokens. The original brand logo remains blue on both.
- Neutral controls in a softly tinted form panel; related dates share one divided row, with a highlighted deadline. Results use a flat accent tint and quiet separators instead of nested timer cards. Warning/error colors override the result accent only when a state needs attention.
- System sans-serif; 13px body, 12px supporting text, 16px page titles.
- Consistent 12px control corners, 20px main panel corners, 44px date fields and primary actions.
- Original `public/icons/logo.gif` on home and tool headers.
- Compact field labels with optional badges and question-mark help. Help is hoverable, keyboard reachable, click-toggleable, Escape-dismissable, and kept inside the viewport.
- One primary action per form, using the existing deep blue or teal fill in both themes. Separate action-fill and label tokens preserve contrast without the bright pastel dark-mode buttons. Secondary actions and reminder controls remain quiet. Countdown dates and usage numbers use tabular numerals, with larger result text.
- Support existing light and dark themes and reduced motion.
- Prefill motion: show a compact, brand-blue progress card beneath Prefill (floating fallback for popup-only pages), with a brief blue active outline changing to teal on completed fields. Keep input values atomic; never simulate partial keystrokes. Pace up to 12 supported controls at 72ms each, skip pacing for reduced motion/Continuous, and re-check emptiness and cancellation after each visual pause. Progress remains indeterminate until the final scan; profile and saved private answers share one completion state. Never copy answer values into animation labels.
- Job-assistant sidebar: a companion beside the application page, using a 360px rail inset 16px from the viewport, 14px rounded full border, dark navy 44px header, fixed feedback footer, and independently scrolling content. At narrow widths use viewport width minus 32px. The minimized launcher stays draggable; opening always restores the inset frame. Match the measured Tsenta shell proportions, not its content, branding, or application logic.
- Inside the job sidebar, give the role the full line and keep tracker status separate. Use flat job metadata, a quiet tracker action, one filled blue Prefill action, blue/teal tool icons, and a collapsed private-answer review row. Keep resume availability visible and truthful. Application help expands on hover, focus or click and closes with Escape; supporting copy should not repeat across status and action rows.
