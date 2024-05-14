import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import { MdDns, MdQuestionMark, MdInfo, MdMenu } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { TbCertificate } from "react-icons/tb";

export const Header = () => {
  const [menu, setMenu] = useState(false);
  const location = useLocation();

  const onClick = () => {
    setMenu(!menu);
  };

  return (
    <div className="header">
      {location.pathname !== "/" && (
        <Link id="home" to="/">
          <FaHome />
        </Link>
      )}

      {menu && (
        <>
          <Link to={"nslookup"}>
            <MdDns />
          </Link>

          <Link to={"ipinfo"}>
            <MdInfo />
          </Link>

          <Link to={"whois"}>
            <MdQuestionMark />
          </Link>

          <Link to={"certs"}><TbCertificate/></Link>
        </>
      )}

      {
        <div id="menu" onClick={onClick}>
          {menu ? <RxCross2 /> : <MdMenu />}
        </div>
      }
    </div>
  );
};
