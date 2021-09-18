// import styles from '../styles/Home.module.css'
import { MainLayot } from '../features/common/components';
import { 
  LoginForm, 
  FacebookButton, 
  // FacebookButtonReact 
} from '../features/join';

export default function Home() {
  return (
    <MainLayot>
      <LoginForm />
      <FacebookButton />
      {/* <FacebookButtonReact /> */}
    </MainLayot>
  );
}
