import React, {useEffect, useRef, useState} from 'react';

import Card from '../UI/Card';
import './Search.css';

const Search = React.memo(props => {
  const { onLoadIngredients } = props;
  const [enteredFilter, setEnteredFilter] = useState('');
  const inputRef = useRef();
 //now once user type some thing in input field we have to fetch data from firebase.
    //which means we have to send a http request in every keystroke

    useEffect(() => {
      const timer = setTimeout(() => {
        if(enteredFilter === inputRef.current.value){
          const query = enteredFilter.length === 0 ? '' : `?orderBy=title&equalTo=${enteredFilter}`;
          fetch('https://react-prep-b4fd7-default-rtdb.firebaseio.com/ingredient.json' + query)
              .then(response => {
                return response.json();
              })
              .then(responseData => {
                const loadedIngredients = [];
                for(const key in responseData){
                  loadedIngredients.push({
                    id: key,
                    title: responseData[key].title,
                    amount: responseData[key].amount
                  })
                }
                onLoadIngredients(loadedIngredients);
              });
        }
      }, 500);
      return () => {
        clearTimeout(timer);
      }
    },[enteredFilter, onLoadIngredients, inputRef]);
  return (
    <section className="search">
      <Card>
        <div className="search-input">
          <label>Filter by Title</label>
          <input type="text"
                 ref={inputRef}
                 value={enteredFilter}
                 onChange={event => setEnteredFilter(event.target.value)} />
        </div>
      </Card>
    </section>
  );
});
//rather than sending requests in every kestroke better to set a timer. that means user has stopped typing.
export default Search;
