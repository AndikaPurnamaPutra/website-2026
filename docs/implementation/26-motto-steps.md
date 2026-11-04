# Motto: one gesture, one step

## Goal

The Motto flips follow the scroll position (scrub): a small scroll leaves a
flip half done, a quicker one runs past the next step. The user wants the
feel of sstr.tech's `section_webgl`: each step plays in full, on its own
clock, whatever the strength of the scroll.

## Reference (sstr.tech, read from its code)

- Desktop "step mode": one wheel gesture = one step to the next stop; the
  strength does not matter.
- A step plays on its own clock: about 1.1s, `sine.inOut`.
- Wheel input during a step is swallowed; the next step needs a new gesture
  (a gesture ends after about 160ms without wheel events).
- At the last stop, a gesture outward lets the page go on.

## Approach

The pattern of About Principles (`src/js/principles-scroll.js`), already used
on the site, applied to Motto:

- The pin, the timeline and its content stay as they are: the flips, the
  gradients, the glow, the label, the CTA, the entry and the exit.
- On the wheel, inside the pin, each new gesture glides the page
  (`lenis.scrollTo`) to the next calm point. The timeline follows the glide,
  so a flip always plays in full, in about 1.1s.
- Wheel events during a glide are swallowed, as are the rest of the same
  gesture.
- Into the section: the swipe that arrives is carried a little into step 0
  and held there, as in Principles.
- Out of the section:
  - After the last step, a gesture down glides through the exit, so the
    footer hand-over plays in full.
  - At step 0, a gesture up scrolls freely.
- Touch screens and the keyboard scroll freely, as in Principles.
- The 1.5× lengthening (uncommitted) is undone. In step mode the distances
  no longer set the tempo, the glide does. The original lengths keep the
  page shorter for touch.

### Tuned with the user

- Times: flip 0.8s, highlight step 0.4s, exit 1.2s (1.1s felt too slow).
- More seamless:
  - a gesture during a step is kept, and its step follows at once (one at
    most);
  - a swipe into the section glides on and lands softly on the first stop
    (0.6s, cubic out);
  - the steps ease with `sine.inOut`.

## Files

- `src/js/motto-scroll.js`: the wheel steps, and back to the original lengths.
- Branch `motto/v1`, made from `milestone/v1`.

## Steps

- [x] Make `motto/v1` and undo the 1.5× edit.
- [x] Add the wheel steps: gesture detection, glide, swallowing, entry
      carry, exit glide.
- [x] Build; check in headless Chrome with wheel events:
  - [x] small and large gestures each move exactly one step;
  - [x] a flip is never left half done;
  - [x] the highlights still play;
  - [x] scrolling up works step by step;
  - [x] the footer hand-over still works;
  - [x] no errors.
- [ ] The user checks the feel. If approved: commit and push `motto/v1`.

## Acceptance

- Small and large wheel gestures each move exactly one step.
- A flip or highlight is never left half done.
- The steps go back up one by one.
- The entry and the exit are smooth.
- Touch is unchanged.

## Open questions

- Glide time per step: 1.1s, as in sstr.tech. To be tuned by feel.
- Touch: free scrolling as now, or one swipe = one step as on sstr.tech?
  Proposed: free, as in Principles.
