import { render } from 'preact';
import { App } from './app';
import { setupPwa } from './pwa';
import './styles/app.css';

render(<App />, document.getElementById('app')!);
setupPwa();
