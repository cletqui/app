import { Outlet, useParams, useLoaderData } from "react-router-dom";

import { Title } from "../components/Title";
import { SearchBar } from "../components/SearchBar";

export const loader = async () => {
  const { ip } = useParams();
  const response = await fetch(`http://ip-api.com/json/${ip}`);
  const info = await response.json();
  return { ip, info };
};

export const Input = () => {
  const title = "IP Info";
  document.title = title;
  return (
    <>
      <Title title={title} />
      <SearchBar label={"IP"} />
      <Outlet />
    </>
  );
};

export const Output = () => {
  const { ip, info } = useLoaderData();
  console.log(ip, info);
  return <Title title={ip} />;
};
