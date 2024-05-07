import {
  Outlet,
  useParams,
  useSearchParams,
  useLoaderData,
} from "react-router-dom";

import { SearchBar } from "../components/SearchBar";
import { Record } from "../components/Record";

const resolvers = {
  cloudflare: "cloudflare-dns.com/dns-query",
  google: "dns.google/resolve",
  quad9: "dns.quad9.net:5053/dns-query",
  "cybai.re": "doh.cybai.re/dns-query/cloudflare",
};

const types = ["A", "AAAA", "CNAME", "TXT", "NS", "MX"];

const dnsQuery = async (name, resolver, type) => {
  const endpoint = resolvers[resolver];
  const response = await fetch(
    `https://${endpoint}?name=${name}&type=${type}`,
    {
      method: "GET",
      headers: {
        accept: "application/dns-json",
      },
    }
  );
  return await response.json();
};

const getData = async (name, resolver) => {
  return Promise.all(types.map((type) => dnsQuery(name, resolver, type)));
};

export const loader = async ({ params, request }) => {
  const { name } = params;
  const searchParams = new URL(request.url).searchParams;
  const resolver = searchParams.get("resolver") || "cloudflare"; // Default resolver Cloudflare
  const data = await getData(name, resolver);

  return { data };
};

export const Input = () => {
  const title = "DNS Lookup";
  document.title = title;

  return (
    <>
      <h1>{title}</h1>
      <SearchBar label={"Domain Name"} />
      <Outlet />
    </>
  );
};

export const Output = () => {
  const { name } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const resolver = searchParams.get("resolver") || "cloudflare"; // Default resolver Cloudflare
  const { data } = useLoaderData();

  const Dropdown = () => {
    const onChange = (event) =>
      setSearchParams({ resolver: event.target.value });

    return (
      <>
        <label htmlFor="resolver">Choose a resolver:</label>
        <select
          name="resolver"
          id="resolver"
          value={resolver}
          onChange={onChange}
        >
          {Object.keys(resolvers).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </>
    );
  };

  const SubTitle = () => {
    return (
      <h3>
        {'"'}
        <b>{`${name}`}</b>
        {`" records resolved with `}
        <b>
          <Dropdown />
        </b>
      </h3>
    );
  };

  return (
    <>
      <SubTitle />
      {data.map((record, index) => (
        <Record record={record} key={index} />
      ))}
    </>
  );
};
