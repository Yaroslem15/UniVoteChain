import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import styles from './Dashboard.module.css';
import { UNIVOTE_ADDRESS } from '../utils/config';
import { UNIVOTE_ABI } from '../utils/contractABI';

function UserDashboard({ walletAddress, isRegistered }) {
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    if (walletAddress) fetchBalance();
  }, [walletAddress]);

  const fetchBalance = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(UNIVOTE_ADDRESS, UNIVOTE_ABI, provider);
      const coinAddress = await contract.uniVoteCoin();
      const coin = new ethers.Contract(coinAddress, ["function balanceOf(address) view returns (uint256)"], provider);
      const raw = await coin.balanceOf(walletAddress);
      setBalance(ethers.formatUnits(raw, 18));
    } catch (err) {
      console.error('Ошибка при получении баланса:', err);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Личный кабинет</h2>
      <p><strong>Ваш адрес:</strong> {walletAddress}</p>
      <p><strong>Статус регистрации:</strong> {isRegistered ? 'Зарегистрирован' : 'Не зарегистрирован'}</p>
      <p><strong>Баланс UniVoteCoin:</strong> {balance !== null ? `${balance} UVC` : 'Загрузка...'}</p>
    </div>
  );
}

export default UserDashboard;