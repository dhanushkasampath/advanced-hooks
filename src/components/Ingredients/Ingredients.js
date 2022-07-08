import React, {useCallback, useMemo, useReducer} from 'react';

import IngredientForm from './IngredientForm';
import Search from './Search';
import IngredientList from "./IngredientList";
import ErrorModal from "../UI/ErrorModal";

// using reducers is much cleaner/easy to understand. because all your updating logics are in one place

//this is our reducer function. we have to send this to useReducer()
//Reducer method by default take 2 arguments.
// 1. current state 2. action object
const ingredientReducer = (currentIngredients, action) => {
    switch(action.type){//these are the multiple ways of changing the state
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

const httpReducer = (currentHttpState, action) => {
    switch (action.type){//here we register new states that can exists
        case 'SEND':
            return { loading: true, error: null };
        case 'RESPONSE':
            return { ...currentHttpState, loading: false};//here override the loading property only
        case 'ERROR':
            return { loading: false, error: action.errorMessage}//we can use any thing here instead of errorData.
        case 'CLEAR':
            return { ...currentHttpState, error: null};
        default:
            throw new Error('Should not get there!')
    }
}

const Ingredients = () => {
  //when working with useReducer(), react will re-render the component whenever your reducer returns the new state
  const [userIngredients, myDispatch] = useReducer(ingredientReducer, []);//useReducer takes 2 arguments, 1. reducer
  // function 2. starting state
  // const [userIngredients, setUserIngredients] = useState([]); //we replaced this useState by useReducer
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState();

  const [httpState, myHttpDispatch] = useReducer(httpReducer, { loading: false, error: null });

  const addIngredientHandler = useCallback(ingredient => {
      // setIsLoading(true);
      myHttpDispatch({type: 'SEND'});//here only type is needed. action no need as not used in this switch case
      //fetch returns a promise. the function inside the then execute only when fetch function successfully completed
      fetch('https://react-prep-b4fd7-default-rtdb.firebaseio.com/ingredient.json',{
          method: 'POST',
          body: JSON.stringify(ingredient),
          headers: {
              'Content-Type': 'application/json'
          }
      }).then(response => {
          // setIsLoading(false);
          myHttpDispatch({type: 'RESPONSE'});//this line tell react to how to manage the loading state when response
          // came
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
  }, []);

  const removeIngredientHandler = useCallback(ingredientId => {
      // setIsLoading(true);
      myHttpDispatch({type: 'SEND'});
      fetch(`https://react-prep-b4fd7-default-rtdb.firebaseio.com/ingredient/${ingredientId}.json`,{
          method: 'DELETE'
      }).then(response => {
          // setIsLoading(false);
          myHttpDispatch({type: 'RESPONSE'});
          // setUserIngredients(prevIngredients =>
          //     prevIngredients.filter((ingredient) => ingredient.id !== ingredientId)
          // );
          myDispatch({//here we ara passing the action object to myDispatch method
              type: 'DELETE',
              id: ingredientId
          })
      }).catch(error => {
          // setError('Something went wrong!');
          // setError(error.message);
          // setIsLoading(false);
          myHttpDispatch({type: 'ERROR', errorMessage: 'Something went wrong!'});
      });
  }, []);

  const filteredIngredientsHandler = useCallback((filteredIngredients) => {
        // setUserIngredients(filteredIngredients);
      myDispatch({type: 'SET', ingredients: filteredIngredients});//here ADD, SET, DELETE is the identifier we use
      // in reducer
  }, []);

  const clearError = useCallback(() => {
      myHttpDispatch({type: 'CLEAR'});
  }, []);//wrapped the function in between useCallback is to prevent unnecessary rendering

  const ingredientList = useMemo(() => {
      return (
          <IngredientList
              ingredients={userIngredients}
              onRemoveItem={removeIngredientHandler}
          />
      );
  }, [userIngredients, removeIngredientHandler()]);//these dependencies tells the react when should the component
    // re-render

  return (
    <div className="App">
        {httpState.error && <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>}
      <IngredientForm onAddIngredient={addIngredientHandler} loading={httpState.loading}/>

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler}/>
          {ingredientList}
      </section>
    </div>
  );
}

export default Ingredients;
