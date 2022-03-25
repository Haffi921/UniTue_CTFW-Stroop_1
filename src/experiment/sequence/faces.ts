import { range } from "lodash";

interface FaceForRating {
  img: string;
  prerating: number;
  postrating: number;
  gender: string;
  correct_key: string;
}

function get_indexes(min: number, max: number): string[] {
  return range(min, max + 1).map((x: number) => x.toString().padStart(2, "0"));
}

const FACES_NAMES = ["HM", "HW"];
const FACES_INDEXES = get_indexes(1, 60);

const FACES_IMAGES: string[] = FACES_NAMES.reduce((arr, name) => {
  arr.push(...FACES_INDEXES.map((index) => `faces/${name + index}.bmp`));

  return arr;
}, []);

const GROUP = 0; //Math.round(Math.random());

const FACES: FaceForRating[] = FACES_IMAGES.map((image) => {
  const gender = image.indexOf("HM") === -1 ? "female" : "male";
  return {
    img: image,
    prerating: null,
    postrating: null,
    gender: gender,
    correct_key:
      gender === "male" ? (GROUP === 0 ? "d" : "l") : GROUP === 0 ? "l" : "d",
  };
});

export { FACES, FACES_IMAGES, FaceForRating };
