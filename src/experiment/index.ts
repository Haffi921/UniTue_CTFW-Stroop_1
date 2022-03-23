import { initJsPsych } from "jspsych";

import BrowserCheckPlugin from "@jspsych/plugin-browser-check";
import PreloadPlugin from "@jspsych/plugin-preload";
import ImageSliderResponsePlugin from "@jspsych/plugin-image-slider-response";

import { FACES, FACES_IMAGES, FaceForRating } from "./sequence/faces";
import { get_blocks, FaceForTrial } from "./sequence/trial_selection";

function run() {
  const jsPsych = initJsPsych();

  const timeline = [];
  let TRIAL_SEQUENCE: FaceForTrial[][];

  timeline.push({
    type: BrowserCheckPlugin,
    minimum_height: 625,
    minimum_width: 625,
  });

  timeline.push({
    type: PreloadPlugin,
    images: FACES_IMAGES,
    message: "Loading...",
  });

  timeline.push({
    timeline: [
      {
        type: ImageSliderResponsePlugin,
        stimulus: jsPsych.timelineVariable("img"),
        prompt: "<p>How pleasant or unpleasant do judge this face?</p>",
        min: -100,
        slider_start: 0,
        labels: ["Very unpleasant (-100", "0", "Very pleasant (100)"],
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
      console.log(TRIAL_SEQUENCE);
    },
  });

  jsPsych.run(timeline);
}

run();
