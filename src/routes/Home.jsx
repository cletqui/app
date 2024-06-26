import { Link, useNavigate } from "react-router-dom";
import { MdDns, MdQuestionMark, MdInfo, MdMail } from "react-icons/md";
import { TbCertificate } from "react-icons/tb";

import { validate } from "../utils/validate";

const SearchBar = () => {
  const navigate = useNavigate();

  const onClick = async () => {
    const { value: input } = document.getElementById("search");
    const { type, value } = validate(input);
    if (type) {
      navigate(`${type}/${value}`);
    }
  };

  const onKeyUp = (event) => {
    if (event.key === "Enter") {
      onClick();
    }
  };

  return (
    <div className="search">
      <label htmlFor="search">{"Domain or IP"}</label>
      <input
        type="search"
        id="search"
        autoFocus={true}
        onKeyUp={onKeyUp}
        placeholder={"Domain or IP"}
      />
    </div>
  );
};

export const Home = () => {
  document.title = "cybai.re";

  return (
    <>
      <h1>{"Welcome to cybai.re"}</h1>

      <SearchBar />

      <div className="routes">
        <Link to={"nslookup"} title="DNS Lookup">
          <MdDns />
        </Link>

        <Link to={"ipinfo"} title="IP Info">
          <MdInfo />
        </Link>

        <Link to={"whois"} title="WhoIs">
          <MdQuestionMark />
        </Link>

        <Link to={"certs"} title="Certs">
          <TbCertificate />
        </Link>
      </div>

      <hr />

      <div className="routes">
        <Link to={"https://mail.cybai.re/"} title="Mail Analyzer">
          <MdMail />
        </Link>
      </div>
    </>
  );
};
