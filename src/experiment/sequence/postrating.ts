import { JsPsych } from "jspsych";

import ImageSliderResponsePlugin from "@jspsych/plugin-image-slider-response";
import { FaceForRating } from "./faces";

export async function postrating(
  jsPsych: JsPsych,
  faces: FaceForRating[],
  base_timeline: any[]
) {
  const get = jsPsych.timelineVariable;
  await jsPsych.run([
    ...base_timeline,
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
            ).postrating = Math.abs(data.response);
          },
        },
      ],
      timeline_variables: faces,
      randomize_order: true,
    },
  ]);

  return faces;
}
