import { initJsPsych } from "jspsych";

import BrowserCheckPlugin from "@jspsych/plugin-browser-check";
import PreloadPlugin from "@jspsych/plugin-preload";

import { FACES, FACES_IMAGES, KEYS } from "./sequence/faces";
import { get_block, select_faces } from "./sequence/trial_selection";

import { prerating } from "./sequence/prerating";
import { trial } from "./sequence/trial";
import { practice_trial } from "./sequence/practice";
import { postrating } from "./sequence/postrating";
import FullscreenPlugin from "@jspsych/plugin-fullscreen";

async function run() {
  const jsPsych = initJsPsych();

  const base_timeline = [];

  base_timeline.push({
    type: PreloadPlugin,
    images: FACES_IMAGES,
    message: "Loading...",
  });

  await jsPsych.run([
    { type: FullscreenPlugin, fullscreen_mode: true },
    {
      type: BrowserCheckPlugin,
      minimum_height: 625,
      minimum_width: 625,
    },
  ]);

  await prerating(jsPsych, FACES, base_timeline);

  const [PRACTICE_FACES, TRIAL_FACES] = select_faces(FACES);

  const PRACTICE_SEQUENCE = get_block(PRACTICE_FACES, true);

  const TRIAL_SEQUENCE = [];

  for (let i = 0; i < 5; ++i) {
    TRIAL_SEQUENCE.push(get_block(TRIAL_FACES));
  }

  await practice_trial(jsPsych, PRACTICE_SEQUENCE, base_timeline, KEYS);

  await trial(jsPsych, TRIAL_SEQUENCE, base_timeline, KEYS);

  await postrating(jsPsych, TRIAL_FACES, base_timeline);

  if (typeof jatos !== "undefined") {
    jatos
      .submitResultData(jsPsych.data.get().csv())
      .then(() => jatos.endStudy())
      .catch(() => console.log(jsPsych.data.get().csv()));
  }
}

if (typeof jatos !== "undefined") {
  jatos.onLoad(run);
} else {
  run();
}
