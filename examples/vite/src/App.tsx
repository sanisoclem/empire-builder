import * as React from 'react';
import './App.css';
import { Button } from 'ui';

function App() {
  return (
    <div className="container text-green-500">
      <h1 className="title">
        Admin <br />
        <span>Kitchen Sink</span>
      </h1>
      <Button />
      <p className="description">Built With </p>
    </div>
  );
}

export default App;
