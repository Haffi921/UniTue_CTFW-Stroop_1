import { range } from "lodash";

interface FacesForRating {
  img: string;
  rating: number;
  gender: string;
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

const FACES: FacesForRating[] = FACES_IMAGES.map((image) => {
  return {
    img: image,
    rating: null,
    gender: image.indexOf("HM") === -1 ? "female" : "male",
  };
});

export { FACES, FACES_IMAGES, FacesForRating };
