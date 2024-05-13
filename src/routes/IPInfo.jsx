import { Outlet, useParams, useLoaderData } from "react-router-dom";

import { SearchBar } from "../components/SearchBar";
import { Code } from "../components/Code";

const getData = async (ip) => {
  const response = await fetch(`http://ip-api.com/json/${ip}`);
  return await response.json();
};

export const loader = async ({ params }) => {
  const { ip } = params;
  const data = await getData(ip);
  return { data };
};

export const Input = () => {
  const title = "IP Info";
  document.title = title;
  return (
    <>
      <h1>{title}</h1>
      <SearchBar label={"IP"} />
      <Outlet />
    </>
  );
};

export const Output = () => {
  const { ip } = useParams();
  const { data } = useLoaderData();
  return (
    <>
      <h1>{ip}</h1>
      <Code data={data} />
    </>
  );
};
