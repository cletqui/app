import { Title } from "../components/Title";
import { SearchBar } from "../components/SearchBar";

export const action = async ({ name }) => {
  const response = await fetch(`https://rdap.org/domain/${name}`);
  return await response.json();
};

export const WhoIs = () => {
  const title = "IP Info";
  document.title = title;
  return (
    <>
      <Title title={title} />
      <SearchBar label={"Domain Name or IP"} />
    </>
  );
};
