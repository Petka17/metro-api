// https://apidata.mos.ru/v1/datasets/1488/rows/?api_key=d832d9a2b08290bf6d569cb571b64849

import { promises as fs } from "fs";
import axios from "axios";
import Decoder, * as _ from "jsonous";
import R from "ramda";

const API_KEY = "d832d9a2b08290bf6d569cb571b64849";

const URL = `https://apidata.mos.ru/v1/datasets/1488/rows/?api_key=${API_KEY}`;

type DecodedMetro = {
  station: string;
  line: string;
  status: string;
};

const metroDecoder: Decoder<DecodedMetro> = _.succeed({})
  .assign("station", _.at(["Cells", "Station"], _.string))
  .assign("line", _.at(["Cells", "Line"], _.string))
  .assign("status", _.at(["Cells", "Status"], _.string));

type DecodedMetroList = DecodedMetro[];

const metroListDecoder: Decoder<DecodedMetroList> = _.array(metroDecoder);

type Metro = {
  station: string;
  status: string;
};

type MetroLine = {
  line: string;
  stations: Metro[];
};

const main = async (): Promise<MetroLine[]> => {
  const res = await axios({ method: "get", url: URL });

  const [data, errorMessage] = metroListDecoder
    .decodeAny(res.data)
    .cata<[DecodedMetroList | null, string]>({
      Ok: d => [d, ""],
      Err: err => [null, err]
    });

  if (errorMessage !== "" || data === null) {
    console.log(errorMessage);
  }

  const metroLines = data.reduce((metroLines: MetroLine[], station) => {
    const metroLine = metroLines.filter(v => v.line === station.line)[0];

    if (metroLine) {
      metroLine.stations.push({
        station: station.station,
        status: station.status
      });
    } else {
      metroLines.push({
        line: station.line,
        stations: [
          {
            station: station.station,
            status: station.status
          }
        ]
      });
    }

    return metroLines;
  }, []);

  return metroLines;
};

if (require.main === module) {
  main()
    .then(v => fs.writeFile("metro-mos.json", JSON.stringify(v, null, 2)))
    .catch(err => {
      console.error(err);
    });
}

export default main;
