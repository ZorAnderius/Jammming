import { useCallback, useEffect, useState } from "react";
import "./App.css";
import SearchBar from "./SearchBar/SearchBar.jsx";
import Spotify from "../api/spotify.js";

function App() {
  const [searchResult, setSearchResult] = useState([]);

  const handleSearch = useCallback((word) => {
    Spotify.search(word).then(setSearchResult);
  }, []);


  return (
    <>
      <h1>Jammming project</h1>
      <SearchBar onSearch={handleSearch} />
    </>
  );
}

export default App;
