import { initJsPsych } from "jspsych";

import BrowserCheckPlugin from "@jspsych/plugin-browser-check";
import PreloadPlugin from "@jspsych/plugin-preload";

import { cloneDeep } from "lodash";

import { FACES, FACES_IMAGES } from "./sequence/faces";
import { get_blocks, select_faces } from "./sequence/trial_selection";

import { rating } from "./sequence/rating";
import { trial } from "./sequence/trial";
import { practice_trial } from "./sequence/practice";
import { postrating } from "./sequence/postrating";

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

  await rating(jsPsych, FACES, base_timeline);

  const [PRACTICE_FACES, SEQUENCE_FACES] = select_faces(FACES);

  const [PRACTICE_SEQUENCE, TRIAL_SEQUENCE] = get_blocks(
    PRACTICE_FACES,
    SEQUENCE_FACES,
    10
  );

  await practice_trial(jsPsych, PRACTICE_SEQUENCE, base_timeline);

  await trial(jsPsych, TRIAL_SEQUENCE, base_timeline);

  await postrating(jsPsych, SEQUENCE_FACES, base_timeline);
}

run();
