// index.js - No Modules Format
const { createRoot } = ReactDOM;

console.log('index.js loading with Babel...');
const root = createRoot(document.getElementById('root'));
console.log('About to render App...');
root.render(<App />);
console.log('App rendered!');