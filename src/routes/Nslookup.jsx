import { Outlet, useParams } from "react-router-dom";

import { SearchBar } from "../components/SearchBar";
import { Title } from "../components/Title";

export const action = async ({ site }) => {
  const response = await fetch(
    `https://doh.cybai.re/dns-resolve?name=${site}`,
    {
      method: "GET",
      headers: {
        accept: "application/dns-json",
      },
    }
  );
  return await response.json();
};

export const Input = () => {
  const title = "DNS Lookup";
  document.title = title;
  return (
    <>
      <Title title={title} />
      <SearchBar label={"Domain Name"} />
      <Outlet />
    </>
  );
};

export const Output = () => {
  const { name } = useParams();
  return <Title title={name} />;
};
