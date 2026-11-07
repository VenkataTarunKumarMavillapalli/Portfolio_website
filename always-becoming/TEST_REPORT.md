# Verification report

**Build:** Venkata — Always Becoming, 2026 edition  
**Verification date:** 6 November 2026  
**Result:** 158 / 158 checks passed in the final recorded suites.

## Method

The self-contained HTML was rendered and exercised using Playwright and Chromium. This environment disallows browser navigation to local URLs, so the exact generated HTML was loaded directly into a browser document for the checks. JavaScript syntax was also checked separately. A static local server is included for normal use. No GitHub repository or live hosted website was accessed or deployed.

The checks covered chapter tabs and keyboard navigation, chapter playback, sculpture shape selection, map selection, source inspection, chart calculations, CSV export, synthetic event selection, the human-review gate, typed guide input, modal behaviour, professional-profile export, the real print-document popup, motion controls and responsive layouts.

Viewport widths tested: **320, 390, 768, 1024, 1440 and 1920 CSS pixels**. Mobile layouts were emulated; these are not tests on physical devices.

## Observed results

- No JavaScript exceptions in the recorded functional or responsive runs.
- No horizontal document overflow at the six tested widths.
- Dialogs fit the tested viewports, contain keyboard focus and remain opaque when motion is paused.
- The synthetic analytical totals reconcile. The combined sample has 223 received items, 192 completed items and 31 remaining; none are institutional metrics. CSV rows agree with the selected filter.
- The timed workflow stops at human review and does not self-approve.
- Unknown biography questions receive an explicit missing-information response. User-supplied HTML is rendered as text, not executed.
- No external network requests occurred in the single-file functional test.
- The generated print document contains the supplied name and career overview. Saving to a particular physical printer or PDF destination was not automated.

## Rendering and narration limitations

The test browser did not provide a usable WebGL context. The **animated Canvas 3D fallback was rendered and tested**, including shape controls and paused-motion interaction. The WebGL source is included but its GPU rendering path was not visually verified in this environment. It should still be checked on the intended deployment devices.

Local narration is conditional on an installed English browser voice. The no-local-voice response was exercised; actual spoken audio was not audited.

This is not a formal WCAG conformance audit, security audit, Safari certification, publication clearance or a performance guarantee. Confirm real-device behaviour, final content and GitHub deployment before sharing publicly.

## Detailed checks

| # | Check | Result |
| --- | --- | --- |
| 1 | Application initialises | PASS |
| 2 | Three rendered canvases | PASS |
| 3 | Land data available offline | PASS |
| 4 | All seven chapters present | PASS |
| 5 | All seven locations present | PASS |
| 6 | All four project cards present | PASS |
| 7 | Ambient motion can be paused | PASS |
| 8 | Pause reflected in accessible control | PASS |
| 9 | Sculpture morph target 0 | PASS |
| 10 | Sculpture selected control 0 | PASS |
| 11 | Sculpture morph target 1 | PASS |
| 12 | Sculpture selected control 1 | PASS |
| 13 | Sculpture morph target 2 | PASS |
| 14 | Sculpture selected control 2 | PASS |
| 15 | Chapter 1 shows corresponding year | PASS |
| 16 | Chapter 1 has populated text | PASS |
| 17 | Chapter 1 accessible selected state | PASS |
| 18 | Chapter 2 shows corresponding year | PASS |
| 19 | Chapter 2 has populated text | PASS |
| 20 | Chapter 2 accessible selected state | PASS |
| 21 | Chapter 3 shows corresponding year | PASS |
| 22 | Chapter 3 has populated text | PASS |
| 23 | Chapter 3 accessible selected state | PASS |
| 24 | Chapter 4 shows corresponding year | PASS |
| 25 | Chapter 4 has populated text | PASS |
| 26 | Chapter 4 accessible selected state | PASS |
| 27 | Chapter 5 shows corresponding year | PASS |
| 28 | Chapter 5 has populated text | PASS |
| 29 | Chapter 5 accessible selected state | PASS |
| 30 | Chapter 6 shows corresponding year | PASS |
| 31 | Chapter 6 has populated text | PASS |
| 32 | Chapter 6 accessible selected state | PASS |
| 33 | Chapter 7 shows corresponding year | PASS |
| 34 | Chapter 7 has populated text | PASS |
| 35 | Chapter 7 accessible selected state | PASS |
| 36 | Chapter Home key | PASS |
| 37 | Chapter ArrowRight key | PASS |
| 38 | Chapter End key | PASS |
| 39 | Next chapter wraps | PASS |
| 40 | Previous chapter wraps | PASS |
| 41 | Autoplay suppressed when motion is off | PASS |
| 42 | Narration is user-controlled with fallback | PASS |
| 43 | Location 1 updates text | PASS |
| 44 | Location 1 updates globe | PASS |
| 45 | Location 2 updates text | PASS |
| 46 | Location 2 updates globe | PASS |
| 47 | Location 3 updates text | PASS |
| 48 | Location 3 updates globe | PASS |
| 49 | Location 4 updates text | PASS |
| 50 | Location 4 updates globe | PASS |
| 51 | Location 5 updates text | PASS |
| 52 | Location 5 updates globe | PASS |
| 53 | Location 6 updates text | PASS |
| 54 | Location 6 updates globe | PASS |
| 55 | Location 7 updates text | PASS |
| 56 | Location 7 updates globe | PASS |
| 57 | Location opens matching chapter | PASS |
| 58 | Globe rotation controls execute | PASS |
| 59 | Project modal opens | PASS |
| 60 | Background is non-scrollable while modal is open | PASS |
| 61 | Knowledge example 1 source is inspectable | PASS |
| 62 | Knowledge example 2 source is inspectable | PASS |
| 63 | Knowledge example 3 source is inspectable | PASS |
| 64 | Escape closes modal | PASS |
| 65 | Focus returns to project trigger | PASS |
| 66 | Analytics All totals reconcile | PASS |
| 67 | Analytics Atlas totals reconcile | PASS |
| 68 | Analytics Nova totals reconcile | PASS |
| 69 | CSV export has six sample periods | PASS |
| 70 | CSV export matches selected filter | PASS |
| 71 | CSV totals match visible view | PASS |
| 72 | Evidence event 1 retains source reference | PASS |
| 73 | Evidence event 2 retains source reference | PASS |
| 74 | Evidence event 3 retains source reference | PASS |
| 75 | Evidence event 4 retains source reference | PASS |
| 76 | Approval is hidden before review | PASS |
| 77 | Workflow stops for human review | PASS |
| 78 | Approval available only at review | PASS |
| 79 | Manual advance cannot bypass reviewer | PASS |
| 80 | Human approval completes illustrative workflow | PASS |
| 81 | Workflow reset returns to ready | PASS |
| 82 | Guide has education answer | PASS |
| 83 | Guide does not invent unknown facts | PASS |
| 84 | User input is not executable HTML | PASS |
| 85 | Professional overview includes full name | PASS |
| 86 | Professional overview includes six experiences and three education entries | PASS |
| 87 | Professional overview downloads | PASS |
| 88 | Modal cleanup restores page scroll | PASS |
| 89 | Email contact uses supplied address | PASS |
| 90 | No unverified social profile URLs | PASS |
| 91 | No remote requests made | PASS |
| 92 | No JavaScript exceptions | PASS |
| 93 | All asset paths work under repository subpath | PASS |
| 94 | No external font files or CDNs | PASS |
| 95 | Private API endpoints absent | PASS |
| 96 | Real case metrics absent | PASS |
| 97 | 320px: no horizontal overflow | PASS |
| 98 | 320px: primary heading fits | PASS |
| 99 | 320px: longest biography remains populated | PASS |
| 100 | 320px: mobile menu opens | PASS |
| 101 | 320px: mobile navigation closes after selection | PASS |
| 102 | 320px: project dialog fits viewport | PASS |
| 103 | 320px: modal is visually opaque with motion paused | PASS |
| 104 | 320px: modal content has no horizontal overflow | PASS |
| 105 | 320px: modal keyboard focus contained | PASS |
| 106 | 390px: no horizontal overflow | PASS |
| 107 | 390px: primary heading fits | PASS |
| 108 | 390px: longest biography remains populated | PASS |
| 109 | 390px: mobile menu opens | PASS |
| 110 | 390px: mobile navigation closes after selection | PASS |
| 111 | 390px: project dialog fits viewport | PASS |
| 112 | 390px: modal is visually opaque with motion paused | PASS |
| 113 | 390px: modal content has no horizontal overflow | PASS |
| 114 | 390px: modal keyboard focus contained | PASS |
| 115 | 768px: no horizontal overflow | PASS |
| 116 | 768px: primary heading fits | PASS |
| 117 | 768px: longest biography remains populated | PASS |
| 118 | 768px: mobile menu opens | PASS |
| 119 | 768px: mobile navigation closes after selection | PASS |
| 120 | 768px: project dialog fits viewport | PASS |
| 121 | 768px: modal is visually opaque with motion paused | PASS |
| 122 | 768px: modal content has no horizontal overflow | PASS |
| 123 | 768px: modal keyboard focus contained | PASS |
| 124 | 1024px: no horizontal overflow | PASS |
| 125 | 1024px: primary heading fits | PASS |
| 126 | 1024px: longest biography remains populated | PASS |
| 127 | 1024px: project dialog fits viewport | PASS |
| 128 | 1024px: modal is visually opaque with motion paused | PASS |
| 129 | 1024px: modal content has no horizontal overflow | PASS |
| 130 | 1024px: modal keyboard focus contained | PASS |
| 131 | 1440px: no horizontal overflow | PASS |
| 132 | 1440px: primary heading fits | PASS |
| 133 | 1440px: longest biography remains populated | PASS |
| 134 | 1440px: project dialog fits viewport | PASS |
| 135 | 1440px: modal is visually opaque with motion paused | PASS |
| 136 | 1440px: modal content has no horizontal overflow | PASS |
| 137 | 1440px: modal keyboard focus contained | PASS |
| 138 | 1920px: no horizontal overflow | PASS |
| 139 | 1920px: primary heading fits | PASS |
| 140 | 1920px: longest biography remains populated | PASS |
| 141 | 1920px: project dialog fits viewport | PASS |
| 142 | 1920px: modal is visually opaque with motion paused | PASS |
| 143 | 1920px: modal content has no horizontal overflow | PASS |
| 144 | 1920px: modal keyboard focus contained | PASS |
| 145 | Reduced-motion preference disables ambient animation | PASS |
| 146 | Reduced motion preserves sculpture controls | PASS |
| 147 | Reduced motion preserves chapter navigation | PASS |
| 148 | System reduced motion is not overridden | PASS |
| 149 | Reduced-motion dialog remains visible | PASS |
| 150 | All responsive pages had no JavaScript exceptions | PASS |
| 151 | Chapter playback starts on request | PASS |
| 152 | Chapter playback advances the narrative | PASS |
| 153 | Manual selection stops chapter playback | PASS |
| 154 | Motion-enabled dialog finishes visibly | PASS |
| 155 | Timed workflow reaches reviewer gate | PASS |
| 156 | Timed workflow never self-approves | PASS |
| 157 | Print overview opens real document | PASS |
| 158 | Print overview contains supplied identity | PASS |
