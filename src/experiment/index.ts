import { initJsPsych } from "jspsych";

import BrowserCheckPlugin from "@jspsych/plugin-browser-check";
import PreloadPlugin from "@jspsych/plugin-preload";
import ImageSliderResponsePlugin from "@jspsych/plugin-image-slider-response";

import { FACES, FACES_IMAGES, FaceForRating } from "./sequence/faces";
import { get_blocks, FaceForTrial } from "./sequence/trial_selection";
import { trial } from "./sequence/trial";
import { rating } from "./sequence/rating";

async function run() {
  const jsPsych = initJsPsych();

  const rating_timeline = [];
  let TRIAL_SEQUENCE: FaceForTrial[][];

  rating_timeline.push({
    type: BrowserCheckPlugin,
    minimum_height: 625,
    minimum_width: 625,
  });

  rating_timeline.push({
    type: PreloadPlugin,
    images: FACES_IMAGES,
    message: "Loading...",
  });

  rating_timeline.push({
    timeline: [
      {
        type: ImageSliderResponsePlugin,
        stimulus: jsPsych.timelineVariable("img"),
        prompt: "<p>How pleasant or unpleasant do judge this face?</p>",
        min: -100,
        slider_start: 0,
        labels: ["Very unpleasant (-100)", "0", "Very pleasant (100)"],
        on_finish(data) {
          FACES.find(
            (face: FaceForRating) =>
              face.img === jsPsych.timelineVariable("img")
          ).rating = Math.abs(data.response);
        },
      },
    ],
    timeline_variables: FACES,
    randomize_order: true,
    on_timeline_finish() {
      TRIAL_SEQUENCE = get_blocks(FACES, 10);
    },
  });

  await jsPsych.run(rating_timeline);

  const trial_timeline = [];
  for (const seq in TRIAL_SEQUENCE) {
    trial_timeline.push({
      timeline: trial(jsPsych),
      timeline_variables: TRIAL_SEQUENCE[seq],
    });
  }

  await jsPsych.run(trial_timeline);
}

run();
