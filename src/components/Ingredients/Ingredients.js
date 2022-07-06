import React, {useEffect, useState} from 'react';

import IngredientForm from './IngredientForm';
import Search from './Search';
import IngredientList from "./IngredientList";

const Ingredients = () => {
  const [userIngredients, setUserIngredients] = useState([]);

  useEffect(() => {
      fetch('https://react-prep-b4fd7-default-rtdb.firebaseio.com/ingredient.json')
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
              setUserIngredients(loadedIngredients);
          });
  }, []);

  const addIngredientHandler = ingredient => {
      //fetch returns a promise. the function inside the then execute only when fetch function successfully completed
      fetch('https://react-prep-b4fd7-default-rtdb.firebaseio.com/ingredient.json',{
          method: 'POST',
          body: JSON.stringify(ingredient),
          headers: {
              'Content-Type': 'application/json'
          }
      }).then(response => {
          return response.json();//this method gets the body and converted to normal javascript code/ once return
          // the json it goes to next then block
      }).then(responseData => {
          setUserIngredients(prevIngredients => [
              ...prevIngredients,
              {id: responseData.name, ...ingredient}
          ])
      });
  }

  const removeIngredientHandler = ingredientId => {
      setUserIngredients(prevIngredients =>
          prevIngredients.filter((ingredient) => ingredient.id !== ingredientId)
      );
  }

  return (
    <div className="App">
      <IngredientForm onAddIngredient={addIngredientHandler} />

      <section>
        <Search />
        <IngredientList ingredients={userIngredients} onRemoveItem={removeIngredientHandler}/>
      </section>
    </div>
  );
}

export default Ingredients;
