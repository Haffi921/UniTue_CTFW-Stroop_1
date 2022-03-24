import { initJsPsych } from "jspsych";

import BrowserCheckPlugin from "@jspsych/plugin-browser-check";
import PreloadPlugin from "@jspsych/plugin-preload";

import { cloneDeep } from "lodash";

import { FACES, FACES_IMAGES, FaceForRating } from "./sequence/faces";
import { get_blocks, FaceForTrial } from "./sequence/trial_selection";
import { trial } from "./sequence/trial";
import { rating } from "./sequence/rating";

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

  const TRIAL_SEQUENCE = get_blocks(
    await rating(jsPsych, FACES, cloneDeep(base_timeline)),
    10
  );

  await trial(jsPsych, TRIAL_SEQUENCE, base_timeline);
}

run();
