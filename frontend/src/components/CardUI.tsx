import React, { useState } from 'react';

function CardUI() {
  let _ud: any = localStorage.getItem('user_data');
  let ud = JSON.parse(_ud);
  let userId: string = ud.id; 

  const [message, setMessage] = useState('');
  const [searchResults, setResults] = useState('');
  const [cardList, setCardList] = useState('');
  const [search, setSearchValue] = useState('');
  const [card, setCardNameValue] = useState('');

  async function addCard(e: any): Promise<void> {
    e.preventDefault();
    const obj = { userId: userId, card: card };
    const js = JSON.stringify(obj);
    try {
      await fetch('http://localhost:5000/api/addcard',
        { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });
      setMessage('Card has been added'); 
    } catch (error: any) {
      setMessage(error.toString());
    }
  }

  async function searchCard(e: any): Promise<void> {
    e.preventDefault();
    const obj = { userId: userId, search: search };
    const js = JSON.stringify(obj);
    try {
      const response = await fetch('http://localhost:5000/api/searchcards',
        { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });
      const res = JSON.parse(await response.text());
      setResults('Card(s) have been retrieved');
      setCardList(res.results.join(', ')); 
    } catch (error: any) {
      setResults(error.toString());
    }
  }

  return (
    <div id="cardUIDiv">
      <input type="text" placeholder="Search..." onChange={(e) => setSearchValue(e.target.value)} />
      <button type="button" onClick={searchCard}>Search Card</button><br />
      <span>{searchResults}</span>
      <p>{cardList}</p><br />
      <input type="text" placeholder="Add Card" onChange={(e) => setCardNameValue(e.target.value)} />
      <button type="button" onClick={addCard}>Add Card</button><br />
      <span>{message}</span>
    </div>
  );
}
export default CardUI;

