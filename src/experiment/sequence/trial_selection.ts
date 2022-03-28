import { sortBy, shuffle, cloneDeep } from "lodash";

import { FaceForRating } from "./faces";

enum ProportionCongruency {
  mostly_congruent = "Mostly Congruent",
  mostly_incongruent = "Mostly Incongruent",
}

const ProportionCongruencySeed = {
  mostly_congruent: [4, 1],
  mostly_incongruent: [1, 4],
};

enum Congruency {
  congruent = "Congruent",
  incongruent = "Incongruent",
}

enum Position {
  Up = "upper",
  Down = "lower",
}

interface FaceForStroop extends FaceForRating {
  proportion_congruency: ProportionCongruency;
}

export interface FaceForTrial extends FaceForStroop {
  congruency: Congruency;
  position: Position;
  distractor: string;
}

export function select_faces(faces: FaceForRating[]): FaceForRating[][] {
  const gender_equalizer = {
    male: faces.length / 4,
    female: faces.length / 4,
  };

  const selected_faces = [],
    practice_faces = [];

  for (const face of sortBy(faces, ["prerating"])) {
    if (gender_equalizer[face.gender] > 0) {
      selected_faces.push(face);
      --gender_equalizer[face.gender];
    } else {
      practice_faces.push(face);
    }
  }

  return [practice_faces, selected_faces];
}

function prepare_PC(faces: FaceForRating[]): FaceForStroop[] {
  const pc_faces = {
    male: shuffle(faces.filter((face: FaceForTrial) => face.gender === "male")),
    female: shuffle(
      faces.filter((face: FaceForTrial) => face.gender === "female")
    ),
  };

  for (let gender of Object.keys(pc_faces)) {
    pc_faces[gender] = pc_faces[gender].map(
      (face: FaceForStroop, index: number): FaceForStroop => {
        if (index < pc_faces[gender].length / 2) {
          face.proportion_congruency = ProportionCongruency.mostly_congruent;
        } else {
          face.proportion_congruency = ProportionCongruency.mostly_incongruent;
        }
        return face;
      }
    );
    pc_faces[gender] = shuffle(pc_faces[gender]);
  }

  return shuffle([
    ...(<FaceForStroop[]>pc_faces.male),
    ...(<FaceForStroop[]>pc_faces.female),
  ]);
}

class RotatingIndexArray {
  indexArray: number[];

  constructor(seed: number[], length: number) {
    const arrsum = (arr: number[]) =>
      arr.reduce((sum: number, value: number) => sum + value, 0);
    const multiplier = length / arrsum(seed);

    this.indexArray = Array(seed[0] * multiplier).fill(0);
    this.indexArray.push(...Array(seed[1] * multiplier).fill(1));
  }

  forward(i: number = 1) {
    for (let rounds = 0; rounds < i; ++rounds) {
      this.indexArray.push(this.indexArray.shift());
    }
  }
}

function create_practice_blocks(faces: FaceForStroop[]): FaceForTrial[] {
  const pc_faces = {
    mostly_congruent: faces.filter(
      (face: FaceForStroop) =>
        face.proportion_congruency === ProportionCongruency.mostly_congruent
    ),
    mostly_incongruent: faces.filter(
      (face: FaceForStroop) =>
        face.proportion_congruency === ProportionCongruency.mostly_incongruent
    ),
  };

  for (const PC of Object.keys(pc_faces)) {
    const rotating_index = new RotatingIndexArray(
      ProportionCongruencySeed[PC],
      pc_faces[PC].length
    );
    pc_faces[PC] = shuffle(cloneDeep(<FaceForStroop[]>pc_faces[PC]));

    for (const index in pc_faces[PC]) {
      const face: FaceForTrial = pc_faces[PC][index];
      face.congruency =
        rotating_index.indexArray[index] === 0
          ? Congruency.congruent
          : Congruency.incongruent;
      face.position =
        Math.round(Math.random()) === 0 ? Position.Up : Position.Down;

      if (face.gender === "male") {
        face.distractor =
          rotating_index.indexArray[index] === 0 ? "MAN" : "WOMAN";
      } else {
        face.distractor =
          rotating_index.indexArray[index] === 0 ? "WOMAN" : "MAN";
      }
    }
  }

  return shuffle([
    ...(<FaceForTrial[]>pc_faces.mostly_congruent),
    ...(<FaceForTrial[]>pc_faces.mostly_incongruent),
  ]);
}

function create_trial_blocks(
  faces: FaceForStroop[],
  nr_blocks: number
): FaceForTrial[][] {
  const sequence: FaceForTrial[][] = Array(nr_blocks).fill(null);

  for (const block in sequence) {
    sequence[block] = [];
  }

  const pc_faces = {
    mostly_congruent: faces.filter(
      (face: FaceForStroop) =>
        face.proportion_congruency === ProportionCongruency.mostly_congruent
    ),
    mostly_incongruent: faces.filter(
      (face: FaceForStroop) =>
        face.proportion_congruency === ProportionCongruency.mostly_incongruent
    ),
  };

  for (const PC of Object.keys(pc_faces)) {
    const rotating_index = new RotatingIndexArray(
      ProportionCongruencySeed[PC],
      pc_faces[PC].length
    );
    pc_faces[PC] = shuffle(pc_faces[PC]);

    for (const block in sequence) {
      const trial_faces = (<FaceForTrial[]>cloneDeep(pc_faces[PC])).map(
        (face: FaceForTrial, index: number) => {
          face.congruency =
            rotating_index.indexArray[index] === 0
              ? Congruency.congruent
              : Congruency.incongruent;
          face.position =
            Math.round(Math.random()) === 0 ? Position.Up : Position.Down;

          if (face.gender === "male") {
            face.distractor =
              rotating_index.indexArray[index] === 0 ? "MAN" : "WOMAN";
          } else {
            face.distractor =
              rotating_index.indexArray[index] === 0 ? "WOMAN" : "MAN";
          }

          return face;
        }
      );

      sequence[block].push(...shuffle(trial_faces));

      rotating_index.forward(3);
    }

    for (const block in sequence) {
      sequence[block] = shuffle(sequence[block]);
    }
  }

  return shuffle(sequence);
}

export function get_blocks(
  practice_faces: FaceForRating[],
  selected_faces: FaceForRating[],
  nr_blocks: number
): [FaceForTrial[], FaceForTrial[][]] {
  return [
    create_practice_blocks(prepare_PC(practice_faces)),
    create_trial_blocks(prepare_PC(selected_faces), nr_blocks),
  ];
}
