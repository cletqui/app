import { useParams, Outlet } from "react-router-dom";

export const Domain = () => {
  const { domain } = useParams();

  return (
    <>
      <h1>{domain}</h1>

      <ul>
        <li>DNS</li>
        <li>Whois</li>
        <li>Certs</li>
      </ul>

      <Outlet />
    </>
  );
};
