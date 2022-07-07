import React, {useCallback, useEffect, useState} from 'react';

import IngredientForm from './IngredientForm';
import Search from './Search';
import IngredientList from "./IngredientList";
import ErrorModal from "../UI/ErrorModal";

const Ingredients = () => {
  const [userIngredients, setUserIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const addIngredientHandler = ingredient => {
      setIsLoading(true);
      //fetch returns a promise. the function inside the then execute only when fetch function successfully completed
      fetch('https://react-prep-b4fd7-default-rtdb.firebaseio.com/ingredient.json',{
          method: 'POST',
          body: JSON.stringify(ingredient),
          headers: {
              'Content-Type': 'application/json'
          }
      }).then(response => {
          setIsLoading(false);
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
      setIsLoading(true);
      fetch(`https://react-prep-b4fd7-default-rtdb.firebaseio.com/ingredient/${ingredientId}.jso`,{
          method: 'DELETE'
      }).then(response => {
          setIsLoading(false);
          setUserIngredients(prevIngredients =>
              prevIngredients.filter((ingredient) => ingredient.id !== ingredientId)
          );
      }).catch(error => {
          // setError('Something went wrong!');
          setError(error.message);
          setIsLoading(false);
      });
  }

  const filteredIngredientsHandler = useCallback((filteredIngredients) => {
        setUserIngredients(filteredIngredients);
  }, []);

  const clearError = () => {
      setError(null);
  }

  return (
    <div className="App">
        {error && <ErrorModal onClose={clearError}>{error}</ErrorModal>}
      <IngredientForm onAddIngredient={addIngredientHandler} loading={isLoading}/>

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler}/>
        <IngredientList ingredients={userIngredients} onRemoveItem={removeIngredientHandler}/>
      </section>
    </div>
  );
}

export default Ingredients;
