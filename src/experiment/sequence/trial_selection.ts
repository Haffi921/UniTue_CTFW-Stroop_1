import { sortBy, shuffle } from "lodash";

import { FacesForRating } from "./faces";

enum ProportionCongruency {
  MostlyCongruent = "Mostly Congruent",
  MostlyIncongruent = "Mostly Incongruent",
}

interface FacesForTrial extends FacesForRating {
  proportion_congruency: ProportionCongruency;
}

function select_faces(faces: FacesForRating[]): FacesForRating[] {
  const gender_equalizer = {
    men: faces.length / 2,
    women: faces.length / 2,
  };
  const SELECTED_FACES = sortBy(shuffle(faces), ["rating"]).reduce(
    (arr: FacesForRating[], face: FacesForRating) => {
      if (gender_equalizer[face.gender] > 0) {
        arr.push(face);
        --gender_equalizer[face.gender];
      }

      return arr;
    },
    []
  );

  return SELECTED_FACES;
}

function prepare_for_trial(faces: FacesForRating[]): FacesForTrial[] {
  const gender_PC_equalizer = {};
  return [];
}
