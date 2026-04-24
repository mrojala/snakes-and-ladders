import './styles.css';
import { mountSetup } from './ui/setup';
import { mountGame } from './ui/game';

const app = document.getElementById('app');
if (!app) throw new Error('#app root element not found');

function showSetup(): void {
  mountSetup(app!, (choice) => mountGame(app!, choice, showSetup));
}

showSetup();
