import { initJsPsych } from "jspsych";

import BrowserCheckPlugin from "@jspsych/plugin-browser-check";
import PreloadPlugin from "@jspsych/plugin-preload";

import { FACES, FACES_IMAGES, KEYS } from "./sequence/faces";
import { get_blocks, select_faces } from "./sequence/trial_selection";

import { prerating } from "./sequence/prerating";
import { trial } from "./sequence/trial";
import { practice_trial } from "./sequence/practice";
import { postrating } from "./sequence/postrating";
import FullscreenPlugin from "@jspsych/plugin-fullscreen";

async function run() {
  const jsPsych = initJsPsych();

  const base_timeline = [];

  base_timeline.push({
    type: BrowserCheckPlugin,
    minimum_height: 625,
    minimum_width: 625,
  });

  base_timeline.push({
    type: PreloadPlugin,
    images: FACES_IMAGES,
    message: "Loading...",
  });

  await jsPsych.run([{ type: FullscreenPlugin, fullscreen_mode: true }]);

  await prerating(jsPsych, FACES, base_timeline);

  const [PRACTICE_FACES, SEQUENCE_FACES] = select_faces(FACES);

  const [PRACTICE_SEQUENCE, TRIAL_SEQUENCE] = get_blocks(
    PRACTICE_FACES,
    SEQUENCE_FACES,
    10
  );

  await practice_trial(jsPsych, PRACTICE_SEQUENCE, base_timeline, KEYS);

  await trial(jsPsych, TRIAL_SEQUENCE, base_timeline, KEYS);

  await postrating(jsPsych, SEQUENCE_FACES, base_timeline);

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
