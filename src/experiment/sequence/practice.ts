import { JsPsych } from "jspsych";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import { FaceForTrial } from "./trial_selection";

export async function practice_trial(
  jsPsych: JsPsych,
  sequence: FaceForTrial[],
  base_timeline: any[]
) {
  function remove_stim() {
    const stim = document.getElementsByClassName("trial_container")[0];
    if (stim !== undefined) {
      stim.remove();
    }
  }

  const get = jsPsych.timelineVariable;

  function createDisplay(): string {
    return (
      "<div class='trial_container'>" +
      `<img class='target' src='${get("img")}' />` +
      `<div class='distractor_container ${get("position")}'>` +
      `<p class="distractor">${get("distractor")}</p>` +
      "</div></div>"
    );
  }

  // Trial components
  const fixation = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: "<p class='fixation_cross'>+</p>",
    choices: "NO_KEYS",
    trial_duration: 500,
  };

  const target = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: createDisplay,
    choices: ["d", "l"],
    trial_duration: 1500,
    data() {
      return {
        distractor: get("distractor"),
        target: get("img"),
        gender: get("gender"),
        rating: get("rating"),
        proportion_congruency: get("proportion_congruency"),
        congruency: get("congruency"),
        position: get("position"),
        correct_key: get("correct_key"),
      };
    },
    on_load() {
      setTimeout(remove_stim, 1000);
    },
    on_finish(data: any) {
      data.correct = jsPsych.pluginAPI.compareKeys(
        data.response,
        data.correct_key
      );
      clearTimeout();
    },
  };

  const feedback = {
    type: HtmlKeyboardResponsePlugin,
    stimulus() {
      //@ts-ignore
      const data = jsPsych.data.getLastTrialData().trials[0];
      const feedback_text =
        data.rt < 100
          ? "Too early"
          : data.response === null
          ? "Too late"
          : data.correct
          ? ""
          : "Wrong";
      return (
        "<div class='feedback_container'>" +
        `<p class="feedback">${feedback_text}</p>` +
        "</div>"
      );
    },
    choices: "NO_KEYS",
    trial_duration: 1000,
    post_trial_gap: 500,
  };

  const timeline = [...base_timeline];

  timeline.push({
    timeline: [fixation, target, feedback],
    timeline_variables: sequence,
  });

  await jsPsych.run(timeline);
}
