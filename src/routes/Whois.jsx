import { Outlet, useParams, useLoaderData } from "react-router-dom";

import { SearchBar } from "../components/SearchBar";

const getData = async (name) => {
  const response = await fetch(`https://rdap.org/domain/${name}`);
  return await response.json();
};

export const loader = async ({ params }) => {
  const { name } = params;
  const data = await getData(name);
  return { data };
};

export const Input = () => {
  const title = "Whois";
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
  const { data } = useLoaderData();
  return (
    <>
      <h1>{name}</h1>
      {JSON.stringify(data)}
    </>
  );
};
