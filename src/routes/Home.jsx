import { Link } from "react-router-dom";
import { MdDns, MdQuestionMark, MdInfo, MdMail } from "react-icons/md";

export const Home = () => {
  return (
    <>
      <h1>{"Welcome to cybai.re"}</h1>

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
