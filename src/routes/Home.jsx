import { Link } from "react-router-dom";
import { MdDns, MdQuestionMark, MdInfo, MdMail } from "react-icons/md";

import { Title } from "../components/Title";

export const Home = () => {
  return (
    <>
      <Title title={"Welcome to cybai.re"} />

      <Link to={"nslookup"}>
        <MdDns />
      </Link>

      <Link to={"ipinfo"}>
        <MdInfo />
      </Link>

      <Link to={"whois"}>
        <MdQuestionMark />
      </Link>

      <Link to={"mail"}>
        <MdMail />
      </Link>
    </>
  );
};
