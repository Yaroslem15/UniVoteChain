import { useState } from 'react';
import styles from './Registration.module.css';

function Registration({ walletAddress, isRegistered, connectWallet, registerUser }) {
  const [registering, setRegistering] = useState(false);

  const handleRegister = async () => {
    setRegistering(true);
    console.log('Attempting user registration...');
    await registerUser();
    console.log('Registration transaction sent');
    setRegistering(false);
  };

  if (!walletAddress) {
    return (
      <div className={styles.container}>
        <button className={styles.button} onClick={connectWallet}>
          Подключить кошелек
        </button>
      </div>
    );
  }
  if (!isRegistered) {
    return (
      <div className={styles.container}>
        <p>Вы не зарегистрированы.</p>
        <button
          className={styles.button}
          onClick={handleRegister}
          disabled={registering}
        >
          {registering ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </div>
    );
  }
  return (
    <div className={styles.container}>
      <p>Вы зарегистрированы: {walletAddress}</p>
    </div>
  );
}

export default Registration;