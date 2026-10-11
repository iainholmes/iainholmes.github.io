# QST Authentic Reveal & Editorial Capitalization — 11 October 2026

Continues draft PR #4 from `665756b3a47fc4f85da79b50f885f305a935f5ce` on the existing branch. No merge or deployment.

## Authentic QST correction

The owner's screenshots (actual application at 3:29:45 PM; desk. representation at 3:30:23 PM) were inspected directly. The real application's current source was read only to confirm its typography, palette and layout vocabulary. No QST source application was changed.

The former cream serif panel is replaced with a compact static application composition: charcoal/olive surfaces, green Python emphasis, uppercase monospace branding, Python/R/Stata language strip, module directory, three language cards and a simplified linked-language visualization. It uses the original application's Atkinson Hyperlegible Next and JetBrains Mono families. Existing Atkinson binaries remain unchanged; a licensed, self-hosted JetBrains Mono font is added for this article only.

The directory sits beside the overview at wider article sizes. Below 440px article width it moves below the overview, keeping the language strip above it; module entries form two columns, then one below 300px. Text remains real HTML, with no screenshot scaling or hidden navigation. Both desk. appearances retain the reference's recognizable dark application palette.

The representation is labeled **Application Preview**. Language strips/cards/module entries are static content, not simulated controls. There are no progress values, completion marks, module-count claims, API-key fields, tabs, iframe or application requests. The existing Open QST link and optional learning-path disclosure remain functional, as do the separate desk. Reveal/Return/Open Website controls.

## Editorial capitalization

Prominent chapter titles, TOC labels, short display statements, workflow labels and disclosure/navigation labels now use editorial Title Case. Examples include Research & Practice, Reading & Outdoors, Personal Website, Research & Professional Work, and Environmental & Natural Resource Economics. Longer descriptions and explanatory prose retain sentence case. Code identifiers, acronyms, canonical application names, all embedded artwork, the lowercase italic desk. wordmark and **“Everything in its right place.”** remain untouched.

## Focused verification

- **307 source/accessibility checks passed**, including deterministic generation, asset/font provenance, exact IH. crop pixels, initially hidden authentic faces, labels and destination references.
- All **13 runtime tests passed**, covering reveal/return, history, scrolling/focus, reduced motion and Eastern/DST/manual appearance. The runtime script is byte-identical to the previous commit.
- All **12 external destinations** returned HTTP 200 during this pass; both portfolio fragments were found. Every generated href remains unchanged.
- Excluding the QST presentation subtree, the generated page differs from the previous commit **only in letter case**. Project-data changes are also case-only. All six other authentic presentations and all seven collection presentations retain their exact structures and wording, apart from capitalization.
- All **51 existing non-document assets** are unchanged. The canonical header/bookplate markup is identical; the approved footer quote is exact. Existing CSS is untouched; added rules target QST, with uniquely named font declarations used only there.
- Targeted inspection confirms a single functioning QST destination link inside the new article and no fabricated tabs, input fields, progress controls or embedded application. JavaScript syntax and `git diff --check` pass.
- Font-advance checks for capitalized chapter titles fit the available widths at representative 320px, 390px and 1470px viewports. This is a sizing check, not browser layout evidence.

## Local visual review

Refresh the existing branch checkout and local server as described in `LOCAL-REVIEW.md`. Open `http://localhost:8000/desk/?review=qst-title-case#work-qst` on Mac; replace localhost with the Mac's Wi-Fi address on iPhone. Reload without cache. This route reveals QST only.

Check the module sidebar/phone directory, language cards, green Python hierarchy, text wrapping and typography against the supplied actual-application screenshot. Switch Day/Night and use Return, individual Reveal and full Research selection. Confirm the new capitalization wraps comfortably throughout the collection and revealed views.

The screenshots were inspected, but **the new integrated page has not been rendered in a supported browser here**. The malfunctioning managed Sites preview was not retried and no substitute preview infrastructure was used. Final desktop/iPhone visual acceptance remains with the owner. Keep PR #4 draft, unmerged and undeployed.
