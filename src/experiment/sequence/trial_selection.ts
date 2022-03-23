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

function select_faces(faces: FaceForRating[]): FaceForRating[] {
  const gender_equalizer = {
    male: faces.length / 4,
    female: faces.length / 4,
  };
  const selected_faces = sortBy(shuffle(faces), ["rating"]).reduce(
    (arr: FaceForRating[], face: FaceForRating) => {
      if (gender_equalizer[face.gender] > 0) {
        arr.push(face);
        --gender_equalizer[face.gender];
      }

      return arr;
    },
    []
  );

  return selected_faces;
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

  forward() {
    this.indexArray.push(this.indexArray.shift());
  }
}

function create_blocks(
  faces: FaceForStroop[],
  nr_blocks: number
): FaceForTrial[][] {
  const sequence: FaceForTrial[][] = Array(nr_blocks).fill(null);

  for (const block in sequence) {
    sequence[block] = [];
  }

  const pc_faces = {
    male: {
      mostly_congruent: faces.filter(
        (face: FaceForStroop) =>
          face.gender === "male" &&
          face.proportion_congruency === ProportionCongruency.mostly_congruent
      ),
      mostly_incongruent: faces.filter(
        (face: FaceForStroop) =>
          face.gender === "male" &&
          face.proportion_congruency === ProportionCongruency.mostly_incongruent
      ),
    },
    female: {
      mostly_congruent: faces.filter(
        (face: FaceForStroop) =>
          face.gender === "female" &&
          face.proportion_congruency === ProportionCongruency.mostly_congruent
      ),
      mostly_incongruent: faces.filter(
        (face: FaceForStroop) =>
          face.gender === "female" &&
          face.proportion_congruency === ProportionCongruency.mostly_incongruent
      ),
    },
  };

  for (const gender of Object.keys(pc_faces)) {
    for (const PC of Object.keys(pc_faces[gender])) {
      const rotating_index = new RotatingIndexArray(
        ProportionCongruencySeed[PC],
        pc_faces[gender][PC].length
      );
      pc_faces[gender][PC] = shuffle(pc_faces[gender][PC]);

      for (const block in sequence) {
        const trial_faces = (<FaceForTrial[]>(
          cloneDeep(pc_faces[gender][PC])
        )).map((face: FaceForTrial, index: number) => {
          face.congruency =
            rotating_index.indexArray[index] === 0
              ? Congruency.congruent
              : Congruency.incongruent;
          face.position =
            Math.round(Math.random()) === 0 ? Position.Up : Position.Down;

          if (face.gender === "male") {
            face.distractor =
              rotating_index.indexArray[index] === 0 ? "Man" : "Woman";
          } else {
            face.distractor =
              rotating_index.indexArray[index] === 0 ? "Woman" : "Man";
          }

          return face;
        });

        console.log(sequence);
        sequence[block].push(...shuffle(trial_faces));

        rotating_index.forward();
      }

      for (const block in sequence) {
        sequence[block] = shuffle(sequence[block]);
      }
    }
  }

  console.log(sequence);

  return shuffle(sequence);
}

export function get_blocks(
  faces: FaceForRating[],
  nr_blocks: number
): FaceForTrial[][] {
  return create_blocks(prepare_PC(select_faces(faces)), nr_blocks);
}
