import { initJsPsych } from "jspsych";

import BrowserCheckPlugin from "@jspsych/plugin-browser-check";
import PreloadPlugin from "@jspsych/plugin-preload";
import ImageSliderResponsePlugin from "@jspsych/plugin-image-slider-response";

import { sortBy, shuffle } from "lodash";

import { FACES, FACES_IMAGES, FacesForRating } from "./sequence/faces";

function run() {
  const jsPsych = initJsPsych();

  const timeline = [];
  let SORTED_FACES: object[];

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
            (face: FacesForRating) =>
              face.img === jsPsych.timelineVariable("img")
          ).rating = Math.abs(data.response);
        },
      },
    ],
    timeline_variables: FACES,
    randomize_order: true,
    on_timeline_finish() {
      const gender_equalizer = {
        male: 2,
        female: 2,
      };
      // This does not do well with people who are rated the same; it puts preference on those who are first in the original list
      // Prerandomizing before the rating would put preference on the first shown faces
      // Randomizing after the rating would possibly solve this issue
      SORTED_FACES = sortBy(shuffle(FACES), ["rating"]).reduce(
        (arr: object[], face: any) => {
          if (gender_equalizer[face.gender] > 0) {
            arr.push(face);
            --gender_equalizer[face.gender];
          }

          return arr;
        },
        []
      );
      console.log(SORTED_FACES);
    },
  });

  jsPsych.run(timeline);
}

run();
