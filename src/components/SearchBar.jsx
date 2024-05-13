import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { validate } from "../utils/validate";

export const SearchBar = ({ label }) => {
  const navigate = useNavigate();

  const onClick = async () => {
    const { value: input } = document.getElementById("search");
    const { type, value } = validate(input);
    if (type) {
      navigate(value); // TODO sanitize input before navigate
    }
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter") {
      onClick();
    }
  };

  return (
    <div className="search">
      <label htmlFor="search">{label}</label>
      <input
        type="search"
        id="search"
        autoFocus={true}
        onKeyDown={onKeyDown}
        placeholder={label}
      />
      <button type="submit" onClick={onClick}>
        <FaSearch />
      </button>
    </div>
  );
};
