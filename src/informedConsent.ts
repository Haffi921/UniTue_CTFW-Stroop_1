import { initJsPsych } from "jspsych";

import ExternalHtmlPlugin from "@jspsych/plugin-external-html";

function run() {
  const jsPsych = initJsPsych({
    exclusions: {
      min_width: 625,
      min_height: 625,
    },
    on_finish() {
      jatos.startNextComponent(null, "Accepted");
    },
  });

  const timeline = [
    {
      type: ExternalHtmlPlugin,
      url: "informedConsent.html",
      force_refresh: true,
      cont_btn: "start",
      check_fn: function () {
        // @ts-ignore
        if (document.getElementById("consent_y").checked) {
          return true;
        }
        // @ts-ignore
        if (document.getElementById("consent_n").checked) {
          jatos.endStudy(false, "Consent Declined");
        }
      },
    },
  ];

  jsPsych.run(timeline);
}

jatos.onLoad(run);
