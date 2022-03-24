import { JsPsych } from "jspsych";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";

export function trial(jsPsych: JsPsych): object[] {
  const get = jsPsych.timelineVariable;

  function createDisplay(): string {
    return (
      `<img src="${get("img")}"></img>` +
      `<p class="distractor">${get("distractor")}</p>`
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
    on_finish(data: any) {
      data.correct = jsPsych.pluginAPI.compareKeys(
        data.response,
        data.correct_key
      );
    },
  };

  return [fixation, target];
}
