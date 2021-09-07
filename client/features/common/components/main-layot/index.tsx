import styles from './index.module.sass';

export const MainLayot = ({ children }) => {
  return <div className={styles.container}>{children}</div>;
};
