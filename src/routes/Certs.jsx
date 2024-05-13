import { Outlet, useParams, useLoaderData } from "react-router-dom";

import { SearchBar } from "../components/SearchBar";

const getData = async (domain) => {
  const response = await fetch(`https://crt.cybai.re/?q=${domain}`);
  console.log(response.ok, response.status, response.statusText);
  return await response.json();
};

export const loader = async ({ params }) => {
  const { domain } = params;
  const data = await getData(domain);
  return { data };
};

export const Input = () => {
  const title = "Certificate Transparency";
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
  const { domain } = useParams();
  const { data } = useLoaderData();
  return (
    <>
      <h1>{domain}</h1>
      {JSON.stringify(data)}
    </>
  );
};
