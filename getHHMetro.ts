import { promises as fs } from "fs";
import axios from "axios";
import Decoder, * as _ from "jsonous";
// import { ok, err } from "resulty";
import { ok } from "resulty";

const createHHUrl = (cityId: number): string =>
  `https://api.hh.ru/metro/${cityId}`;

const cities = {
  mos: 1,
  piter: 2
};

const numToStr = new Decoder<string>(v => {
  if (typeof v === "number") {
    return ok(v.toString());
  }
});

// const strWithPostfix = postfix =>
//   new Decoder<string>(v => {
//     if (typeof v === "string") {
//       return ok(`${v}${postfix}`);
//     }

//     return err(`It expected string but ${v} was ${typeof v}`);
//   });

type DecodedMetro = {
  station: string;
  lat: string;
  long: string;
};

const metroDecoder: Decoder<DecodedMetro> = _.succeed({})
  .assign("station", _.field("name", _.string))
  .assign("lat", _.field("lat", numToStr))
  .assign("long", _.field("lng", numToStr));

type DecodedMetroLine = {
  line: string;
  color: string;
  stations: DecodedMetro[];
};

const metroLineDecoder: Decoder<DecodedMetroLine> = _.succeed({})
  .assign("line", _.field("name", _.string))
  .assign("color", _.field("hex_color", _.string))
  .assign("stations", _.field("stations", _.array(metroDecoder)));

type DecodedCity = {
  name: string;
  region: string;
  metro_lines: DecodedMetroLine[];
};

const cityDecoder: Decoder<DecodedCity> = _.succeed({})
  .assign("name", _.field("name", _.string))
  .assign("region", _.field("name", _.string))
  .assign("metro_lines", _.field("lines", _.array(metroLineDecoder)));

const main = async (): Promise<DecodedCity> => {
  const res = await axios({ method: "get", url: createHHUrl(cities["mos"]) });

  const [data, errorMessage] = cityDecoder
    .decodeAny(res.data)
    .cata<[DecodedCity | null, string]>({
      Ok: d => [d, ""],
      Err: err => [null, err]
    });

  if (errorMessage !== "" || data === null) {
    throw new Error(errorMessage);
  }

  return data;
};

if (require.main === module) {
  main()
    .then(v => fs.writeFile("metro.json", JSON.stringify(v, null, 2)))
    .catch(err => {
      console.error(err);
    });
}

export default main;
