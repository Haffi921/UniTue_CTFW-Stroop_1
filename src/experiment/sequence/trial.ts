import { JsPsych } from "jspsych";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import InstructionsPlugin from "@jspsych/plugin-instructions";
import { FaceForTrial } from "./trial_selection";

function instructions(keys: string[]) {
  const continue_hint = "Please press the right arrow key to continue &#x27A1";
  const backtrack_hint = "&#x2B05 Left arrow key to go back";

  function hint(backtrack = true) {
    let text = continue_hint;
    if (backtrack) {
      text = continue_hint + "</p><p>" + backtrack_hint;
    }

    return `<div class="hint"><p>${text}</p></div>`;
  }

  function page(backtrack = true, ...args) {
    return `<div class="instruction_container"><p>${Array.from(args).join(
      "</p><p>"
    )}</p>${hint(backtrack)}</div>`;
  }

  const instructions_pages = [
    page(false, "This is the third part out of four in this experiment"),
    page(true, "Please move your mouse cursor to the edge of your screen"),
    page(
      true,
      "In this part, your task is again to classify faces as either male or female",
      "There will additionally be a word present. This word is not relevant and is to be ignored",
      "Only respond to the face!"
    ),
    page(
      true,
      "You will not receive any feedback",
      "Please try to be accurate, but also fast"
    ),
    page(
      true,
      "There will be a summary during breaks informing you about how well you are doing"
    ),
    page(
      true,
      `You should respond to male faces with [${keys[0].toUpperCase()}] and to female faces with [${keys[1].toUpperCase()}]`
    ),
    page(
      true,
      "You may now begin",
      "When you are ready to <b>start</b> press the right arrow key &#x27A1"
    ),
  ];

  return {
    type: InstructionsPlugin,
    pages: instructions_pages,
  };
}

function between_trial_stim(
  correct: number,
  incorrect: number,
  too_early: number,
  too_late: number
) {
  const summary = `<br /><p>In this block you did:</p><p>${correct} correct</p><p>${incorrect} incorrect</p><p>${too_early} too early</p><p>${too_late} too late</p>`;
  return function (time: number) {
    return (
      `<p>You will now have a break for ${time.toString()} seconds</p>` +
      summary
    );
  };
}

export async function trial(
  jsPsych: JsPsych,
  sequence: FaceForTrial[][],
  base_timeline: any[],
  keys: string[]
) {
  const get = jsPsych.timelineVariable;

  let correct = 0,
    incorrect = 0,
    too_early = 0,
    too_late = 0;

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
    post_trial_gap: 500,
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
        block_type: "trial",
      };
    },
    on_load() {
      function remove_stim() {
        const stim = document.getElementsByClassName("trial_container")[0];
        if (stim !== undefined) {
          stim.remove();
        }
      }
      setTimeout(remove_stim, 1000);
    },
    on_finish(data: any) {
      data.correct = jsPsych.pluginAPI.compareKeys(
        data.response,
        data.correct_key
      );

      clearTimeout();

      if (data.response === null) too_late += 1;
      else if (data.rt < 100) too_early += 1;
      else if (data.correct) incorrect += 1;
      else correct += 1;
    },
  };

  const between_trials = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: "",
    on_start(trial) {
      trial.timer = 60;
      const stimulus = between_trial_stim(
        correct,
        incorrect,
        too_early,
        too_late
      );
      const setTimer = () => {
        trial.timer -= 1;
        jsPsych.getDisplayElement().innerHTML = stimulus(trial.timer);
        if (trial.timer > 0) setTimeout(setTimer, 1000);
      };

      setTimer();
    },
    on_finish() {
      correct = 0;
      incorrect = 0;
      too_early = 0;
      too_late = 0;
    },
    choice: "NO_KEYS",
    trial_duration: 60000,
    post_trial_gap: 1000,
  };

  const timeline = [...base_timeline, instructions(keys)];

  for (let seq of sequence) {
    timeline.push(
      {
        timeline: [fixation, target],
        timeline_variables: seq,
      },
      between_trials
    );
  }

  await jsPsych.run(timeline);
}
