import React, {useCallback, useReducer, useState} from 'react';

import IngredientForm from './IngredientForm';
import Search from './Search';
import IngredientList from "./IngredientList";
import ErrorModal from "../UI/ErrorModal";

//this is our reducer function. we have to send this to useReducer()
//Reducer method by default take 2 arguments.
// 1. current state 2. action object
const ingredientReducer = (currentIngredients, action) => {
    switch(action.type){
        case 'SET':
            return action.ingredients;
        case 'ADD':
            return [...currentIngredients, action.ingredients]
        case 'DELETE':
            return currentIngredients.filter(ing => ing.id !== action.id);//expect to have id field on action
        default:
            throw new Error('Should not get there!');
    }
}

const Ingredients = () => {
  //when working with useReducer(), react will re-render the component whenever your reducer returns the new state
  const [userIngredients, myDispatch] = useReducer(ingredientReducer, []);//useReducer takes 2 arguments, 1. reducer
  // function 2. starting state
  // const [userIngredients, setUserIngredients] = useState([]); //we replaced this useState by useReducer
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
          // setUserIngredients(prevIngredients => [
          //     ...prevIngredients,
          //     {id: responseData.name, ...ingredient}
          // ])
          myDispatch({//here we ara passing the action object to myDispatch method
              type: 'ADD',
              ingredients: { id: responseData.name, ...ingredient}
          })
      });
  }

  const removeIngredientHandler = ingredientId => {
      setIsLoading(true);
      fetch(`https://react-prep-b4fd7-default-rtdb.firebaseio.com/ingredient/${ingredientId}.json`,{
          method: 'DELETE'
      }).then(response => {
          setIsLoading(false);
          // setUserIngredients(prevIngredients =>
          //     prevIngredients.filter((ingredient) => ingredient.id !== ingredientId)
          // );
          myDispatch({//here we ara passing the action object to myDispatch method
              type: 'DELETE',
              id: ingredientId
          })
      }).catch(error => {
          // setError('Something went wrong!');
          setError(error.message);
          setIsLoading(false);
      });
  }

  const filteredIngredientsHandler = useCallback((filteredIngredients) => {
        // setUserIngredients(filteredIngredients);
      myDispatch({type: 'SET', ingredients: filteredIngredients});//here ADD, SET, DELETE is the identifier we use
      // in reducer
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
