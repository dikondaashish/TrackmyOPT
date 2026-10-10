const GUIDES = [
  {
    target: '.journey',
    title: 'Start here',
    copy: 'Save your details once, then use TrackMyOPT alongside your applications. Click Next to look around.',
  },
  {
    target: '#demo-action',
    title: 'This is Prefill',
    copy: 'This button fills matching empty fields. Try it with our sample profile, or click Next to keep exploring.',
  },
  {
    target: '#demo-action',
    title: 'Tailor a resume to the role',
    copy: 'Generate custom resume uses your source resume and the job description. This preview shows a prepared example without using AI credits.',
  },
  {
    target: '#demo-action',
    title: 'Keep track of this job',
    copy: 'Save a posting, then update its stage as you apply and interview. Try this sample button; your real tracker will not change.',
  },
  {
    target: '.clock-reading',
    title: 'Your OPT timeline',
    copy: 'OPT Clock uses your saved dates and employment history. Use OPT Apply Date for filing-date planning. These numbers are examples only.',
  },
  {
    target: '.clock-reading',
    title: 'Your STEM OPT timeline',
    copy: 'STEM Clock follows your timeline across OPT and STEM. STEM Apply Date helps with extension filing dates. Check your real history and DSO guidance.',
  },
  {
    target: '.finish-demo > a',
    title: 'Make your first real move',
    copy: 'Open your application profile when you are ready. Finish closes this tour; you can replay it from the extension anytime.',
  },
] as const;

/** Non-modal coach marks: the highlighted control and page remain operable. */
export function mountTourGuide(
  root: HTMLElement,
  step: number,
  skip: () => void,
  focus: boolean
): () => void {
  const guide = GUIDES[step];
  const target = root.querySelector<HTMLElement>(guide.target);
  const navigation = root.querySelector<HTMLElement>('.tour-footer');
  if (!target || !navigation) return () => {};
  const doc = root.ownerDocument;
  const view = doc.defaultView!;
  const ring = doc.createElement('div');
  ring.id = 'tour-spotlight';
  ring.setAttribute('aria-hidden', 'true');
  const coach = doc.createElement('section');
  coach.id = 'tour-coach';
  coach.setAttribute('aria-labelledby', 'guide-title');
  coach.innerHTML = `<div class="coach-top"><span class="eyebrow">STEP ${step + 1} OF ${GUIDES.length}</span><button type="button" id="coach-skip" class="quiet">Skip</button></div><h2 id="guide-title" tabindex="-1">${guide.title}</h2><p id="guide-copy">${guide.copy}</p>`;
  coach.append(navigation);
  const error = root.querySelector('#save-note');
  if (error) coach.append(error);
  const next = coach.querySelector('#next');
  if (next)
    next.textContent = step === GUIDES.length - 1 ? 'Finish tour' : 'Next →';
  const oldDescription = target.getAttribute('aria-describedby');
  target.setAttribute(
    'aria-describedby',
    [oldDescription, 'guide-copy'].filter(Boolean).join(' ')
  );
  target.dataset.tourHighlight = 'true';
  root.append(ring, coach);
  doc.body.classList.add('has-tour-guide');
  coach.querySelector('#coach-skip')!.addEventListener('click', skip);

  function position() {
    if (!target!.isConnected) return;
    const r = target!.getBoundingClientRect();
    const width = view.innerWidth;
    const height = view.innerHeight;
    const cw = Math.min(340, width - 24);
    coach.style.width = `${cw}px`;
    const ch = coach.getBoundingClientRect().height;
    const gap = 18;
    let x = 12;
    let y = Math.max(12, height - ch - 12);
    let side = 'dock';
    if (width > 720 && r.left >= cw + gap + 12) {
      x = r.left - cw - gap;
      y = Math.max(12, Math.min(r.top, height - ch - 12));
      side = 'left';
    } else if (width > 720 && width - r.right >= cw + gap + 12) {
      x = r.right + gap;
      y = Math.max(12, Math.min(r.top, height - ch - 12));
      side = 'right';
    } else if (width > 720 && height - r.bottom >= ch + gap + 12) {
      x = Math.max(12, Math.min(r.left, width - cw - 12));
      y = r.bottom + gap;
      side = 'below';
    } else if (width > 720 && r.top >= ch + gap + 12) {
      x = Math.max(12, Math.min(r.left, width - cw - 12));
      y = r.top - ch - gap;
      side = 'above';
    }
    coach.dataset.placement = side;
    coach.style.left = `${side === 'dock' ? Math.max(12, (width - cw) / 2) : x}px`;
    coach.style.top = `${y}px`;
    doc.body.style.setProperty('--tour-coach-height', `${ch + 32}px`);
    ring.style.left = `${r.left - 6}px`;
    ring.style.top = `${r.top - 6}px`;
    ring.style.width = `${r.width + 12}px`;
    ring.style.height = `${r.height + 12}px`;
  }
  let frame = 0;
  const schedule = () => {
    if (!frame)
      frame = view.requestAnimationFrame(() => {
        frame = 0;
        position();
      });
  };
  position();
  // Scroll only on a step change, never in response to the user's own scroll.
  if (
    typeof view.scrollTo === 'function' &&
    typeof target.scrollIntoView === 'function'
  ) {
    const r = target.getBoundingClientRect();
    const available =
      coach.dataset.placement === 'dock'
        ? view.innerHeight - coach.getBoundingClientRect().height - 40
        : view.innerHeight;
    view.scrollTo({
      top: Math.max(
        0,
        view.scrollY + r.top - Math.max(24, (available - r.height) / 2)
      ),
      behavior: 'instant' as ScrollBehavior,
    });
    position();
  }
  view.addEventListener('resize', schedule);
  view.addEventListener('scroll', schedule, { passive: true });
  const observer =
    typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
  observer?.observe(target);
  observer?.observe(coach);
  if (focus)
    coach
      .querySelector<HTMLElement>('#guide-title')
      ?.focus({ preventScroll: true });
  return () => {
    view.cancelAnimationFrame(frame);
    view.removeEventListener('resize', schedule);
    view.removeEventListener('scroll', schedule);
    observer?.disconnect();
    delete target.dataset.tourHighlight;
    if (oldDescription === null) target.removeAttribute('aria-describedby');
    else target.setAttribute('aria-describedby', oldDescription);
    ring.remove();
    coach.remove();
    doc.body.classList.remove('has-tour-guide');
    doc.body.style.removeProperty('--tour-coach-height');
  };
}
