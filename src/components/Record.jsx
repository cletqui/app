import { Table } from "./Table";

const types = {
  1: "A",
  2: "NS",
  5: "CNAME",
  6: "SOA",
  13: "HINFO",
  15: "MX",
  16: "TXT",
  28: "AAAA",
  33: "SRV",
  39: "DNAME",
  42: "APL",
  47: "NSEC",
  48: "DNSKEY",
};

const meanings = {
  A: "IPv4",
  AAAA: "IPv6",
  CNAME: "Canonical Name",
  TXT: "Text String",
  NS: "Name Server",
  MX: "Mail Exchange",
  SOA: "Zone of Authority",
};

function formatSeconds(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${hours ? `${hours}h ` : ""}${minutes ? `${minutes}m ` : ""}${
    remainingSeconds ? `${remainingSeconds}s` : ""
  }`.trim();
}

export const Record = ({ record }) => {
  const { Question, Answer } = record;

  const { type } = Question[0];
  const typeName = types[type] || type;

  const data = Answer?.filter((record) => {
    return record?.type === type; // check if the answer record matches the questioned one
  }).map((record) => {
    const { data, TTL } = record;
    const res = {};

    res[meanings[typeName]] = data;
    res["TTL"] = formatSeconds(TTL);

    return res;
  });

  return (
    <div>
      <h2>{`${typeName} records`}</h2>
      {data ? <Table list={data} /> : `No ${typeName} record found.`}
    </div>
  );
};
