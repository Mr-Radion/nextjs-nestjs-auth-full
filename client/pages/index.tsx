import Link from 'next/link';
import { MainLayot } from '../features/common/components';

export default function Home() {
  return (
    <MainLayot>
      <div>Главная</div>
      <Link href="/join">
        <a>Войти</a>
      </Link>
    </MainLayot>
  );
}
