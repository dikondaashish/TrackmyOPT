# Validation and visual review

- Final Hyperframes check: passed with 0 errors. Lint reports 48 non-blocking warnings: 44 suggestions to split nested scenes into sub-compositions, 3 duplicate-media discovery notices from reused brand/capture images, and 1 dense-track suggestion for the 42-scene timeline. Runtime, layout, motion, and contrast checks report 0 warnings; contrast passed for all 42 demo scenes.
- Native render: one worker, hardware GPU, 1920 × 1080, 30 fps, 2,700 frames. The final poster-frame pass used macOS VideoToolbox.
- FFprobe: 90.000 seconds, H.264 video and AAC audio; final file 33,552,481 bytes.
- Visual inspection: checked 11 composition snapshots across the introduction, demo, transition, and closing, plus one frame from each of the 42 scenes extracted from the encoded MP4. Checked encoded opening, closing, and poster at full size. No missing captures, clipped headlines, blank transitions, or broken laptop frames found.
- Audio: the poster-frame pass preserved the AAC packet stream exactly (matching SHA-256 before and after). Integrated loudness is -14.7 LUFS; true peak -1.6 dBFS. The final music fade reaches silence in the last 1.36 seconds. Seventeen aligned narration takes cover introduction, demo, and closing. Music is dynamically carved under speech.
- The subtitle file has 17 cues aligned to the final narration. The feature timestamps in `share-copy.txt` were updated to the new cut.

The production-account backends and Chrome Web Store submission were outside this demo. Screen captures use actual extension components with fictional fixture data and illustrative service responses. Service waits are shortened and labeled. No application source was changed.
