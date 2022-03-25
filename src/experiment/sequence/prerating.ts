import { JsPsych } from "jspsych";

import ImageSliderResponsePlugin from "@jspsych/plugin-image-slider-response";
import InstructionsPlugin from "@jspsych/plugin-instructions";

import { FaceForRating } from "./faces";

function instructions() {
  const continue_hint = "Please press the right arrow key to continue &#x27A1";
  const backtrack_hint = "&#x2B05 Left arrow key to go back";

  function hint(backtrack = false) {
    let text = continue_hint;
    if (backtrack) {
      text = continue_hint + "</p><p>" + backtrack_hint;
    }

    return `<p>${text}</p>`;
  }

  function page(...args) {
    return `<p>${Array.from(args).join("</p><p>")}</p>`;
  }

  const instructions_pages = [
    page("Welcome!"),
    page("This is the first part out of four in this experiment"),
    page(
      "In this part, we will present to you several faces",
      "Your task is to rate these faces on a sliding scale from -100 to +100 in terms of pleasantness",
      "-100 meaning very unpleasant and +100 meaning very pleasant"
    ),
    page(
      "You may now begin",
      "When you are ready to <b>start</b> press the right arrow key &#x27A1"
    ),
  ];

  return {
    type: InstructionsPlugin,
    pages: instructions_pages,
  };
}

export async function prerating(
  jsPsych: JsPsych,
  faces: FaceForRating[],
  base_timeline: any[]
) {
  const get = jsPsych.timelineVariable;
  await jsPsych.run([
    ...base_timeline,
    instructions(),
    {
      timeline: [
        {
          type: ImageSliderResponsePlugin,
          stimulus: get("img"),
          prompt: "<p>How pleasant or unpleasant do judge this face?</p>",
          min: -100,
          slider_start: 0,
          labels: ["Very unpleasant (-100)", "0", "Very pleasant (100)"],
          on_finish(data) {
            faces.find(
              (face: FaceForRating) => face.img === get("img")
            ).prerating = Math.abs(data.response);
          },
        },
      ],
      timeline_variables: faces,
      randomize_order: true,
    },
  ]);

  return faces;
}
