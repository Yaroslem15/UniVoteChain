import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import styles from './Voting.module.css';

function Voting({ walletAddress, isRegistered, contract }) {
  const [votes, setVotes] = useState([]);
  const [newVoteName, setNewVoteName] = useState('');
  const [newVoteOptions, setNewVoteOptions] = useState(['', '']);
  const [newVoteVoters, setNewVoteVoters] = useState(['']);
  const [status, setStatus] = useState('');

  const normalizedWallet = walletAddress ? ethers.getAddress(walletAddress) : null;

  useEffect(() => {
    if (isRegistered && contract) fetchVotes();
  }, [isRegistered, contract]);

  const fetchVotes = async () => {
    try {
      const count = await contract.voteCount();
      const list = [];
      for (let i = 0; i < count; i++) {
        const [name, options, optionVotes, allowedVoters, isActive, creator] = await contract.getVoteDetails(i);
        const [hasVoted, isAllowed] = await contract.getUserVoteStatus(i, walletAddress);
        list.push({
          id: i,
          name,
          options,
          optionVotes: optionVotes.map(v => Number(v)),
          allowedVoters,
          isActive,
          creator: ethers.getAddress(creator),
          hasVoted,
          isAllowed
        });
      }
      setVotes(list);
    } catch (e) {
      setStatus('Ошибка при загрузке: ' + e.message);
    }
  };

  const createVote = async () => {
    const opts = newVoteOptions.map(o => o.trim()).filter(o => o);
    const voters = newVoteVoters.map(v => v.trim()).filter(v => v);
    if (!newVoteName.trim() || opts.length < 2 || voters.length < 1) {
      setStatus('Введите название, минимум 2 опции и минимум 1 адрес');
      return;
    }
    try {
      const tx = await contract.createVote(newVoteName.trim(), opts, voters);
      await tx.wait();
      setStatus('Голосование создано');
      setNewVoteName('');
      setNewVoteOptions(['', '']);
      setNewVoteVoters(['']);
      fetchVotes();
    } catch (e) {
      setStatus('Ошибка создания: ' + e.message);
    }
  };

  const castVote = async (voteId, idx) => {
    try {
      const tx = await contract.vote(voteId, idx);
      await tx.wait();
      setStatus('Голос учтён');
      fetchVotes();
    } catch (e) {
      setStatus('Ошибка при голосовании: ' + e.message);
    }
  };

  const stopVote = async (voteId) => {
    try {
      const tx = await contract.stopVote(voteId);
      await tx.wait();
      setStatus('Голосование завершено');
      fetchVotes();
    } catch (e) {
      setStatus('Ошибка завершения голосования: ' + e.message);
    }
  };

  if (!isRegistered) return <p className={styles.message}>Пожалуйста, зарегистрируйтесь.</p>;

  return (
    <div className={styles.container}>
      <h2>Создать новое голосование</h2>
      <input
        type="text"
        value={newVoteName}
        onChange={e => setNewVoteName(e.target.value)}
        className={styles.input}
        placeholder="Название голосования"
      />

      <div className={styles.listGroup}>
        <label>Варианты:</label>
        {newVoteOptions.map((opt, i) => (
          <div key={i} className={styles.row}>
            <input
              type="text"
              value={opt}
              onChange={e => {
                const arr = [...newVoteOptions]; arr[i] = e.target.value; setNewVoteOptions(arr);
              }}
              className={styles.inputSmall}
              placeholder={`Опция ${i + 1}`}
            />
            <button onClick={() => setNewVoteOptions(newVoteOptions.filter((_, idx) => idx !== i))} className={styles.removeBtn}>×</button>
          </div>
        ))}
        <button onClick={() => setNewVoteOptions([...newVoteOptions, ''])} className={styles.addBtn}>Добавить опцию</button>
      </div>

      <div className={styles.listGroup}>
        <label>Адреса избирателей:</label>
        {newVoteVoters.map((v, i) => (
          <div key={i} className={styles.row}>
            <input
              type="text"
              value={v}
              onChange={e => {
                const arr = [...newVoteVoters]; arr[i] = e.target.value; setNewVoteVoters(arr);
              }}
              className={styles.inputSmall}
              placeholder={`Адрес ${i + 1}`}
            />
            <button onClick={() => setNewVoteVoters(newVoteVoters.filter((_, idx) => idx !== i))} className={styles.removeBtn}>×</button>
          </div>
        ))}
        <button onClick={() => setNewVoteVoters([...newVoteVoters, ''])} className={styles.addBtn}>Добавить адрес</button>
      </div>

      <button onClick={createVote} className={styles.button}>Создать</button>
      {status && <p className={styles.status}>{status}</p>}

      <h2>Текущие голосования</h2>
      {votes.length === 0 ? (
        <p>Нет голосований.</p>
      ) : (
        <ul className={styles.topicList}>
          {votes.map(vote => (
            <li key={vote.id} className={styles.topicItem}>
              <strong>{vote.name}</strong> — {vote.isActive ? 'Активно' : 'Завершено'}
              {normalizedWallet && vote.creator === normalizedWallet && (
                <span className={styles.ownerTag}> (ваше)</span>
              )}
              <div className={styles.options}>  
                {vote.options.map((o, idx) => (
                  <button
                    key={idx}
                    disabled={!vote.isAllowed || vote.hasVoted || !vote.isActive}
                    onClick={() => castVote(vote.id, idx)}
                    className={styles.optionBtn}
                  >
                    {o} ({vote.optionVotes[idx]})
                  </button>
                ))}
              </div>
              {vote.hasVoted && <p>Вы уже голосовали</p>}
              {!vote.isAllowed && <p>Не можете голосовать</p>}
              {normalizedWallet && vote.creator === normalizedWallet && vote.isActive && (
                <button onClick={() => stopVote(vote.id)} className={styles.endBtn}>Завершить</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Voting;