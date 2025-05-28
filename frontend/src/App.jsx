import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { UNIVOTE_ADDRESS } from './utils/config';
import { UNIVOTE_ABI } from './utils/contractABI';
import Registration from './components/Registration';
import Voting from './components/Voting';
import UserDashboard from './components/UserDashboard';
import styles from './App.module.css';

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [tab, setTab] = useState('registration');

  useEffect(() => {
    const cached = localStorage.getItem('walletAddress');
    if (cached) connectWallet(cached);
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length) connectWallet(accounts[0]);
        else {
          setWalletAddress(null);
          setIsRegistered(false);
          localStorage.removeItem('walletAddress');
        }
      });
    }
  }, []);

  const connectWallet = async (address = null) => {
    try {
      if (!window.ethereum) throw new Error('MetaMask не установлен');
      const provider = new ethers.BrowserProvider(window.ethereum);
      if (!address) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await provider.listAccounts();
        address = accounts[0];
      }
      const signer = await provider.getSigner();
      setSigner(signer);
      setWalletAddress(address);
      localStorage.setItem('walletAddress', address);
      const contract = new ethers.Contract(UNIVOTE_ADDRESS, UNIVOTE_ABI, signer);
      setContract(contract);
      const registered = await contract.registeredUsers(address);
      setIsRegistered(registered);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      console.log('Ошибка подключения кошелька:', error.message);
    }
  };

  const registerUser = async () => {
    try {
      const tx = await contract.register();
      await tx.wait();
      console.log('User registered on-chain');
      setIsRegistered(true);
    } catch (error) {
      console.error('Registration failed:', error);
      console.log('Ошибка регистрации:', error.message);
    }
  };

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <button onClick={() => setTab('registration')} className={styles.tabButton}>
          Регистрация
        </button>
        <button onClick={() => setTab('voting')} className={styles.tabButton}>
          Голосование
        </button>
        <button onClick={() => setTab('dashboard')} className={styles.tabButton}>
          Кабинет
        </button>
      </nav>
      {tab === 'registration' && (
        <Registration
          walletAddress={walletAddress}
          isRegistered={isRegistered}
          connectWallet={connectWallet}
          registerUser={registerUser}
        />
      )}
      {tab === 'voting' && (
        <Voting
          walletAddress={walletAddress}
          isRegistered={isRegistered}
          contract={contract}
        />
      )}
      {tab === 'dashboard' && (
        <UserDashboard
          walletAddress={walletAddress}
          isRegistered={isRegistered}
        />
      )}
    </div>
  );
}

export default App;