# 0.2.1 release-tour video

The 56-second `ReleaseTour` composition combines the animated opening, genuine Recordly footage of the packaged TrackMyOPT 0.2.1 interactive tour, and the closing card. It is an illustrative product tour with fictional sample data, not a recording of a signed-in account or live AI/API request.

Before capture, the Chrome Web Store ZIP `trackmyopt-v0.2.1-chrome-web-store.zip` was inspected. Its SHA-256 was `588f68548368fe8200275dd8465c915eaf27f8bc935de9658e67737a6237b71a`; it contained 22 root-level files, a Manifest V3 `manifest.json` at version 0.2.1, no source maps or localhost references, and all referenced entry files. Each extracted file matched the ZIP. The unpacked package then appeared in an isolated Chrome profile as version 0.2.1, extension ID `gjddgijgddfanknphhcidpefoibpgila`, with zero manifest errors. The popup, side panel, and seven-chapter sample tour opened. A transient tour progress-message stall in that fresh profile cleared after reloading the extension; the next progress message returned `{ ok: true }`.

Recordly captured the Chrome window at 2880 × 1620. The original 88.9-second take included setup footage of an older 0.2.0 profile before the 0.2.1 tour became visible. The private edit source is only seconds 40–82 of the take. The crop removes Chrome's internal `chrome-extension://` address and scales the tour to 1728 × 900 at 30 fps for the composition. The unedited Recordly source remains local under Recordly's application-support recordings; `public/recordings/release-tour-0.2.1.mp4` and all `out/` renders are ignored by Git.

The seven on-screen chapters cover application setup, sample Prefill, a prepared résumé example, a sample tracker action, illustrative OPT and STEM timelines, and the next step. The film labels the footage as an interactive sample tour. The tour uses Alex Taylor and Example Corp demo data, does not submit an application, does not change a real tracker, and does not spend AI credits. It does not substantiate the separate 14-feature storyboard's authenticated features; those still need their own truthful recordings before the long walkthrough can be released.

To rebuild locally after placing the edited capture at `public/recordings/release-tour-0.2.1.mp4`:

```sh
npm ci --workspaces=false
npm run typecheck --workspaces=false
npm run render:release-tour --workspaces=false
```

The output is `out/trackmyopt-v0.2.1-release-tour.mp4` (1920 × 1080, 30 fps, silent). Review the first and last footage frames before sharing to confirm only 0.2.1 appears and no private information is visible.
