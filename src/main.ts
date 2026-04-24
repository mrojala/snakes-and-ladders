import './styles.css';
import { mountBoard } from './board/view';

const app = document.getElementById('app');
if (!app) throw new Error('#app root element not found');
mountBoard(app);
