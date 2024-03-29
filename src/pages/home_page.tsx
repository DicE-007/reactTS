import { PeopleResponse, Person, myContextType } from "../interface/interface";
import { useLocation, useNavigate } from 'react-router-dom';
import "./home_page.css";
import Card from "../components/card";
import { SetStateAction, useContext, useEffect, useState } from "react";
import { createGetRequest } from "../utils/network_utils";
import { MyContext } from "../contextapi/contextapi";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

const HomePage = () => {

  const location = useLocation();
  const data: PeopleResponse = location.state;
  const [loading, setIsLoading] = useState<boolean>(false);
  const [url, setUrl] = useState<string>(data.next ?? "");
  const [users, setUsers] = useState<Person[]>(data.results);
  const [searchQuery, setSearchQuery] = useState('');

  const { favCount } = useContext<myContextType>(MyContext);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [users]);


  const fetchData = async () => {
    setIsLoading(true);
    const newUser: PeopleResponse = await createGetRequest(url ?? "")
    if (url !== newUser.next) {
      setUsers(users => users.concat(newUser.results));
      setUrl(url => newUser.next ?? url);
    }
    setIsLoading(false);
  }

  const handleInputChange = (event: { target: { value: SetStateAction<string>; }; }) => {
    setSearchQuery(event.target.value);
  };

  const filteredData: Person[] = users.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleScroll = () => {
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 1 && users.length <= data.count) {
      fetchData();
    }
  };

  const navigate = useNavigate();

  const handleClick = async () => {
    navigate("/liked_image_page");
  }


  return (
    <div className="homePage">
      <div className="search-container">
        <div className="heart-icon-container" onClick={handleClick}>
          <FontAwesomeIcon icon={faHeart} className="heart-icon" />
          <span className="like-text">{favCount}</span>
        </div>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleInputChange}
          className="search-input"
        />
      </div>
      <div className="content">
        {(searchQuery === "" ? users : filteredData).map((person: Person, index: number) => (
          (<Card person={person} key={index} />)
        ))}
      </div>

      {loading && <CircularProgress className="overlay" style={{ color: 'blueviolet' }} />}
    </div>
  );
}

export default HomePage
