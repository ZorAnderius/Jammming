import { useCallback, useState } from "react";
import styles from "./SearchBar.module.css";

const SearchBar = ({ onSearch }) => {
  const [keyWord, setKeyWord] = useState("");
  const handleChange = useCallback(({ target }) => {
    setKeyWord(target.value(trim()));
  });

  const handleSearch = useCallback(() => {
    onSearch(keyWord);
  }, [onSearch, keyWord]);

  return (
    <div>
      <input type="text" onChange={handleChange} />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default SearchBar;
