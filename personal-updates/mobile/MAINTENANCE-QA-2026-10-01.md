# Periodicals maintenance — 1 October 2026

Started from the current published `origin/master` state (8b5b232), after fetching and verifying local tracked content against it. The repository’s actual publishing branch is master; no main branch exists. Unrelated files and Rupert Atlas work are untouched.

Rendered in the in-app browser with desktop 1280×900, phone portrait 393×852, phone landscape 852×393 and tablet 1024×768 viewport sizes. These are browser emulation checks, not physical iPhone/Safari testing.

- All five overview links were clicked forward and backward at desktop, portrait and landscape sizes (30 landings). Every article number and complete Dunhill headline remained visible below the sticky toolbar. Article tops landed 16px beneath it at each size. Repeated same-link clicks, At a Glance → Reading 03 and history Back also passed. A simulated 59px top inset expanded the toolbar to 108px and placed the article at 124px, preserving that same gap.
- Actual rendered font inspected: `LMRomanDunh10-Regular`, self-hosted, for the article heading. All five canonical article/overview titles match in editorial Title Case. Primary headings remain upright. Edition titles, masthead and body faces retain their previous roles.
- End of 02 → 03 and end of 03 → 04 inspected in portrait. Ordinary research notes now sit 34px below prose, matching wrapped notes. Every article has the same 31px bottom remainder in portrait and 39px at tablet width. Hidden Heron slots consume no flex gap. No global article padding change.
- Static Heron notes in Readings 01 and 04 opened and closed successfully with their new labels; no mobile flyer was created. Lifecycle/queue/close/reopen/toggle/reduced-motion tests pass. Taxonomy: A Question, A Definition, In Plain Terms, On Method, A Caution, A Sketch.
- Night Field Notes heading, names and SVG initials are #F3F0E6; body #D7DED5; role/meta #AEBAB0; band #10231D; labels and links retain gold. The permanent Field Register dialog still opens with its correct night palette. Day presentation also inspected.
- All three current issue marks inspected on desktop; phone and landscape bounds checked with no document overflow. Each mark has one SVG in a common 3:4 frame, with current number/date and publication identity. Themes come from complete issue framing or all Workbook questions. Tests confirm future edition metadata changes the mark, long first questions cannot dominate, and number formatting does not alter the composition seed. Load/focus/history restoration refresh canonical sources.
- Field Register and Heron data, all original article figures, body prose and source content are preserved. Shared reading controls, recovery logic, manifest and icons are untouched. No runtime errors in the tested pages. Inline scripts parse; whitespace checks pass.

Publication is explicitly authorized by the supplied six-item maintenance brief once these checks pass.
