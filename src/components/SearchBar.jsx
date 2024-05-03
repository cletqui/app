import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

export const SearchBar = ({ label }) => {
  const navigate = useNavigate();

  const onClick = async () => {
    const { value } = document.getElementById("search");
    navigate(value);
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
